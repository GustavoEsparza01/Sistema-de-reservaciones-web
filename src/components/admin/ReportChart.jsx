import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const C = {
  bg: '#0a0a0a',
  card: '#111111',
  border: '#2a2a2a',
  gold: '#b8963e',
  text: '#d4c9b8',
  muted: '#555555',
  success: '#6db98a',
  error: '#e05c5c',
  badgePending: '#c9a84c'
}

export default function ReportChart({ appointments }) {
  if (!appointments || appointments.length === 0) {
    return null
  }

  // 1. Data for Bar Chart: Revenue by Service
  const revenueByService = {}
  appointments.forEach(app => {
    if (app.status === 'completed') {
      const serviceName = Array.isArray(app.services) ? app.services[0]?.name : app.services?.name || 'Desconocido'
      const price = Array.isArray(app.services) ? app.services[0]?.price : app.services?.price || 0
      
      if (!revenueByService[serviceName]) {
        revenueByService[serviceName] = 0
      }
      revenueByService[serviceName] += price
    }
  })

  const barData = Object.keys(revenueByService).map(name => ({
    name,
    ingresos: revenueByService[name]
  })).sort((a, b) => b.ingresos - a.ingresos) // sort by revenue

  // 2. Data for Pie Chart: Appointment Status
  let completed = 0, pending = 0, cancelled = 0
  appointments.forEach(app => {
    if (app.status === 'completed') completed++
    else if (app.status === 'pending') pending++
    else cancelled++
  })

  const pieData = [
    { name: 'Completadas', value: completed, color: C.success },
    { name: 'Pendientes', value: pending, color: C.badgePending },
    { name: 'Canceladas', value: cancelled, color: C.error },
  ].filter(d => d.value > 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 30, marginBottom: 20 }}>
      
      {/* Bar Chart */}
      <div style={{ background: '#0d0d0d', border: `0.5px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <h3 style={{ fontSize: 14, color: C.muted, textTransform: 'uppercase', marginBottom: 20, textAlign: 'center' }}>
          Ingresos por Servicio
        </h3>
        {barData.length > 0 ? (
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke={C.muted} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={C.muted} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  cursor={{ fill: 'rgba(184, 150, 62, 0.1)' }}
                  contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }}
                  itemStyle={{ color: C.gold }}
                />
                <Bar dataKey="ingresos" fill={C.gold} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
            Sin datos de ingresos completados
          </div>
        )}
      </div>

      {/* Pie Chart */}
      <div style={{ background: '#0d0d0d', border: `0.5px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <h3 style={{ fontSize: 14, color: C.muted, textTransform: 'uppercase', marginBottom: 20, textAlign: 'center' }}>
          Estado de Citas
        </h3>
        {pieData.length > 0 ? (
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }}
                  itemStyle={{ color: C.text }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12, color: C.muted }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}>
            Sin datos de estado
          </div>
        )}
      </div>

    </div>
  )
}
