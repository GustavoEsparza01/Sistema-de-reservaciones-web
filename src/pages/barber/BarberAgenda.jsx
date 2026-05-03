import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

const C = {
  bg: '#0a0a0a', card: '#111111', border: '#2a2a2a',
  gold: '#b8963e', text: '#d4c9b8', muted: '#555555',
  success: '#6db98a', error: '#e05c5c', info: '#4c9dc9', input: '#0d0d0d'
}

const s = {
  page: { minHeight: '100vh', background: C.bg, padding: '40px 20px', fontFamily: "'Georgia', serif", color: C.text },
  container: { maxWidth: 800, margin: '0 auto' },
  title: { fontSize: 28, color: '#e8dcc8', marginBottom: 30, textAlign: 'center' },
  card: { background: C.card, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: `1px solid ${C.border}`, paddingBottom: 12 },
  service: { fontSize: 18, color: '#e8dcc8', fontWeight: 'bold' },
  time: { fontSize: 14, color: C.gold, fontWeight: 'bold' },
  detail: { fontSize: 14, color: C.muted, marginBottom: 4 },
  badge: (status) => ({
    display: 'inline-block', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: '#000',
    background: status === 'pending' ? '#c9a84c' : status === 'accepted' ? C.info : status === 'completed' ? C.success : C.error
  }),
  btnGroup: { display: 'flex', gap: 10, marginTop: 16 },
  btn: (type) => ({
    flex: 1, padding: 10, borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontFamily: "'Georgia', serif", fontSize: 13,
    background: type === 'accept' ? C.info : type === 'complete' ? C.success : C.gold,
    color: '#000'
  }),
  textarea: {
    width: '100%', background: C.input, border: `0.5px solid ${C.border}`, color: C.text, padding: 12, borderRadius: 8, fontSize: 14, fontFamily: "'Georgia', serif", outline: 'none', minHeight: 80, marginTop: 12, boxSizing: 'border-box'
  },
  notesBox: {
    marginTop: 12, padding: 12, background: C.input, border: `1px dashed ${C.border}`, borderRadius: 8, fontSize: 13, color: C.muted, fontStyle: 'italic'
  }
}

export default function BarberAgenda() {
  const { barberId } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Estado para el modal/form de completar corte
  const [completingId, setCompletingId] = useState(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Estado para la biografía
  const [bio, setBio] = useState('')
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [savingBio, setSavingBio] = useState(false)

  // Estadísticas diarias
  const [stats, setStats] = useState({ pendingToday: 0, completedToday: 0, revenueToday: 0 })

  useEffect(() => {
    if (barberId) fetchAgenda()
  }, [barberId])

  async function fetchAgenda() {
    if (!barberId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services ( name ),
        profiles!appointments_client_id_fkey ( full_name, phone )
      `)
      .eq('barber_id', barberId)
      .order('scheduled_at', { ascending: true })

    if (error) {
      console.error(error)
    } else {
      const apps = data || []
      setAppointments(apps)
      calculateStats(apps)
    }

    // Cargar bio del barbero
    const { data: bData } = await supabase.from('barbers').select('bio').eq('id', barberId).single()
    if (bData && bData.bio) setBio(bData.bio)
    
    setLoading(false)
  }

  function calculateStats(apps) {
    const todayStr = new Date().toISOString().split('T')[0]
    let pending = 0, completed = 0, revenue = 0

    apps.forEach(app => {
      const isToday = app.scheduled_at.startsWith(todayStr)
      if (isToday) {
        if (app.status === 'pending' || app.status === 'accepted') pending++
        if (app.status === 'completed') {
          completed++
          const service = Array.isArray(app.services) ? app.services[0] : app.services
          revenue += (service?.price || 0)
        }
      }
    })

    setStats({ pendingToday: pending, completedToday: completed, revenueToday: revenue })
  }

  async function handleSaveBio(e) {
    e.preventDefault()
    setSavingBio(true)
    const { error } = await supabase.from('barbers').update({ bio }).eq('id', barberId)
    if (error) alert('Error guardando biografía: ' + error.message)
    else setIsEditingBio(false)
    setSavingBio(false)
  }

  async function acceptAppointment(id) {
    if (!window.confirm('¿Deseas aceptar esta cita? El cliente será notificado de tu confirmación.')) return
    
    const { error } = await supabase.from('appointments').update({ status: 'accepted' }).eq('id', id)
    if (error) alert('Error: ' + error.message)
    else fetchAgenda()
  }

  async function completeAppointment(e, id) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'completed', notes: notes })
      .eq('id', id)

    if (error) alert('Error: ' + error.message)
    else {
      setCompletingId(null)
      setNotes('')
      fetchAgenda()
    }
    setSaving(false)
  }

  if (loading) return <div style={s.page}><div style={s.container}>Cargando tu agenda...</div></div>

  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h2 style={s.title}>Panel de Barbero</h2>

        {/* Sección de Biografía */}
        <div style={{ ...s.card, borderColor: C.gold, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#e8dcc8' }}>Mi Biografía (Pública)</h3>
            {!isEditingBio && (
              <button style={s.btn('default')} onClick={() => setIsEditingBio(true)}>Editar</button>
            )}
          </div>
          {isEditingBio ? (
            <form onSubmit={handleSaveBio}>
              <textarea 
                style={s.textarea} 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                placeholder="Ej. Especialista en grecas y desvanecidos..." 
                maxLength={200}
              />
              <div style={s.btnGroup}>
                <button type="submit" style={s.btn('complete')} disabled={savingBio}>{savingBio ? 'Guardando...' : 'Guardar'}</button>
                <button type="button" style={{...s.btn('default'), background: 'transparent', color: C.error, border: `1px solid ${C.error}`}} onClick={() => setIsEditingBio(false)}>Cancelar</button>
              </div>
            </form>
          ) : (
            <p style={{ color: C.muted, fontStyle: 'italic', margin: 0, fontSize: 14 }}>
              {bio ? `"${bio}"` : 'No tienes una biografía escrita. Escribe algo para que los clientes te conozcan mejor.'}
            </p>
          )}
        </div>

        {/* Sección de Estadísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <div style={{ ...s.card, marginBottom: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 24, color: C.gold, fontWeight: 'bold' }}>{stats.pendingToday}</div>
            <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase' }}>Cortes Restantes Hoy</div>
          </div>
          <div style={{ ...s.card, marginBottom: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 24, color: C.success, fontWeight: 'bold' }}>{stats.completedToday}</div>
            <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase' }}>Completados Hoy</div>
          </div>
          <div style={{ ...s.card, marginBottom: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 24, color: '#e8dcc8', fontWeight: 'bold' }}>${stats.revenueToday}</div>
            <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase' }}>Ingresos Hoy</div>
          </div>
        </div>

        <h3 style={{ fontSize: 20, color: '#e8dcc8', marginBottom: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>Mi Agenda</h3>

        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.muted, padding: 40, border: `1px dashed ${C.border}`, borderRadius: 12 }}>
            No tienes citas asignadas por el momento.
          </div>
        ) : (
          appointments.map(app => {
            const dateObj = new Date(app.scheduled_at)
            const isToday = dateObj.toISOString().split('T')[0] === today
            const dateStr = isToday ? 'HOY' : dateObj.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })
            const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            
            const service = Array.isArray(app.services) ? app.services[0] : app.services
            const client = app.profiles

            const isCompleting = completingId === app.id

            return (
              <div key={app.id} style={s.card}>
                <div style={s.header}>
                  <div>
                    <div style={s.badge(app.status)}>
                      {app.status === 'pending' ? 'Pendiente' : app.status === 'accepted' ? 'Confirmada' : app.status === 'completed' ? 'Completada' : 'Cancelada'}
                    </div>
                  </div>
                  <div style={{ ...s.time, color: isToday ? C.success : C.gold }}>
                    {dateStr} - {timeStr} hrs
                  </div>
                </div>

                <div style={s.service}>{service?.name || 'Servicio General'}</div>
                <div style={{ marginTop: 8 }}>
                  <div style={s.detail}>👤 Cliente: <strong style={{ color: '#e8dcc8' }}>{client?.full_name || 'Desconocido'}</strong></div>
                  <div style={s.detail}>📞 Tel: {client?.phone || 'No registrado'}</div>
                </div>

                {/* Mostrar Notas si ya está completada */}
                {app.status === 'completed' && app.notes && (
                  <div style={s.notesBox}>
                    <strong>Detalles del corte:</strong> {app.notes}
                  </div>
                )}

                {/* Formulario de Completar */}
                {isCompleting && (
                  <form onSubmit={(e) => completeAppointment(e, app.id)} style={{ marginTop: 16, borderTop: `1px dashed ${C.border}`, paddingTop: 16 }}>
                    <label style={{ color: C.gold, fontSize: 13, fontWeight: 'bold' }}>Detalles / Notas del corte:</label>
                    <textarea 
                      style={s.textarea} 
                      placeholder="Ej. Desvanecido medio con patilla cuadrada, se usó navaja al 1.5..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      required
                    />
                    <div style={s.btnGroup}>
                      <button type="submit" style={s.btn('complete')} disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar y Finalizar'}
                      </button>
                      <button type="button" style={{ ...s.btn('default'), background: 'transparent', border: `1px solid ${C.error}`, color: C.error }} onClick={() => setCompletingId(null)}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                {/* Botones de Acción Normales */}
                {!isCompleting && (
                  <div style={s.btnGroup}>
                    {app.status === 'pending' && (
                      <button style={s.btn('accept')} onClick={() => acceptAppointment(app.id)}>
                        Aceptar Cita
                      </button>
                    )}
                    
                    {app.status === 'accepted' && (
                      <button style={s.btn('complete')} onClick={() => { setCompletingId(app.id); setNotes(''); }}>
                        Finalizar Corte
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
