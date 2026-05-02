import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const C = {
  bg:      '#0a0a0a',
  card:    '#111111',
  cardTop: '#0d0d0d',
  border:  '#2a2a2a',
  divider: '#1e1e1e',
  gold:    '#b8963e',
  goldHov: '#c9a84c',
  text:    '#d4c9b8',
  muted:   '#555555',
  error:   '#e05c5c',
  success: '#6db98a',
  input:   '#0d0d0d',
  label:   '#666666',
}

const s = {
  page: {
    minHeight: '100vh',
    background: C.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    fontFamily: "'Georgia', serif",
  },
  card: {
    background: C.card,
    border: `0.5px solid ${C.border}`,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  cardTop: {
    padding: '36px 32px 28px',
    borderBottom: `0.5px solid ${C.divider}`,
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 },
  logoIcon: {
    width: 36, height: 36,
    background: C.gold,
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, flexShrink: 0,
  },
  brandName: { fontSize: 20, fontWeight: 700, color: '#e8dcc8', letterSpacing: 0.5 },
  brandSub:  { fontSize: 12, color: C.muted, fontStyle: 'italic', letterSpacing: 1, marginTop: 2 },
  tabs: {
    display: 'flex',
    marginTop: 24,
    border: `0.5px solid ${C.border}`,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tab: (active) => ({
    flex: 1, padding: '10px',
    border: 'none',
    background: active ? C.gold : 'transparent',
    color: active ? '#000' : C.muted,
    fontWeight: active ? 700 : 400,
    fontSize: 13,
    fontFamily: "'Georgia', serif",
    cursor: 'pointer',
    letterSpacing: 0.3,
    transition: 'all .2s',
  }),
  body:  { padding: '28px 32px 32px' },
  field: { marginBottom: 18 },
  label: {
    display: 'block', fontSize: 11,
    color: C.label,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  input: {
    width: '100%',
    background: C.input,
    border: `0.5px solid ${C.border}`,
    borderRadius: 8,
    padding: '11px 14px',
    color: C.text,
    fontSize: 14,
    fontFamily: "'Georgia', serif",
    outline: 'none',
    boxSizing: 'border-box',
  },
  dividerLine: { height: '0.5px', background: C.divider, margin: '4px 0 20px' },
  btn: {
    width: '100%', padding: 13,
    background: C.gold,
    border: 'none', borderRadius: 8,
    color: '#000', fontSize: 14, fontWeight: 700,
    fontFamily: "'Georgia', serif",
    letterSpacing: 1, cursor: 'pointer', marginTop: 6,
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  error:   { fontSize: 12, color: C.error,   marginBottom: 12 },
  success: { fontSize: 12, color: C.success, marginBottom: 12 },
  switchTxt: { textAlign: 'center', marginTop: 20, fontSize: 12, color: C.muted, fontStyle: 'italic' },
  switchLink: { color: C.gold, cursor: 'pointer', fontStyle: 'normal', fontWeight: 600 },
}

function Field({ label, type, value, onChange, placeholder, required, style }) {
  return (
    <div style={{ ...s.field, ...style }}>
      <label style={s.label}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        required={required}
        onChange={e => onChange(e.target.value)}
        style={s.input}
      />
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [regData, setRegData] = useState({ full_name: '', phone: '', email: '', password: '', birthdate: '' })
  const [regError, setRegError]     = useState('')
  const [regSuccess, setRegSuccess] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: loginData.email, password: loginData.password })
    setLoginLoading(false)
    if (error) { setLoginError(error.message); return }
    navigate('/')
  }

  async function handleRegister(e) {
    e.preventDefault()
    setRegError('')
    setRegSuccess('')
    setRegLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: regData.email,
      password: regData.password,
      options: { data: { full_name: regData.full_name, phone: regData.phone, birthdate: regData.birthdate } },
    })
    
    if (error) {
      setRegError(error.message)
      setRegLoading(false)
      return
    }

    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            full_name: regData.full_name,
            phone: regData.phone,
            birthdate: regData.birthdate,
            role: 'client'
          }
        ])
        
      if (profileError) {
        console.error('Error al insertar perfil:', profileError)
      }
    }

    setRegLoading(false)
    setRegSuccess('¡Cuenta creada! Revisa tu correo para confirmar tu registro.')
  }

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Header */}
        <div style={s.cardTop}>
          <div style={s.logoWrap}>
            <div style={s.logoIcon}>✂</div>
            <div>
              <div style={s.brandName}>Peludos Barber</div>
              <div style={s.brandSub}>Est. 2024 · Villahermosa</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={s.tabs}>
            <button style={s.tab(tab === 'login')} onClick={() => setTab('login')}>Iniciar sesión</button>
            <button style={s.tab(tab === 'register')} onClick={() => setTab('register')}>Registrarse</button>
          </div>
        </div>

        {/* Body */}
        <div style={s.body}>

          {/* LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <Field label="Correo electrónico" type="email" value={loginData.email}
                onChange={v => setLoginData(p => ({ ...p, email: v }))} placeholder="correo@ejemplo.com" required />
              <Field label="Contraseña" type="password" value={loginData.password}
                onChange={v => setLoginData(p => ({ ...p, password: v }))} placeholder="••••••••" required />
              <div style={s.dividerLine} />
              {loginError && <p style={s.error}>{loginError}</p>}
              <button type="submit" style={s.btn} disabled={loginLoading}>
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>
              <p style={s.switchTxt}>¿No tienes cuenta?{' '}
                <span style={s.switchLink} onClick={() => setTab('register')}>Regístrate aquí</span>
              </p>
            </form>
          )}

          {/* REGISTRO */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={s.row2}>
                <Field label="Nombre completo" type="text" value={regData.full_name}
                  onChange={v => setRegData(p => ({ ...p, full_name: v }))} placeholder="Juan Pérez" required />
                <Field label="Teléfono" type="tel" value={regData.phone}
                  onChange={v => setRegData(p => ({ ...p, phone: v }))} placeholder="+52 993..." />
              </div>
              <Field label="Fecha de nacimiento" type="date" value={regData.birthdate}
                onChange={v => setRegData(p => ({ ...p, birthdate: v }))} required />
              <Field label="Correo electrónico" type="email" value={regData.email}
                onChange={v => setRegData(p => ({ ...p, email: v }))} placeholder="correo@ejemplo.com" required />
              <Field label="Contraseña" type="password" value={regData.password}
                onChange={v => setRegData(p => ({ ...p, password: v }))} placeholder="Mínimo 6 caracteres" required />
              {regError   && <p style={s.error}>{regError}</p>}
              {regSuccess && <p style={s.success}>{regSuccess}</p>}
              <button type="submit" style={s.btn} disabled={regLoading}>
                {regLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
              <p style={s.switchTxt}>¿Ya tienes cuenta?{' '}
                <span style={s.switchLink} onClick={() => setTab('login')}>Inicia sesión</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
