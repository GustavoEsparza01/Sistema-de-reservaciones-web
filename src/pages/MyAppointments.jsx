import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const C = {
  bg:      '#0a0a0a',
  card:    '#111111',
  border:  '#2a2a2a',
  gold:    '#b8963e',
  text:    '#d4c9b8',
  muted:   '#555555',
  error:   '#e05c5c',
  success: '#6db98a',
  badgePending: '#c9a84c',
  badgeAccepted: '#4c9dc9',
  badgeCancelled: '#e05c5c',
  badgeCompleted: '#6db98a',
}

const s = {
  page: { minHeight: '100vh', background: C.bg, padding: '40px 20px', fontFamily: "'Georgia', serif", color: C.text },
  container: { maxWidth: 800, margin: '0 auto' },
  title: { fontSize: 28, color: '#e8dcc8', marginBottom: 30, textAlign: 'center' },
  card: { background: C.card, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, cursor: 'pointer', transition: 'all 0.2s' },
  info: { flex: 1, minWidth: 200 },
  serviceName: { fontSize: 18, color: '#e8dcc8', fontWeight: 'bold', marginBottom: 6 },
  detail: { fontSize: 14, color: C.muted, marginBottom: 4 },
  badge: (status) => ({
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#000',
    background: status === 'pending' ? C.badgePending : status === 'accepted' ? C.badgeAccepted : status === 'cancelled' ? C.badgeCancelled : C.badgeCompleted,
    marginBottom: 8
  }),
  btnCancel: { background: 'transparent', border: `1px solid ${C.error}`, color: C.error, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: "'Georgia', serif", fontSize: 13, transition: 'all 0.2s' },
  empty: { textAlign: 'center', color: C.muted, padding: 40, border: `1px dashed ${C.border}`, borderRadius: 12 }
}

export default function MyAppointments() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  async function fetchAppointments() {
    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_at,
        status,
        services ( name ),
        barbers ( profiles ( full_name ) )
      `)
      .eq('client_id', session.user.id)
      .order('scheduled_at', { ascending: false })

    if (error) {
      console.error('Error fetching appointments:', error)
    } else {
      setAppointments(data || [])
    }
    setLoading(false)
  }

  async function handleCancel(id) {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) return

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) {
      alert('Error al cancelar la cita: ' + error.message)
    } else {
      // Actualizar estado local
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: 'cancelled' } : app))
    }
  }

  if (loading) {
    return <div style={s.page}><div style={s.container}>Cargando tus citas...</div></div>
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h2 style={s.title}>Mis Citas</h2>

        {appointments.length === 0 ? (
          <div style={s.empty}>Aún no tienes citas registradas.</div>
        ) : (
          appointments.map(app => {
            const dateObj = new Date(app.scheduled_at)
            const dateStr = dateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            
            // Supabase puede devolver un objeto directo o un arreglo si la relación no es única, manejamos ambos casos por seguridad
            const service = Array.isArray(app.services) ? app.services[0] : app.services
            const barber = Array.isArray(app.barbers) ? app.barbers[0] : app.barbers
            
            const serviceName = service?.name || 'Corte general'
            const barberName = barber?.profiles?.full_name || 'Barbero asignado'

            return (
              <div 
                key={app.id} 
                className="mobile-col mobile-card-stack hover-card" 
                style={s.card}
                onClick={() => navigate(`/my-appointments/${app.id}`)}
              >
                <div style={s.info}>
                  <div style={s.badge(app.status)}>
                    {app.status === 'pending' ? 'Pendiente' : app.status === 'accepted' ? 'Confirmada' : app.status === 'cancelled' ? 'Cancelada' : 'Completada'}
                  </div>
                  <div style={s.serviceName}>{serviceName}</div>
                  <div style={s.detail}>📅 {dateStr} a las {timeStr}</div>
                  <div style={s.detail}>✂️ Con: {barberName}</div>
                </div>
                
                <div style={{ color: C.gold, fontSize: 14 }}>
                  Ver detalles ➔
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
