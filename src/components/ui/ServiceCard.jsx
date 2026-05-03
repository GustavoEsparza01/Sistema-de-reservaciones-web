import React from 'react'

const C = {
  card: '#111111',
  border: '#2a2a2a',
  gold: '#b8963e',
  text: '#d4c9b8',
  muted: '#555555',
}

export default function ServiceCard({ service }) {
  // Opciones de íconos baseados en palabras clave
  let icon = '✂️'
  const n = service.name.toLowerCase()
  if (n.includes('barba')) icon = '🪒'
  if (n.includes('tinte') || n.includes('color')) icon = '🎨'
  if (n.includes('tratamiento') || n.includes('facial')) icon = '✨'
  if (n.includes('niño')) icon = '👦'

  return (
    <div style={{
      background: C.card,
      border: `0.5px solid ${C.border}`,
      borderRadius: 14,
      padding: '24px 20px',
      textAlign: 'center',
      transition: 'transform 0.2s',
      cursor: 'default'
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, color: '#e8dcc8', fontWeight: 700, marginBottom: 8, fontFamily: "'Georgia', serif" }}>
        {service.name}
      </div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 16 }}>
        {service.duration_min} minutos
      </div>
      <div style={{ fontSize: 18, color: C.gold, fontWeight: 'bold' }}>
        ${service.price}
      </div>
    </div>
  )
}
