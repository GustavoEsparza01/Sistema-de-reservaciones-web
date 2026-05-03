import { useState, useEffect } from 'react'
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
  input:   '#0d0d0d',
  label:   '#666666',
  error:   '#e05c5c',
  success: '#6db98a',
}

const s = {
  page: { minHeight: '100vh', background: C.bg, padding: '40px 20px', fontFamily: "'Georgia', serif", color: C.text },
  container: { maxWidth: 600, margin: '0 auto', background: C.card, border: `0.5px solid ${C.border}`, borderRadius: 16, padding: 32 },
  title: { fontSize: 24, color: '#e8dcc8', marginBottom: 24, textAlign: 'center' },
  field: { marginBottom: 20 },
  label: { display: 'block', fontSize: 12, color: C.label, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  select: { width: '100%', background: C.input, border: `0.5px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: 8, fontSize: 14, fontFamily: "'Georgia', serif", outline: 'none' },
  input: { width: '100%', background: C.input, border: `0.5px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: 8, fontSize: 14, fontFamily: "'Georgia', serif", outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', background: C.gold, color: '#000', border: 'none', padding: 14, borderRadius: 8, fontSize: 15, fontWeight: 'bold', fontFamily: "'Georgia', serif", cursor: 'pointer', marginTop: 10 },
  error: { color: C.error, fontSize: 13, marginBottom: 15, textAlign: 'center' },
  success: { color: C.success, fontSize: 13, marginBottom: 15, textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }
}

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
]

export default function BookAppointment() {
  const { session } = useAuth()
  const navigate = useNavigate()

  const [services, setServices] = useState([])
  const [barbers, setBarbers] = useState([])
  
  const [formData, setFormData] = useState({
    serviceId: '',
    barberId: '',
    date: '',
    time: ''
  })
  
  const [bookedSlots, setBookedSlots] = useState([])

  const [loadingData, setLoadingData] = useState(true)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadData() {
      // Cargar servicios
      const { data: srvData, error: srvError } = await supabase.from('services').select('*').eq('is_active', true)
      if (!srvError && srvData) setServices(srvData)

      // Cargar barberos
      const { data: bData, error: bError } = await supabase.from('barbers').select('id, profiles(full_name)').eq('is_active', true)
      if (!bError && bData) {
        setBarbers(bData.map(b => ({ id: b.id, name: b.profiles?.full_name || 'Barbero' })))
      }

      setLoadingData(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    async function checkAvailability() {
      if (!formData.date || !formData.barberId) {
        setBookedSlots([])
        return
      }

      // Convertir fechas locales a ISO para buscar en la base de datos
      const localStart = new Date(`${formData.date}T00:00:00`).toISOString()
      const localEnd = new Date(`${formData.date}T23:59:59`).toISOString()

      const { data, error } = await supabase
        .from('appointments')
        .select('scheduled_at')
        .eq('barber_id', formData.barberId)
        .gte('scheduled_at', localStart)
        .lte('scheduled_at', localEnd)
        .neq('status', 'cancelled')

      if (!error && data) {
        const taken = data.map(app => {
          const d = new Date(app.scheduled_at)
          const hh = String(d.getHours()).padStart(2, '0')
          const mm = String(d.getMinutes()).padStart(2, '0')
          return `${hh}:${mm}`
        })
        setBookedSlots(taken)
      }
    }
    checkAvailability()
  }, [formData.date, formData.barberId])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.serviceId || !formData.barberId || !formData.date || !formData.time) {
      setError('Por favor completa todos los campos.')
      return
    }

    setLoadingSubmit(true)

    // Crear fechas (agregando la hora local)
    const scheduledAt = new Date(`${formData.date}T${formData.time}:00`)
    // Asumimos 60 minutos de duración
    const endsAt = new Date(scheduledAt.getTime() + 60 * 60000)

    try {
      // Insertar en appointments
      const { data: apptData, error: apptError } = await supabase
        .from('appointments')
        .insert([{
          client_id: session.user.id,
          barber_id: formData.barberId,
          service_id: formData.serviceId,
          scheduled_at: scheduledAt.toISOString(),
          ends_at: endsAt.toISOString(),
          duration_min: 60,
          status: 'pending'
        }])
        .select()
        .single()

      if (apptError) throw apptError

      // Insertar también en la tabla intermedia appointment_services
      const service = services.find(s => s.id === formData.serviceId)
      const { error: servError } = await supabase
        .from('appointment_services')
        .insert([{
          appointment_id: apptData.id,
          service_id: formData.serviceId,
          price_at_booking: service?.price || 0
        }])

      if (servError) console.error("Error al ligar servicio:", servError)

      setSuccess('¡Cita agendada con éxito!')
      setFormData({ serviceId: '', barberId: '', date: '', time: '' })
      
      // Redirigir a 'Mis citas' después de un rato
      setTimeout(() => {
        navigate('/my-appointments')
      }, 2000)

    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al agendar la cita. Es posible que el horario ya esté ocupado.')
    } finally {
      setLoadingSubmit(false)
    }
  }

  if (loadingData) {
    return <div style={s.page}>Cargando información...</div>
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h2 style={s.title}>Agendar Cita</h2>
        
        <form onSubmit={handleSubmit}>
          
          <div style={s.field}>
            <label style={s.label}>Selecciona un Servicio</label>
            <select style={s.select} value={formData.serviceId} onChange={e => handleChange('serviceId', e.target.value)}>
              <option value="">-- Elige un servicio --</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} (${s.price})</option>
              ))}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>Selecciona un Barbero</label>
            <select style={s.select} value={formData.barberId} onChange={e => handleChange('barberId', e.target.value)}>
              <option value="">-- Elige un barbero --</option>
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="mobile-grid-1" style={s.grid}>
            <div style={s.field}>
              <label style={s.label}>Fecha</label>
              <input type="date" 
                style={{ ...s.input, colorScheme: 'dark', cursor: 'pointer' }} 
                value={formData.date} 
                onChange={e => handleChange('date', e.target.value)} 
                onClick={e => e.target.showPicker && e.target.showPicker()}
                min={new Date().toISOString().split('T')[0]} />
            </div>

            <div style={s.field}>
              <label style={s.label}>Hora</label>
              <select style={s.select} value={formData.time} onChange={e => handleChange('time', e.target.value)}>
                <option value="">-- Hora --</option>
                {TIME_SLOTS.map(t => {
                  const isTaken = bookedSlots.includes(t)
                  return (
                    <option key={t} value={t} disabled={isTaken}>
                      {t} {isTaken ? '(Ocupado)' : ''}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {error && <p style={s.error}>{error}</p>}
          {success && <p style={s.success}>{success}</p>}

          <button type="submit" style={s.btn} disabled={loadingSubmit}>
            {loadingSubmit ? 'Procesando...' : 'Confirmar Cita'}
          </button>
        </form>

      </div>
    </div>
  )
}
