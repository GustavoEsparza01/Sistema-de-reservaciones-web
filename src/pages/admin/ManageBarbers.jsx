import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

const C = {
  bg: '#0a0a0a',
  card: '#111111',
  border: '#2a2a2a',
  gold: '#b8963e',
  text: '#d4c9b8',
  muted: '#555555',
  success: '#6db98a',
  error: '#e05c5c',
}

const s = {
  card: { background: C.card, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 20 },
  title: { fontSize: 18, color: '#e8dcc8', marginBottom: 16, marginTop: 0 },
  tableWrapper: { overflowX: 'auto', border: `0.5px solid ${C.border}`, borderRadius: 8 },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '12px 16px', borderBottom: `0.5px solid ${C.border}`, color: C.muted, fontSize: 12, textTransform: 'uppercase' },
  td: { padding: '12px 16px', borderBottom: `0.5px solid ${C.border}`, color: C.text, fontSize: 14 },
  btn: (active) => ({
    padding: '6px 12px',
    background: active ? 'transparent' : C.gold,
    color: active ? C.error : '#000',
    border: active ? `1px solid ${C.error}` : 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 12,
  }),
  input: {
    background: '#0d0d0d',
    border: `0.5px solid ${C.border}`,
    color: C.text,
    padding: '6px 10px',
    borderRadius: 6,
    fontFamily: "'Georgia', serif",
    fontSize: 14,
    outline: 'none',
    width: '100%',
    marginBottom: 4
  }
}

export default function ManageBarbers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Schedule Modal
  const [editingScheduleBarber, setEditingScheduleBarber] = useState(null)
  const [scheduleData, setScheduleData] = useState({})

  const DAYS = [
    { id: '1', name: 'Lunes' },
    { id: '2', name: 'Martes' },
    { id: '3', name: 'Miércoles' },
    { id: '4', name: 'Jueves' },
    { id: '5', name: 'Viernes' },
    { id: '6', name: 'Sábado' },
    { id: '0', name: 'Domingo' }
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    // 1. Obtener todos los perfiles
    const { data: profilesData, error: profError } = await supabase.from('profiles').select('*')
    // 2. Obtener todos los barberos (activos e inactivos)
    const { data: barbersData, error: barbError } = await supabase.from('barbers').select('*')

    if (!profError && profilesData) {
      const merged = profilesData.map(p => {
        const barberRecord = barbersData?.find(b => b.profile_id === p.id)
        return {
          ...p,
          isBarber: !!barberRecord,
          isActiveBarber: barberRecord?.is_active || false,
          barberId: barberRecord?.id,
          schedule: barberRecord?.schedule || {}
        }
      })
      // Mostrar primero a los que son barberos
      merged.sort((a, b) => (b.isBarber === a.isBarber ? 0 : b.isBarber ? 1 : -1))
      setUsers(merged)
    } else {
      console.error(profError)
    }
    setLoading(false)
  }

  async function toggleBarberStatus(user) {
    if (user.isBarber) {
      // Ya es barbero, cambiamos su is_active
      const newStatus = !user.isActiveBarber
      const { error } = await supabase.from('barbers').update({ is_active: newStatus }).eq('profile_id', user.id)
      if (error) alert('Error: ' + error.message)
      else fetchUsers()
    } else {
      // No es barbero, lo agregamos a la tabla barbers
      if (!window.confirm(`¿Promover a ${user.full_name} como Barbero?`)) return
      
      const { error } = await supabase.from('barbers').insert([{ profile_id: user.id, is_active: true }])
      if (error) alert('Error: ' + error.message)
      else fetchUsers()
    }
  }

  function openSchedule(barber) {
    setEditingScheduleBarber(barber)
    // Inicializar con valores por defecto si no existen
    const defaultSchedule = {
      "1": { isWorking: true, start: "10:00", end: "20:00" },
      "2": { isWorking: true, start: "10:00", end: "20:00" },
      "3": { isWorking: true, start: "10:00", end: "20:00" },
      "4": { isWorking: true, start: "10:00", end: "20:00" },
      "5": { isWorking: true, start: "10:00", end: "20:00" },
      "6": { isWorking: true, start: "10:00", end: "18:00" },
      "0": { isWorking: false, start: "10:00", end: "14:00" }
    }
    setScheduleData(barber.schedule && Object.keys(barber.schedule).length > 0 ? barber.schedule : defaultSchedule)
  }

  async function saveSchedule() {
    const { error } = await supabase
      .from('barbers')
      .update({ schedule: scheduleData })
      .eq('id', editingScheduleBarber.barberId)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setEditingScheduleBarber(null)
      fetchUsers()
    }
  }

  const handleScheduleChange = (dayId, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value
      }
    }))
  }

  if (loading) return <div style={{ color: C.gold }}>Cargando usuarios...</div>

  return (
    <div style={s.card}>
      <h2 style={s.title}>Gestión de Barberos</h2>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>
        Aquí puedes promover clientes a barberos, o desactivar barberos actuales para que ya no reciban citas.
      </p>

      <div style={{ marginBottom: 20 }}>
        <input 
          type="text" 
          placeholder="Buscar usuario por nombre o teléfono..." 
          style={{ ...s.input, width: '100%', maxWidth: '400px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={s.tableWrapper}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Nombre</th>
              <th style={s.th}>Teléfono</th>
              <th style={s.th}>Rol Actual</th>
              <th style={s.th}>Estado Barbero</th>
              <th style={s.th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filteredUsers = users.filter(u => {
                const term = searchTerm.toLowerCase()
                const name = (u.full_name || '').toLowerCase()
                const phone = (u.phone || '').toLowerCase()
                return name.includes(term) || phone.includes(term)
              })

              if (filteredUsers.length === 0) {
                return (
                  <tr><td colSpan="5" style={s.td}>No se encontraron usuarios.</td></tr>
                )
              }

              return filteredUsers.map(u => (
                <tr key={u.id} style={{ background: u.isActiveBarber ? 'rgba(184, 150, 62, 0.05)' : 'transparent' }}>
                  <td style={s.td}>{u.full_name}</td>
                  <td style={s.td}>{u.phone || 'N/A'}</td>
                  <td style={s.td}>
                    {u.isBarber ? <span style={{ color: C.gold, fontWeight: 'bold' }}>Barbero</span> : 'Cliente'}
                  </td>
                  <td style={s.td}>
                    {u.isBarber ? (
                      <span style={{ color: u.isActiveBarber ? C.success : C.muted }}>
                        {u.isActiveBarber ? 'Activo' : 'Inactivo'}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {u.isBarber && (
                        <button 
                          style={{ ...s.btn(false), background: 'transparent', border: `1px solid ${C.gold}`, color: C.gold }} 
                          onClick={() => openSchedule(u)}
                        >
                          🕒 Horario
                        </button>
                      )}
                      <button 
                        style={s.btn(u.isActiveBarber)} 
                        onClick={() => toggleBarberStatus(u)}
                      >
                        {u.isActiveBarber ? 'Desactivar' : 'Promover'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            })()}
          </tbody>
        </table>
      </div>

      {/* Modal Horario */}
      {editingScheduleBarber && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#e8dcc8', borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
              Horario de {editingScheduleBarber.full_name}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {DAYS.map(day => {
                const data = scheduleData[day.id] || { isWorking: false, start: '10:00', end: '18:00' }
                
                return (
                  <div key={day.id} style={{ display: 'grid', gridTemplateColumns: '100px auto auto auto', alignItems: 'center', gap: 10, padding: 10, background: '#0d0d0d', borderRadius: 8 }}>
                    <div style={{ color: C.text, fontWeight: 'bold' }}>{day.name}</div>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted, fontSize: 14, cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={data.isWorking}
                        onChange={(e) => handleScheduleChange(day.id, 'isWorking', e.target.checked)}
                      />
                      Trabaja
                    </label>

                    <input 
                      type="time" 
                      style={{ ...s.input, width: 100, marginBottom: 0, opacity: data.isWorking ? 1 : 0.3 }}
                      value={data.start}
                      onChange={(e) => handleScheduleChange(day.id, 'start', e.target.value)}
                      disabled={!data.isWorking}
                    />

                    <input 
                      type="time" 
                      style={{ ...s.input, width: 100, marginBottom: 0, opacity: data.isWorking ? 1 : 0.3 }}
                      value={data.end}
                      onChange={(e) => handleScheduleChange(day.id, 'end', e.target.value)}
                      disabled={!data.isWorking}
                    />
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button 
                onClick={() => setEditingScheduleBarber(null)} 
                style={{ background: 'transparent', color: C.text, border: 'none', cursor: 'pointer', padding: '8px 16px' }}
              >
                Cancelar
              </button>
              <button 
                onClick={saveSchedule} 
                style={{ background: C.gold, color: '#000', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', padding: '8px 16px' }}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
