import React from 'react'

const C = {
  card: '#111111',
  border: '#2a2a2a',
  gold: '#b8963e',
  text: '#d4c9b8',
  muted: '#555555',
}

export default function BarberCard({ barber }) {
  // Iniciales falsas para el avatar si no hay foto
  const name = barber.profiles?.full_name || 'Barbero'
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

  return (
    <div style={{
      background: C.card,
      border: `0.5px solid ${C.border}`,
      borderRadius: 14,
      padding: '24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transition: 'transform 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        width: 80, height: 80, borderRadius: '50%', background: '#1a1a1a', border: `2px solid ${C.gold}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: C.gold,
        marginBottom: 16, fontFamily: "'Georgia', serif", fontWeight: 'bold'
      }}>
        {initials}
      </div>
      <div style={{ fontSize: 18, color: '#e8dcc8', fontWeight: 'bold', fontFamily: "'Georgia', serif", marginBottom: 4 }}>
        {name}
      </div>
      <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>
        Master Barber
      </div>
    </div>
  )
}
