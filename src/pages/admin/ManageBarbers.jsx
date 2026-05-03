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
  })
}

export default function ManageBarbers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

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
        const barberRecord = barbersData?.find(b => b.id === p.id)
        return {
          ...p,
          isBarber: !!barberRecord,
          isActiveBarber: barberRecord?.is_active || false
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
      const { error } = await supabase.from('barbers').update({ is_active: newStatus }).eq('id', user.id)
      if (error) alert('Error: ' + error.message)
      else fetchUsers()
    } else {
      // No es barbero, lo agregamos a la tabla barbers
      if (!window.confirm(`¿Promover a ${user.full_name} como Barbero?`)) return
      
      const { error } = await supabase.from('barbers').insert([{ id: user.id, is_active: true }])
      if (error) alert('Error: ' + error.message)
      else fetchUsers()
    }
  }

  if (loading) return <div style={{ color: C.gold }}>Cargando usuarios...</div>

  return (
    <div style={s.card}>
      <h2 style={s.title}>Gestión de Barberos</h2>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>
        Aquí puedes promover clientes a barberos, o desactivar barberos actuales para que ya no reciban citas.
      </p>

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
            {users.map(u => (
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
                  <button 
                    style={s.btn(u.isActiveBarber)} 
                    onClick={() => toggleBarberStatus(u)}
                  >
                    {u.isActiveBarber ? 'Desactivar Barbero' : 'Promover a Barbero'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
