import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const C = {
  bg: '#0a0a0a',
  card: '#111111',
  border: '#2a2a2a',
  gold: '#b8963e',
  text: '#d4c9b8',
  muted: '#555555',
  input: '#0d0d0d',
  label: '#666666',
  error: '#e05c5c',
  success: '#6db98a',
}

const s = {
  page: { minHeight: '100vh', background: C.bg, padding: '40px 20px', fontFamily: "'Georgia', serif", color: C.text },
  container: { maxWidth: 600, margin: '0 auto', background: C.card, border: `0.5px solid ${C.border}`, borderRadius: 16, padding: 32 },
  title: { fontSize: 24, color: '#e8dcc8', marginBottom: 24, textAlign: 'center' },
  field: { marginBottom: 20 },
  label: { display: 'block', fontSize: 12, color: C.label, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  input: { width: '100%', background: C.input, border: `0.5px solid ${C.border}`, color: C.text, padding: '12px', borderRadius: 8, fontSize: 14, fontFamily: "'Georgia', serif", outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', background: C.gold, color: '#000', border: 'none', padding: 14, borderRadius: 8, fontSize: 15, fontWeight: 'bold', fontFamily: "'Georgia', serif", cursor: 'pointer', marginTop: 10 },
  error: { color: C.error, fontSize: 13, marginBottom: 15, textAlign: 'center' },
  success: { color: C.success, fontSize: 13, marginBottom: 15, textAlign: 'center' },
}

export default function Profile() {
  const { session, profile: authProfile } = useAuth()
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    password: '',
    confirm_password: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (authProfile) {
      setFormData(prev => ({
        ...prev,
        full_name: authProfile.full_name || '',
        phone: authProfile.phone || ''
      }))
    }
  }, [authProfile])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Actualizar perfil
      if (formData.full_name !== authProfile?.full_name || formData.phone !== authProfile?.phone) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone
          })
          .eq('id', session.user.id)
          
        if (profileError) throw profileError
      }

      // Actualizar contraseña si se proporcionó
      if (formData.password) {
        if (formData.password !== formData.confirm_password) {
          throw new Error('Las contraseñas no coinciden.')
        }
        if (formData.password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres.')
        }
        
        const { error: authError } = await supabase.auth.updateUser({
          password: formData.password
        })
        
        if (authError) throw authError
        
        // Limpiar campos de contraseña
        setFormData(prev => ({ ...prev, password: '', confirm_password: '' }))
      }

      setSuccess('Perfil actualizado con éxito.')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error al actualizar el perfil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h2 style={s.title}>Mi Perfil</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Nombre Completo</label>
            <input 
              style={s.input} 
              type="text" 
              value={formData.full_name} 
              onChange={e => handleChange('full_name', e.target.value)} 
              required 
            />
          </div>
          
          <div style={s.field}>
            <label style={s.label}>Teléfono</label>
            <input 
              style={s.input} 
              type="tel" 
              value={formData.phone} 
              onChange={e => handleChange('phone', e.target.value)} 
            />
          </div>
          
          <h3 style={{ fontSize: 16, color: '#e8dcc8', marginTop: 32, marginBottom: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>Cambiar Contraseña</h3>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Déjalo en blanco si no deseas cambiar tu contraseña actual.</p>
          
          <div style={s.field}>
            <label style={s.label}>Nueva Contraseña</label>
            <input 
              style={s.input} 
              type="password" 
              value={formData.password} 
              onChange={e => handleChange('password', e.target.value)} 
              placeholder="••••••••"
            />
          </div>
          
          <div style={s.field}>
            <label style={s.label}>Confirmar Nueva Contraseña</label>
            <input 
              style={s.input} 
              type="password" 
              value={formData.confirm_password} 
              onChange={e => handleChange('confirm_password', e.target.value)} 
              placeholder="••••••••"
            />
          </div>

          {error && <p style={s.error}>{error}</p>}
          {success && <p style={s.success}>{success}</p>}

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
