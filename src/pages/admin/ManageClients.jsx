import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

const C = {
  bg: '#0a0a0a', card: '#111111', border: '#2a2a2a',
  gold: '#b8963e', text: '#d4c9b8', muted: '#555555',
  success: '#6db98a', error: '#e05c5c', input: '#0d0d0d'
}

const s = {
  card: { background: C.card, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 20 },
  title: { fontSize: 18, color: '#e8dcc8', marginBottom: 16, marginTop: 0 },
  tableWrapper: { overflowX: 'auto', border: `0.5px solid ${C.border}`, borderRadius: 8 },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '12px 16px', borderBottom: `0.5px solid ${C.border}`, color: C.muted, fontSize: 12, textTransform: 'uppercase' },
  td: { padding: '12px 16px', borderBottom: `0.5px solid ${C.border}`, color: C.text, fontSize: 14 },
  btn: (type) => ({
    padding: '6px 12px',
    background: type === 'edit' ? 'transparent' : type === 'ban' ? 'transparent' : C.gold,
    color: type === 'ban' ? C.error : type === 'unban' ? '#000' : C.gold,
    border: type === 'unban' ? 'none' : `1px solid ${type === 'ban' ? C.error : C.gold}`,
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 12,
  }),
  input: {
    background: C.input,
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

export default function ManageClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  // Edición
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)
    // Obtener usuarios que sean clientes o estén baneados (omitimos a los admins)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['client', 'banned'])
      .order('full_name', { ascending: true })

    if (error) {
      console.error(error)
      alert('Error al cargar clientes: ' + error.message)
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }

  async function toggleStatus(client) {
    const newRole = client.role === 'banned' ? 'client' : 'banned'
    const confirmMsg = newRole === 'banned' 
      ? `¿Estás seguro de que deseas SUSPENDER a ${client.full_name}? No podrá usar el sistema.`
      : `¿Deseas REACTIVAR la cuenta de ${client.full_name}?`
      
    if (!window.confirm(confirmMsg)) return

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', client.id)

    if (error) alert('Error: ' + error.message)
    else fetchClients()
  }

  async function saveClient(id) {
    if (!editName) return alert('El nombre es obligatorio')
    
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName, phone: editPhone })
      .eq('id', id)

    if (error) alert('Error: ' + error.message)
    else {
      setEditingId(null)
      fetchClients()
    }
  }

  if (loading) return <div style={{ color: C.gold }}>Cargando clientes...</div>

  return (
    <div style={s.card}>
      <h2 style={s.title}>Gestión de Clientes</h2>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20 }}>
        Aquí puedes modificar los datos de contacto de tus clientes o suspender sus cuentas si es necesario. (Las altas las hacen los propios clientes al registrarse).
      </p>

      <div style={s.tableWrapper}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Nombre Completo</th>
              <th style={s.th}>Teléfono</th>
              <th style={s.th}>Estado</th>
              <th style={s.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr><td colSpan="4" style={s.td}>No hay clientes registrados.</td></tr>
            )}
            
            {clients.map(client => {
              const isBanned = client.role === 'banned'
              const isEditing = editingId === client.id

              return (
                <tr key={client.id} style={{ opacity: isBanned ? 0.6 : 1 }}>
                  
                  {/* Columna Nombre */}
                  <td style={s.td}>
                    {isEditing ? (
                      <input 
                        style={s.input} 
                        value={editName} 
                        onChange={e => setEditName(e.target.value)} 
                        placeholder="Nombre completo"
                      />
                    ) : (
                      <div style={{ fontWeight: 'bold', color: '#e8dcc8' }}>{client.full_name || 'Sin nombre'}</div>
                    )}
                  </td>
                  
                  {/* Columna Teléfono */}
                  <td style={s.td}>
                    {isEditing ? (
                      <input 
                        style={s.input} 
                        value={editPhone} 
                        onChange={e => setEditPhone(e.target.value)} 
                        placeholder="Teléfono"
                      />
                    ) : (
                      <div>{client.phone || 'N/A'}</div>
                    )}
                  </td>
                  
                  {/* Columna Estado */}
                  <td style={s.td}>
                    <span style={{ color: isBanned ? C.error : C.success, fontWeight: 'bold' }}>
                      {isBanned ? 'Suspendido' : 'Activo'}
                    </span>
                  </td>
                  
                  {/* Columna Acciones */}
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      
                      {isEditing ? (
                        <>
                          <button style={s.btn('save')} onClick={() => saveClient(client.id)}>Guardar</button>
                          <button style={s.btn('ban')} onClick={() => setEditingId(null)}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button 
                            style={s.btn('edit')} 
                            onClick={() => { 
                              setEditingId(client.id); 
                              setEditName(client.full_name); 
                              setEditPhone(client.phone || ''); 
                            }}
                          >
                            Modificar
                          </button>
                          
                          <button 
                            style={s.btn(isBanned ? 'unban' : 'ban')} 
                            onClick={() => toggleStatus(client)}
                          >
                            {isBanned ? 'Reactivar' : 'Suspender'}
                          </button>
                        </>
                      )}

                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
