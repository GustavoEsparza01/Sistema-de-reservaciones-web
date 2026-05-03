import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import BarberCard from '../components/ui/BarberCard'

const C = {
  bg: '#0a0a0a', card: '#111', border: '#2a2a2a',
  gold: '#b8963e', text: '#d4c9b8', muted: '#555', divider: '#1e1e1e',
}

export default function Home() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [barbers, setBarbers] = useState([])
  const [loadingBarbers, setLoadingBarbers] = useState(true)

  useEffect(() => {
    async function loadBarbers() {
      const { data, error } = await supabase
        .from('barbers')
        .select('id, profiles(full_name)')
        .eq('is_active', true)
      
      if (!error && data) {
        setBarbers(data)
      }
      setLoadingBarbers(false)
    }
    loadBarbers()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Georgia', serif", color: C.text }}>

      {/* Hero Section */}
      <div style={{
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Background Image with Dark Overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to bottom, rgba(10,10,10,0.8) 0%, rgba(10,10,10,0.95) 100%)',
          zIndex: 1
        }} />

        {/* Hero Content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 24px', maxWidth: 800 }}>
          <div style={{ fontSize: 64, marginBottom: 16, color: C.gold, opacity: 0.9 }}>✂</div>
          <h1 style={{ fontSize: 52, fontWeight: 'bold', color: '#fff', letterSpacing: 2, margin: '0 0 16px', textTransform: 'uppercase' }}>
            Peludos Barber Shop
          </h1>
          <p style={{ fontSize: 16, color: C.gold, fontStyle: 'italic', letterSpacing: 4, margin: '0 0 40px', textTransform: 'uppercase' }}>
            Premium Grooming Experience
          </p>
          
          <p style={{ fontSize: 18, color: '#e8dcc8', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.8, opacity: 0.9 }}>
            Más que un corte de cabello, es un ritual. Descubre el arte de la barbería clásica con las comodidades modernas en el corazón de Ciudad del Carmen.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {session ? (
              <>
                <button onClick={() => navigate('/book')} style={btnGold}>Agendar cita</button>
                <button onClick={() => navigate('/my-appointments')} style={btnOutline}>Mis citas</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} style={btnGold}>Iniciar sesión</button>
                <button onClick={() => navigate('/services')} style={btnOutline}>Ver servicios</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nuestros Barberos */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 14, letterSpacing: 3, color: C.gold, textTransform: 'uppercase', marginBottom: 12 }}>Conoce a los Expertos</h2>
          <h3 style={{ fontSize: 32, color: '#fff', margin: 0 }}>Nuestros Barberos</h3>
          <div style={{ width: 40, height: 2, background: C.gold, margin: '24px auto' }} />
        </div>

        {loadingBarbers ? (
          <div style={{ textAlign: 'center', color: C.muted }}>Cargando equipo...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {barbers.length > 0 ? barbers.map(b => (
              <BarberCard key={b.id} barber={b} />
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: C.muted }}>Aún no hay barberos registrados.</div>
            )}
          </div>
        )}
      </div>

      {/* Información Adicional / Footer simple */}
      <div style={{ background: '#0d0d0d', borderTop: `1px solid ${C.border}`, padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 13, letterSpacing: 3, color: C.muted, textTransform: 'uppercase', marginBottom: 32 }}>
          Horarios de Atención
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 64, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, color: '#e8dcc8', marginBottom: 8 }}>Lunes – Sábado</div>
            <div style={{ fontSize: 24, color: C.gold, fontWeight: 'bold' }}>9:00 AM – 8:00 PM</div>
          </div>
          <div style={{ width: 1, height: 40, background: C.border }} className="desktop-only" />
          <div>
            <div style={{ fontSize: 14, color: '#e8dcc8', marginBottom: 8 }}>Domingo</div>
            <div style={{ fontSize: 24, color: C.gold, fontWeight: 'bold' }}>10:00 AM – 4:00 PM</div>
          </div>
        </div>
      </div>

    </div>
  )
}

const btnGold = {
  padding: '16px 36px', background: '#b8963e', border: 'none', borderRadius: 8,
  color: '#000', fontSize: 15, fontWeight: 'bold', fontFamily: "'Georgia', serif",
  letterSpacing: 1, cursor: 'pointer', transition: 'all 0.2s',
  boxShadow: '0 4px 14px rgba(184, 150, 62, 0.3)'
}

const btnOutline = {
  padding: '16px 36px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
  color: '#fff', fontSize: 15, fontFamily: "'Georgia', serif",
  letterSpacing: 0.5, cursor: 'pointer', transition: 'all 0.2s',
}
