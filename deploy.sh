#!/bin/bash
set -e

DEPLOY_DIR="/usr/share/nginx/html"
REPO_DIR="$HOME"
FRONTEND_DIR="$REPO_DIR/frontend"
BACKUP_DIR="/tmp/nginx-html-backup-$(date +%Y%m%d%H%M%S)"

echo "========================================="
echo "  Wind Dashboard — Production Deploy"
echo "========================================="

# 1. Pull latest from GitHub
echo ""
echo "[1/5] Pulling latest code from GitHub..."
cd "$REPO_DIR"
git pull origin main
echo "  ✓ Code updated"

# 2. Verify build files exist
echo ""
echo "[2/5] Verifying build files..."
if [ ! -f "$FRONTEND_DIR/index.html" ]; then
    echo "  ✗ ERROR: frontend/index.html not found. Aborting."
    exit 1
fi
if ! ls "$FRONTEND_DIR/assets/"*.js 1>/dev/null 2>&1; then
    echo "  ✗ ERROR: No JS files in frontend/assets/. Aborting."
    exit 1
fi
if ! ls "$FRONTEND_DIR/assets/"*.css 1>/dev/null 2>&1; then
    echo "  ✗ ERROR: No CSS files in frontend/assets/. Aborting."
    exit 1
fi
echo "  ✓ Build files verified"

# 3. Backup current deployment
echo ""
echo "[3/5] Backing up current deployment to $BACKUP_DIR..."
sudo cp -r "$DEPLOY_DIR" "$BACKUP_DIR"
echo "  ✓ Backup created"

# 4. Deploy new files
echo ""
echo "[4/5] Deploying new files to $DEPLOY_DIR..."
sudo rm -rf "$DEPLOY_DIR/assets"
sudo mkdir -p "$DEPLOY_DIR/assets"
sudo cp "$FRONTEND_DIR/index.html" "$DEPLOY_DIR/"
sudo cp "$FRONTEND_DIR/assets/"* "$DEPLOY_DIR/assets/"
sudo cp "$FRONTEND_DIR/kpis_final.json" "$DEPLOY_DIR/" 2>/dev/null || true
sudo cp "$FRONTEND_DIR/cw-logo2026.png" "$DEPLOY_DIR/" 2>/dev/null || true
sudo cp "$FRONTEND_DIR/vite.svg" "$DEPLOY_DIR/" 2>/dev/null || true
echo "  ✓ Files deployed"

# 5. Update nginx config and reload
echo ""
echo "[5/5] Updating nginx config and reloading..."
if [ -f "$REPO_DIR/nginx.conf" ]; then
    sudo cp "$REPO_DIR/nginx.conf" /etc/nginx/nginx.conf
fi
sudo nginx -t 2>&1
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "  ✓ Nginx reloaded successfully"
else
    echo "  ✗ Nginx config test failed! Restoring backup..."
    sudo cp -r "$BACKUP_DIR/"* "$DEPLOY_DIR/"
    echo "  ✓ Backup restored. No changes applied."
    exit 1
fi

echo ""
echo "========================================="
echo "  ✓ Deploy complete!"
echo "  Live at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'your-ec2-ip')"
echo "========================================="
