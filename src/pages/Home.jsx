import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const C = {
  bg: '#0a0a0a', card: '#111', border: '#2a2a2a',
  gold: '#b8963e', text: '#d4c9b8', muted: '#555', divider: '#1e1e1e',
}

export default function Home() {
  const navigate = useNavigate()
  const { session, profile } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Georgia', serif", color: C.text }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 24px 60px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✂</div>
        <h1 style={{ fontSize: 38, fontWeight: 700, color: '#e8dcc8', letterSpacing: 1, margin: 0 }}>
          Peludos Barber Shop
        </h1>
        <p style={{ fontSize: 14, color: C.muted, fontStyle: 'italic', letterSpacing: 2, margin: '10px 0 0' }}>
          Est. 2024 · Villahermosa, Tabasco
        </p>
        <div style={{ width: 60, height: 1, background: C.gold, margin: '28px auto' }} />
        <p style={{ fontSize: 16, color: C.text, maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.8 }}>
          Cortes, arreglo de barba y tratamientos capilares en un ambiente moderno.
          Agenda tu cita en minutos.
        </p>

        {session ? (
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/book')} style={btnGold}>
              Agendar cita
            </button>
            <button onClick={() => navigate('/my-appointments')} style={btnOutline}>
              Mis citas
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} style={btnGold}>
              Iniciar sesión
            </button>
            <button onClick={() => navigate('/services')} style={btnOutline}>
              Ver servicios
            </button>
          </div>
        )}
      </div>

      {/* Servicios destacados */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontSize: 13, letterSpacing: 3, color: C.muted, textTransform: 'uppercase', textAlign: 'center', marginBottom: 32 }}>
          Nuestros servicios
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {servicios.map(sv => (
            <div key={sv.nombre} style={serviceCard}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{sv.icon}</div>
              <div style={{ fontSize: 15, color: '#e8dcc8', fontWeight: 700, marginBottom: 6 }}>{sv.nombre}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{sv.desc}</div>
              <div style={{ marginTop: 14, fontSize: 16, color: C.gold, fontWeight: 700 }}>{sv.precio}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Horarios */}
      <div style={{ borderTop: `0.5px solid ${C.divider}`, padding: '48px 24px 64px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 13, letterSpacing: 3, color: C.muted, textTransform: 'uppercase', marginBottom: 24 }}>
          Horarios
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 14, color: '#e8dcc8', marginBottom: 4 }}>Lunes – Sábado</div>
            <div style={{ fontSize: 22, color: C.gold, fontWeight: 700 }}>9:00 – 20:00</div>
          </div>
          <div style={{ width: '0.5px', background: C.divider }} />
          <div>
            <div style={{ fontSize: 14, color: '#e8dcc8', marginBottom: 4 }}>Domingo</div>
            <div style={{ fontSize: 22, color: C.gold, fontWeight: 700 }}>10:00 – 16:00</div>
          </div>
        </div>
      </div>

    </div>
  )
}

const servicios = [
  { icon: '✂', nombre: 'Corte clásico', desc: 'Corte tradicional con acabado perfecto', precio: 'Desde $80' },
  { icon: '🪒', nombre: 'Arreglo de barba', desc: 'Perfilado y definición con navaja', precio: 'Desde $60' },
  { icon: '💈', nombre: 'Corte + barba', desc: 'Servicio completo todo en uno', precio: 'Desde $130' },
  { icon: '✨', nombre: 'Tratamiento capilar', desc: 'Hidratación y cuidado del cuero cabelludo', precio: 'Desde $100' },
]

const btnGold = {
  padding: '13px 32px', background: '#b8963e', border: 'none', borderRadius: 8,
  color: '#000', fontSize: 14, fontWeight: 700, fontFamily: "'Georgia', serif",
  letterSpacing: 1, cursor: 'pointer',
}

const btnOutline = {
  padding: '13px 32px', background: 'transparent',
  border: '0.5px solid #2a2a2a', borderRadius: 8,
  color: '#d4c9b8', fontSize: 14, fontFamily: "'Georgia', serif",
  letterSpacing: 0.5, cursor: 'pointer',
}

const serviceCard = {
  background: '#111', border: '0.5px solid #2a2a2a', borderRadius: 14,
  padding: '24px 20px', textAlign: 'center',
}
