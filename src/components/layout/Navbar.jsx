import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const C = { bg:'#0d0d0d', border:'#1e1e1e', gold:'#b8963e', text:'#d4c9b8', muted:'#555' }

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, isAdmin, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

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
    setMenuOpen(false)
    navigate('/login')
  }

  const navItemClick = (path) => {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <nav className="nav-mobile-container" style={{ background: C.bg, borderBottom: `0.5px solid ${C.border}`, padding: '0 32px', position: 'relative', zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={() => navItemClick('/')}>
          <span style={{ fontSize:20 }}>✂</span>
          <span className="nav-brand-text" style={{ fontSize:15, fontWeight:700, color:'#e8dcc8', fontFamily:"'Georgia',serif", letterSpacing:1 }}>Peludos</span>
        </div>

        {/* Desktop Menu */}
        <div className="desktop-only" style={{ display:'flex', alignItems:'center', gap:28 }}>
          <button style={linkStyle('/')} onClick={() => navItemClick('/')}>Inicio</button>
          <button style={linkStyle('/services')} onClick={() => navItemClick('/services')}>Servicios</button>
          {session && <button style={linkStyle('/book')} onClick={() => navItemClick('/book')}>Agendar</button>}
          {session && <button style={linkStyle('/my-appointments')} onClick={() => navItemClick('/my-appointments')}>Mis citas</button>}
          {isAdmin  && <button style={linkStyle('/admin')} onClick={() => navItemClick('/admin')}>Admin</button>}
        </div>

        <div className="desktop-only">
          {session ? (
            <button onClick={handleSignOut} style={{ fontSize:13, fontFamily:"'Georgia',serif", color:C.muted, background:'none', border:`0.5px solid #2a2a2a`, borderRadius:6, padding:'6px 16px', cursor:'pointer' }}>
              Salir
            </button>
          ) : (
            <button onClick={() => navItemClick('/login')} style={{ fontSize:13, fontFamily:"'Georgia',serif", background:C.gold, border:'none', borderRadius:6, padding:'7px 18px', color:'#000', fontWeight:700, cursor:'pointer' }}>
              Entrar
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="mobile-only" style={{ display: 'none', alignItems: 'center' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: C.text, fontSize: 24, cursor: 'pointer' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="mobile-only mobile-col" style={{ display: 'none', position: 'absolute', top: 56, left: 0, right: 0, background: C.bg, borderBottom: `0.5px solid ${C.border}`, padding: '16px 24px', gap: '16px' }}>
          <button style={{...linkStyle('/'), textAlign: 'left', width: '100%'}} onClick={() => navItemClick('/')}>Inicio</button>
          <button style={{...linkStyle('/services'), textAlign: 'left', width: '100%'}} onClick={() => navItemClick('/services')}>Servicios</button>
          {session && <button style={{...linkStyle('/book'), textAlign: 'left', width: '100%'}} onClick={() => navItemClick('/book')}>Agendar</button>}
          {session && <button style={{...linkStyle('/my-appointments'), textAlign: 'left', width: '100%'}} onClick={() => navItemClick('/my-appointments')}>Mis citas</button>}
          {isAdmin  && <button style={{...linkStyle('/admin'), textAlign: 'left', width: '100%'}} onClick={() => navItemClick('/admin')}>Admin</button>}
          <div style={{ height: '0.5px', background: C.border, margin: '8px 0' }} />
          {session ? (
            <button onClick={handleSignOut} style={{ fontSize:13, fontFamily:"'Georgia',serif", color:C.muted, background:'none', border:`0.5px solid #2a2a2a`, borderRadius:6, padding:'10px 16px', cursor:'pointer', width: '100%' }}>
              Salir
            </button>
          ) : (
            <button onClick={() => navItemClick('/login')} style={{ fontSize:13, fontFamily:"'Georgia',serif", background:C.gold, border:'none', borderRadius:6, padding:'10px 18px', color:'#000', fontWeight:700, cursor:'pointer', width: '100%' }}>
              Entrar
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
