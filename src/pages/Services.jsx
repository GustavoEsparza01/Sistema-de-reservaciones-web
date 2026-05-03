import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ServiceCard from '../components/ui/ServiceCard'
import { useNavigate } from 'react-router-dom'

const C = {
  bg: '#0a0a0a', card: '#111', border: '#2a2a2a',
  gold: '#b8963e', text: '#d4c9b8', muted: '#555', divider: '#1e1e1e',
}

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })
      
      if (!error && data) {
        setServices(data)
      }
      setLoading(false)
    }
    loadServices()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Georgia', serif", color: C.text, paddingBottom: 80 }}>
      
      {/* Header */}
      <div style={{ padding: '60px 24px', textAlign: 'center', background: '#0d0d0d', borderBottom: `0.5px solid ${C.divider}` }}>
        <h1 style={{ fontSize: 32, color: '#e8dcc8', margin: '0 0 16px', fontWeight: 'bold' }}>Nuestros Servicios</h1>
        <p style={{ color: C.muted, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
          Ofrecemos cortes de cabello de primera calidad, arreglos de barba y tratamientos especializados. Diseñados para que luzcas tu mejor versión.
        </p>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: C.gold, padding: 40 }}>Cargando catálogo...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
            {services.map(s => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginTop: 20, padding: '0 24px' }}>
        <h3 style={{ color: '#e8dcc8', marginBottom: 20 }}>¿Listo para un cambio?</h3>
        <button 
          onClick={() => navigate('/book')}
          style={{
            padding: '14px 36px', background: C.gold, color: '#000', border: 'none', borderRadius: 8,
            fontSize: 15, fontWeight: 'bold', fontFamily: "'Georgia', serif", cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(184, 150, 62, 0.2)'
          }}
        >
          Agendar Cita Ahora
        </button>
      </div>

    </div>
  )
}
