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
    padding: '8px 16px',
    background: type === 'add' ? C.gold : 'transparent',
    color: type === 'add' ? '#000' : type === 'toggle' ? C.text : C.error,
    border: type === 'add' ? 'none' : `1px solid ${type === 'toggle' ? C.border : C.error}`,
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 13,
  }),
  input: {
    background: C.input,
    border: `0.5px solid ${C.border}`,
    color: C.text,
    padding: '10px 14px',
    borderRadius: 6,
    marginRight: 8,
    fontFamily: "'Georgia', serif",
    fontSize: 14,
    outline: 'none',
  }
}

export default function ManageServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Nuevo Servicio
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newDuration, setNewDuration] = useState('60')

  // Edición
  const [editingId, setEditingId] = useState(null)
  const [editPrice, setEditPrice] = useState('')
  const [editDuration, setEditDuration] = useState('')

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    setLoading(true)
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true })
    if (!error && data) setServices(data)
    setLoading(false)
  }

  async function handleAddService(e) {
    e.preventDefault()
    if (!newName || !newPrice || !newDuration) return
    const { error } = await supabase.from('services').insert([{ name: newName, price: Number(newPrice), duration_min: Number(newDuration), is_active: true }])
    if (error) alert('Error: ' + error.message)
    else {
      setNewName('')
      setNewPrice('')
      setNewDuration('60')
      fetchServices()
    }
  }

  async function toggleServiceStatus(id, currentStatus) {
    const { error } = await supabase.from('services').update({ is_active: !currentStatus }).eq('id', id)
    if (error) alert('Error: ' + error.message)
    else fetchServices()
  }

  async function savePrice(id) {
    if (!editPrice || !editDuration) return
    const { error } = await supabase.from('services').update({ price: Number(editPrice), duration_min: Number(editDuration) }).eq('id', id)
    if (error) alert('Error: ' + error.message)
    else {
      setEditingId(null)
      fetchServices()
    }
  }

  if (loading) return <div style={{ color: C.gold }}>Cargando servicios...</div>

  return (
    <div>
      {/* Añadir Servicio */}
      <div style={s.card}>
        <h2 style={s.title}>Añadir Nuevo Servicio</h2>
        <form onSubmit={handleAddService} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input 
            style={s.input} 
            placeholder="Nombre (Ej. Corte Clásico)" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
          />
          <input 
            style={s.input} 
            type="number" 
            placeholder="Precio ($)" 
            value={newPrice} 
            onChange={e => setNewPrice(e.target.value)} 
            min="0"
          />
          <input 
            style={{ ...s.input, width: 100 }} 
            type="number" 
            placeholder="Duración (min)" 
            value={newDuration} 
            onChange={e => setNewDuration(e.target.value)} 
            min="10"
            step="5"
          />
          <button type="submit" style={s.btn('add')}>+ Agregar Servicio</button>
        </form>
      </div>

      {/* Lista de Servicios */}
      <div style={s.card}>
        <h2 style={s.title}>Servicios Existentes</h2>
        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Servicio</th>
                <th style={s.th}>Precio ($)</th>
                <th style={s.th}>Duración (min)</th>
                <th style={s.th}>Estado</th>
                <th style={s.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map(srv => (
                <tr key={srv.id} style={{ opacity: srv.is_active ? 1 : 0.5 }}>
                  <td style={{ ...s.td, fontWeight: 'bold', color: '#e8dcc8' }}>{srv.name}</td>
                  
                  <td style={s.td}>
                    {editingId === srv.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input 
                          style={{ ...s.input, width: 80, padding: 6, margin: 0 }} 
                          type="number" 
                          value={editPrice} 
                          onChange={e => setEditPrice(e.target.value)} 
                        />
                      </div>
                    ) : (
                      <span>${srv.price}</span>
                    )}
                  </td>

                  <td style={s.td}>
                    {editingId === srv.id ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input 
                          style={{ ...s.input, width: 80, padding: 6, margin: 0 }} 
                          type="number" 
                          value={editDuration} 
                          onChange={e => setEditDuration(e.target.value)} 
                          min="10"
                          step="5"
                        />
                        <button style={s.btn('toggle')} onClick={() => savePrice(srv.id)}>Guardar</button>
                      </div>
                    ) : (
                      <span>{srv.duration_min} min</span>
                    )}
                  </td>
                  
                  <td style={s.td}>
                    <span style={{ color: srv.is_active ? C.success : C.error }}>
                      {srv.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {editingId !== srv.id && (
                        <button style={s.btn('toggle')} onClick={() => { setEditingId(srv.id); setEditPrice(srv.price); setEditDuration(srv.duration_min) }}>
                          Editar Datos
                        </button>
                      )}
                      <button style={s.btn('toggle')} onClick={() => toggleServiceStatus(srv.id, srv.is_active)}>
                        {srv.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
