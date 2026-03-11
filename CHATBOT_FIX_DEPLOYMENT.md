# Chatbot Bedrock Fix Deployment Guide

## Problem
The chatbot was failing with: `Bedrock error: An error occurred (ValidationException) when calling the InvokeModel operation: The provided model identifier is invalid.`

## Root Cause
Invalid model ID `openai.gpt-oss-120b-1:0` which doesn't exist in AWS Bedrock.

## Solution Applied
1. Changed model ID to `anthropic.claude-3-haiku-20240307-v1:0` (valid Bedrock model)
2. Updated API call format from OpenAI to Claude format
3. Updated response parsing to handle Claude's response structure

## Deployment Steps

### 1. SSH into EC2 Instance
```bash
ssh -i your-key.pem ec2-user@18.214.60.24
```

### 2. Navigate to Chatbot Directory
```bash
cd ~/chatbot
```

### 3. Backup Current App
```bash
cp app.py app.py.backup
```

### 4. Pull Updated Code
```bash
cd ~
git pull origin main
```

### 5. Copy Fixed App File
```bash
cp ~/Wind-Dashboard-Expect_Moore_Consulting/chatbot/app.py ~/chatbot/app.py
```

### 6. Restart Chatbot Service
```bash
# Find the running process
ps aux | grep uvicorn

# Kill the existing process (replace PID with actual process ID)
kill <PID>

# Restart the chatbot
cd ~/chatbot
nohup uvicorn app:app --host 0.0.0.0 --port 8000 > server.log 2>&1 &
```

### 7. Verify Deployment
```bash
# Check if service is running
curl http://localhost:8000/health

# Check logs for errors
tail -f server.log
```

### 8. Test Chatbot
Visit http://18.214.60.24/ and test the chatbot with a simple question like "Installations by Year?"

## Required AWS Permissions
Ensure the EC2 instance's IAM role has:
- `bedrock:InvokeModel` for Claude models
- `s3:GetObject` and `s3:PutObject` for the S3 bucket
- Access to the specific model: `arn:aws:bedrock:us-east-1::model/anthropic.claude-3-haiku-20240307-v1:0`

## Troubleshooting
If still getting errors:
1. Verify Bedrock model access in AWS Console
2. Check IAM role permissions
3. Verify region is `us-east-1`
4. Check S3 bucket access permissions
