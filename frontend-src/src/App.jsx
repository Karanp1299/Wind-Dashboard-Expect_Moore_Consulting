import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts'
import ChatBot from './components/ChatBot'

const COLORS_PIE = ['#f87171', '#fb923c', '#34d399', '#60a5fa', '#a78bfa', '#94a3b8', '#3b82f6', '#22c55e', '#f59e0b', '#e879f9', '#6366f1']

const MANU_LABELS = { 'Siemens Gamesa Renewable Energy': 'SGRE' }
const BAR_COLOR = '#f87171'
const AREA_COLOR = '#f87171'

const formatCapacity = (v) => {
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`
  return v
}

const CustomTooltip = ({ active, payload, label, suffix = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
      padding: '8px 12px', fontSize: 13, color: '#e2e8f0',
    }}>
      <p style={{ margin: 0, fontWeight: 600, color: '#f87171' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '2px 0 0', color: '#94a3b8' }}>
          {p.name}: <span style={{ color: '#fff' }}>{p.value?.toLocaleString()}{suffix}</span>
        </p>
      ))}
    </div>
  )
}

function ChartCard({ title, children, span = 1 }) {
  return (
    <div style={{
      background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12,
      padding: '20px 16px 12px', gridColumn: span > 1 ? `span ${span}` : undefined,
      display: 'flex', flexDirection: 'column', minHeight: 320,
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 12, letterSpacing: '0.02em' }}>
        {title}
      </h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        {children}
      </div>
    </div>
  )
}

function KPICard({ label, value }) {
  return (
    <div style={{
      background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12,
      padding: '16px 24px', textAlign: 'center', flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#f87171', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#ffffffeb' }}>
        {value}
      </div>
    </div>
  )
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (!value) return null
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {value.toLocaleString()}
    </text>
  )
}

export default function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/kpis_final.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(err => { console.error('KPI load error:', err); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#94a3b8', fontSize: 18 }}>
        Loading dashboard...
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#f87171', fontSize: 18 }}>
        Failed to load dashboard data.
      </div>
    )
  }

  const totalTurbines = data.meta?.rows || data.onshore_offshore?.reduce((s, d) => s + d.count, 0) || 0
  const leadingState = data.top_states?.[0]?.t_state || '—'
  const peakYear = data.top_years?.reduce((a, b) => b.count > a.count ? b : a, data.top_years[0])?.p_year || '—'
  const leadingMfg = data.top_manufacturers?.[0]?.t_manu || '—'

  return (
    <div style={{ padding: '24px 32px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <img src="/cw-logo2026.png" alt="Chasing Winds" style={{ height: 48 }} />
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f87171', margin: 0, lineHeight: 1.2 }}>
            Wind Turbine Intelligence
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Real-time analytics across U.S. wind energy assets
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <KPICard label="Turbines Deployed" value={totalTurbines.toLocaleString()} />
        <KPICard label="Leading State" value={leadingState} />
        <KPICard label="Peak Installation Year" value={String(Math.round(peakYear))} />
        <KPICard label="Leading Manufacturer" value={leadingMfg} />
      </div>

      {/* Charts Grid - full width, 3 columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
      }}>
        {/* Row 1 */}
        <ChartCard title="Turbines by State">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.top_states} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis dataKey="t_state" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Turbines" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Installations by Year">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.top_years} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
              <XAxis
                dataKey="p_year"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                tickFormatter={(v) => String(Math.round(v))}
                angle={-35}
                textAnchor="end"
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Installations" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Onshore vs Offshore Turbines">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.onshore_offshore}
                cx="50%" cy="45%"
                innerRadius="45%" outerRadius="75%"
                dataKey="count" nameKey="type"
                label={renderCustomLabel}
                labelLine={false}
              >
                {data.onshore_offshore.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#6495ED' : '#34d399'} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                formatter={(val) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{val}</span>}
              />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Row 2 */}
        <ChartCard title="Turbines by Manufacturer">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.top_manufacturers} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
              <XAxis
                dataKey="t_manu"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                tickFormatter={(v) => MANU_LABELS[v] || v}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Turbines" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Turbines by County">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.top_counties} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
              <XAxis
                dataKey="t_county"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Turbines" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Installed Capacity (2015–2025)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.capacity_2015_2025} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={AREA_COLOR} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={AREA_COLOR} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="p_year"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCapacity}
              />
              <Tooltip content={<CustomTooltip suffix=" kW" />} />
              <Area type="monotone" dataKey="total_capacity" name="Capacity" stroke={AREA_COLOR} fill="url(#capGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Row 3 */}
        <ChartCard title="Operators by Fleet Size">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.org_size_distribution} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis dataKey="bucket" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="org_count" name="Operators" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Operator Type Breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.org_type_distribution}
                cx="50%" cy="45%"
                innerRadius="40%" outerRadius="72%"
                dataKey="count" nameKey="org_type"
                labelLine={false}
              >
                {data.org_type_distribution.map((_, i) => (
                  <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                formatter={(val) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{val}</span>}
              />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Turbines by Country">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.country_distribution}
                cx="50%" cy="45%"
                innerRadius="40%" outerRadius="72%"
                dataKey="count" nameKey="country"
                labelLine={false}
              >
                {data.country_distribution.map((_, i) => (
                  <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                formatter={(val) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{val}</span>}
              />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Row 4 */}
        <ChartCard title="Turbines by State/Province">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.state_province_distribution}
                cx="50%" cy="45%"
                innerRadius="40%" outerRadius="72%"
                dataKey="count" nameKey="state"
                labelLine={false}
              >
                {data.state_province_distribution.map((_, i) => (
                  <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                formatter={(val) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{val}</span>}
              />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Floating Chatbot */}
      <ChatBot />
    </div>
  )
}
