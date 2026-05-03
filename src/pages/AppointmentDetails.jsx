import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  input:   '#0d0d0d',
}

const s = {
  page: { minHeight: '100vh', background: C.bg, padding: '40px 20px', fontFamily: "'Georgia', serif", color: C.text },
  container: { maxWidth: 600, margin: '0 auto', background: C.card, border: `0.5px solid ${C.border}`, borderRadius: 16, padding: 32 },
  title: { fontSize: 24, color: '#e8dcc8', marginBottom: 24, textAlign: 'center', borderBottom: `0.5px solid ${C.border}`, paddingBottom: 16 },
  detailRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 16, borderBottom: `1px dashed ${C.border}`, paddingBottom: 8 },
  label: { color: C.muted, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  value: { color: '#e8dcc8', fontSize: 16, fontWeight: 'bold' },
  btnGroup: { display: 'flex', gap: 12, marginTop: 32 },
  btn: (type) => ({
    flex: 1,
    padding: 14,
    borderRadius: 8,
    border: type === 'cancel' ? `1px solid ${C.error}` : 'none',
    background: type === 'edit' ? C.gold : 'transparent',
    color: type === 'edit' ? '#000' : type === 'cancel' ? C.error : C.text,
    cursor: 'pointer',
    fontWeight: 'bold',
    fontFamily: "'Georgia', serif",
    fontSize: 14,
  }),
  formField: { marginBottom: 16 },
  input: { width: '100%', background: C.input, border: `0.5px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: 8, fontSize: 14, fontFamily: "'Georgia', serif", outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', background: C.input, border: `0.5px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: 8, fontSize: 14, fontFamily: "'Georgia', serif", outline: 'none' },
}

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
]

export default function AppointmentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  
  // Datos para modificación
  const [barbers, setBarbers] = useState([])
  const [editData, setEditData] = useState({ barberId: '', date: '', time: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAppointment()
    fetchBarbers()
  }, [id])

  async function fetchAppointment() {
    setLoading(true)
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services ( name, price ),
        barbers ( profiles ( full_name ) )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error(error)
      alert('No se pudo cargar la cita.')
      navigate('/my-appointments')
      return
    }

    if (data.client_id !== session.user.id) {
      alert('No tienes permiso para ver esta cita.')
      navigate('/my-appointments')
      return
    }

    setAppointment(data)
    
    // Inicializar datos de edición
    const dateObj = new Date(data.scheduled_at)
    setEditData({
      barberId: data.barber_id,
      date: dateObj.toISOString().split('T')[0],
      time: dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    })
    
    setLoading(false)
  }

  async function fetchBarbers() {
    const { data } = await supabase.from('barbers').select('id, profiles(full_name)').eq('is_active', true)
    if (data) {
      setBarbers(data.map(b => ({ id: b.id, name: b.profiles?.full_name || 'Barbero' })))
    }
  }

  async function handleCancel() {
    if (!window.confirm('¿Seguro que deseas cancelar esta cita?')) return
    const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
    if (!error) fetchAppointment()
    else alert('Error al cancelar: ' + error.message)
  }

  async function handleSaveModification(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const scheduledAt = new Date(`${editData.date}T${editData.time}:00`)
      const endsAt = new Date(scheduledAt.getTime() + 60 * 60000)

      const { error } = await supabase
        .from('appointments')
        .update({
          barber_id: editData.barberId,
          scheduled_at: scheduledAt.toISOString(),
          ends_at: endsAt.toISOString()
        })
        .eq('id', id)

      if (error) throw error
      
      setIsEditing(false)
      fetchAppointment() // recargar los datos
    } catch (err) {
      setError(err.message || 'Error al modificar la cita. El horario podría estar ocupado.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !appointment) return <div style={s.page}><div style={s.container}>Cargando ticket...</div></div>

  const service = Array.isArray(appointment.services) ? appointment.services[0] : appointment.services
  const barber = Array.isArray(appointment.barbers) ? appointment.barbers[0] : appointment.barbers
  const dateObj = new Date(appointment.scheduled_at)
  const dateStr = dateObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={s.page}>
      <button onClick={() => navigate('/my-appointments')} style={{ background: 'transparent', border: 'none', color: C.gold, cursor: 'pointer', marginBottom: 20, fontFamily: "'Georgia', serif", fontSize: 16 }}>
        ← Volver a mis citas
      </button>

      <div style={s.container}>
        <h2 style={s.title}>Resumen de tu Cita</h2>

        {!isEditing ? (
          <>
            <div style={s.detailRow}>
              <span style={s.label}>Servicio Seleccionado</span>
              <span style={s.value}>{service?.name || 'Corte General'}</span>
            </div>
            
            <div style={s.detailRow}>
              <span style={s.label}>Precio Total</span>
              <span style={{ ...s.value, color: C.gold }}>${service?.price || 0}</span>
            </div>

            <div style={s.detailRow}>
              <span style={s.label}>Barbero</span>
              <span style={s.value}>{barber?.profiles?.full_name || 'Asignado'}</span>
            </div>

            <div style={s.detailRow}>
              <span style={s.label}>Fecha</span>
              <span style={s.value} style={{ textTransform: 'capitalize', ...s.value }}>{dateStr}</span>
            </div>

            <div style={s.detailRow}>
              <span style={s.label}>Hora</span>
              <span style={s.value}>{timeStr} hrs</span>
            </div>

            <div style={{ ...s.detailRow, borderBottom: 'none' }}>
              <span style={s.label}>Estado</span>
              <span style={{ ...s.value, color: appointment.status === 'pending' ? '#c9a84c' : appointment.status === 'accepted' ? '#4c9dc9' : appointment.status === 'completed' ? C.success : C.error }}>
                {appointment.status === 'pending' ? 'PENDIENTE' : appointment.status === 'accepted' ? 'CONFIRMADA' : appointment.status === 'completed' ? 'COMPLETADA' : 'CANCELADA'}
              </span>
            </div>

            {appointment.status === 'completed' && appointment.notes && (
              <div style={{ padding: 16, background: '#1a1a1a', border: `1px dashed ${C.border}`, borderRadius: 8, marginTop: 16 }}>
                <div style={{ ...s.label, marginBottom: 8 }}>Notas del Barbero:</div>
                <div style={{ fontSize: 14, color: '#e8dcc8', fontStyle: 'italic' }}>"{appointment.notes}"</div>
              </div>
            )}

            {appointment.status === 'pending' && (
              <div style={s.btnGroup}>
                <button style={s.btn('edit')} onClick={() => setIsEditing(true)}>Reprogramar / Modificar</button>
                <button style={s.btn('cancel')} onClick={handleCancel}>Cancelar Cita</button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSaveModification}>
            <h3 style={{ color: C.gold, marginBottom: 20 }}>Modificar Cita</h3>
            
            <div style={s.formField}>
              <label style={s.label}>Cambiar Barbero</label>
              <select 
                style={s.select} 
                value={editData.barberId} 
                onChange={e => setEditData({...editData, barberId: e.target.value})}
              >
                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div style={s.formField}>
              <label style={s.label}>Nueva Fecha</label>
              <input 
                type="date" 
                style={{ ...s.input, colorScheme: 'dark', cursor: 'pointer' }} 
                value={editData.date} 
                onChange={e => setEditData({...editData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]} 
              />
            </div>

            <div style={s.formField}>
              <label style={s.label}>Nueva Hora</label>
              <select 
                style={s.select} 
                value={editData.time} 
                onChange={e => setEditData({...editData, time: e.target.value})}
              >
                <option value="">-- Hora --</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {error && <p style={{ color: C.error, fontSize: 13, marginBottom: 15 }}>{error}</p>}

            <div style={s.btnGroup}>
              <button type="submit" style={s.btn('edit')} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button type="button" style={s.btn('default')} onClick={() => setIsEditing(false)}>
                Cancelar Edición
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
