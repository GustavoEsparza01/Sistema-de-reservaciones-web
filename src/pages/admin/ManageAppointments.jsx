import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const C = {
  bg: '#0a0a0a',
  card: '#111111',
  border: '#2a2a2a',
  gold: '#b8963e',
  text: '#d4c9b8',
  muted: '#555555',
  error: '#e05c5c',
  success: '#6db98a',
  badgePending: '#c9a84c',
  badgeAccepted: '#4c9dc9',
  badgeCancelled: '#e05c5c',
  badgeCompleted: '#6db98a',
}

const s = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 32
  },
  statCard: {
    background: C.card,
    border: `0.5px solid ${C.border}`,
    borderRadius: 12,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 28,
    color: '#e8dcc8',
    fontWeight: 'bold',
    fontFamily: "'Georgia', serif",
    margin: '8px 0 4px',
  },
  statLabel: {
    fontSize: 13,
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableWrapper: {
    background: C.card,
    border: `0.5px solid ${C.border}`,
    borderRadius: 12,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '16px 20px',
    borderBottom: `0.5px solid ${C.border}`,
    color: C.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'normal',
  },
  td: {
    padding: '16px 20px',
    borderBottom: `0.5px solid ${C.border}`,
    color: C.text,
    fontSize: 14,
  },
  btn: (type) => ({
    padding: '6px 12px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: "'Georgia', serif",
    background: type === 'complete' ? C.success : 'transparent',
    color: type === 'complete' ? '#000' : C.error,
    border: type === 'cancel' ? `1px solid ${C.error}` : 'none',
    marginRight: type === 'complete' ? 8 : 0,
  }),
  badge: (status) => ({
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#000',
    background: status === 'pending' ? C.badgePending : status === 'accepted' ? C.badgeAccepted : status === 'cancelled' ? C.badgeCancelled : C.badgeCompleted,
  })
}

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Stats
  const [stats, setStats] = useState({
    todayRevenue: 0,
    monthRevenue: 0,
    todayCompleted: 0,
    todayPending: 0,
    tomorrowAppointments: 0,
  })

  useEffect(() => {
    fetchAppointments()
  }, [])

  async function fetchAppointments() {
    setLoading(true)
    
    // Asumimos que la relación de client_id apunta directamente a profiles
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_at,
        status,
        notes,
        services ( name, price ),
        barbers ( profiles ( full_name ) ),
        client:profiles!appointments_client_id_fkey ( full_name, phone )
      `)
      .order('scheduled_at', { ascending: false })

    if (error) {
      console.error('Error fetching appointments:', error)
      // Si falla por la clave foránea, reintentar con el nombre básico
      if (error.message.includes('foreign key')) {
        const fallback = await supabase.from('appointments').select(`
          id, scheduled_at, status, services(name, price), barbers(profiles(full_name)), profiles(full_name, phone)
        `).order('scheduled_at', { ascending: false })
        if (fallback.data) processAppointments(fallback.data)
      }
    } else {
      processAppointments(data || [])
    }
    setLoading(false)
  }

  function processAppointments(data) {
    setAppointments(data)

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let todayRev = 0
    let monthRev = 0
    let todayComp = 0
    let todayPend = 0
    let tomAppts = 0

    data.forEach(app => {
      const appDate = new Date(app.scheduled_at)
      const dateStr = appDate.toISOString().split('T')[0]
      const isToday = dateStr === todayStr
      const isTomorrow = dateStr === tomorrowStr
      const isThisMonth = appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear
      
      const service = Array.isArray(app.services) ? app.services[0] : app.services
      const price = service?.price || 0

      if (isThisMonth && app.status === 'completed') monthRev += price

      if (isToday) {
        if (app.status === 'completed') {
          todayRev += price
          todayComp++
        } else if (app.status === 'pending') {
          todayPend++
        }
      }

      if (isTomorrow && app.status !== 'cancelled') {
        tomAppts++
      }
    })

    setStats({
      todayRevenue: todayRev,
      monthRevenue: monthRev,
      todayCompleted: todayComp,
      todayPending: todayPend,
      tomorrowAppointments: tomAppts,
    })
  }

  async function updateStatus(id, newStatus) {
    if (newStatus === 'cancelled' && !window.confirm('¿Seguro que deseas cancelar esta cita?')) return

    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('Error al actualizar: ' + error.message)
    } else {
      // Refetch to cleanly update stats and list
      fetchAppointments()
    }
  }

  if (loading) return <div>Cargando panel...</div>

  return (
    <div>
      {/* Tarjetas de Estadísticas */}
      <div style={s.statsGrid}>
        <div style={{ ...s.statCard, borderColor: C.gold }}>
          <div style={s.statLabel}>Ingresos Hoy</div>
          <div style={{ ...s.statValue, color: C.gold }}>${stats.todayRevenue}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>Ingresos Mes</div>
          <div style={s.statValue}>${stats.monthRevenue}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>Atendidas Hoy</div>
          <div style={s.statValue}>{stats.todayCompleted}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>Pendientes Hoy</div>
          <div style={s.statValue}>{stats.todayPending}</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statLabel}>Citas Mañana</div>
          <div style={s.statValue}>{stats.tomorrowAppointments}</div>
        </div>
      </div>

      <h2 style={{ fontSize: 18, color: '#e8dcc8', marginBottom: 16 }}>Todas las Citas</h2>
      
      {/* Tabla */}
      <div style={{ ...s.tableWrapper, overflowX: 'auto' }}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Cliente</th>
              <th style={s.th}>Fecha y Hora</th>
              <th style={s.th}>Servicio</th>
              <th style={s.th}>Barbero</th>
              <th style={s.th}>Estado</th>
              <th style={s.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ ...s.td, textAlign: 'center', color: C.muted }}>No hay citas registradas.</td>
              </tr>
            ) : (
              appointments.map(app => {
                const dateObj = new Date(app.scheduled_at)
                const dateStr = dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })
                const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                
                const service = Array.isArray(app.services) ? app.services[0] : app.services
                const barber = Array.isArray(app.barbers) ? app.barbers[0] : app.barbers
                const client = app.client || (Array.isArray(app.profiles) ? app.profiles[0] : app.profiles)

                return (
                  <tr key={app.id}>
                    <td style={s.td}>
                      <div style={{ color: '#e8dcc8', fontWeight: 'bold' }}>{client?.full_name || 'Sin nombre'}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{client?.phone || 'Sin teléfono'}</div>
                    </td>
                    <td style={s.td}>
                      <div>{dateStr}</div>
                      <div style={{ color: C.gold }}>{timeStr}</div>
                    </td>
                    <td style={s.td}>
                      <div>{service?.name || 'Corte'}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>${service?.price || 0}</div>
                    </td>
                    <td style={s.td}>{barber?.profiles?.full_name || 'Asignado'}</td>
                    <td style={s.td}>
                      <span style={s.badge(app.status)}>
                        {app.status === 'pending' ? 'Pendiente' : app.status === 'accepted' ? 'Confirmada' : app.status === 'completed' ? 'Completada' : 'Cancelada'}
                      </span>
                      {app.status === 'completed' && app.notes && (
                        <div style={{ marginTop: 6, fontSize: 11, color: C.muted, fontStyle: 'italic', maxWidth: 150 }}>
                          "{app.notes}"
                        </div>
                      )}
                    </td>
                    <td style={s.td}>
                      {(app.status === 'pending' || app.status === 'accepted') && (
                        <div style={{ display: 'flex' }}>
                          <button style={s.btn('complete')} onClick={() => updateStatus(app.id, 'completed')}>✓</button>
                          <button style={s.btn('cancel')} onClick={() => updateStatus(app.id, 'cancelled')}>✕</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
