import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const C = { bg:'#0d0d0d', border:'#1e1e1e', gold:'#b8963e', text:'#d4c9b8', muted:'#555' }

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, isAdmin, signOut } = useAuth()

  const active = (path) => location.pathname === path

  const linkStyle = (path) => ({
    fontSize: 13, fontFamily: "'Georgia',serif", letterSpacing: 0.5,
    color: active(path) ? C.gold : C.muted,
    cursor: 'pointer', padding: '4px 0',
    borderBottom: active(path) ? `1px solid ${C.gold}` : '1px solid transparent',
    background: 'none', border: 'none',
    transition: 'color .2s',
  })

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav style={{ background: C.bg, borderBottom: `0.5px solid ${C.border}`, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={() => navigate('/')}>
        <span style={{ fontSize:20 }}>✂</span>
        <span style={{ fontSize:15, fontWeight:700, color:'#e8dcc8', fontFamily:"'Georgia',serif", letterSpacing:1 }}>Peludos</span>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:28 }}>
        <button style={linkStyle('/')}        onClick={() => navigate('/')}>Inicio</button>
        <button style={linkStyle('/services')} onClick={() => navigate('/services')}>Servicios</button>
        {session && <button style={linkStyle('/book')} onClick={() => navigate('/book')}>Agendar</button>}
        {session && <button style={linkStyle('/my-appointments')} onClick={() => navigate('/my-appointments')}>Mis citas</button>}
        {isAdmin  && <button style={linkStyle('/admin')} onClick={() => navigate('/admin')}>Admin</button>}
      </div>

      <div>
        {session ? (
          <button onClick={handleSignOut} style={{ fontSize:13, fontFamily:"'Georgia',serif", color:C.muted, background:'none', border:`0.5px solid #2a2a2a`, borderRadius:6, padding:'6px 16px', cursor:'pointer' }}>
            Salir
          </button>
        ) : (
          <button onClick={() => navigate('/login')} style={{ fontSize:13, fontFamily:"'Georgia',serif", background:C.gold, border:'none', borderRadius:6, padding:'7px 18px', color:'#000', fontWeight:700, cursor:'pointer' }}>
            Entrar
          </button>
        )}
      </div>
    </nav>
  )
}
