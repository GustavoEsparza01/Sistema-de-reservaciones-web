import { useState } from 'react'
import ManageAppointments from './ManageAppointments'
import Reports from './Reports'
import ManageBarbers from './ManageBarbers'
import ManageServices from './ManageServices'
import ManageClients from './ManageClients'

const C = {
  bg: '#0a0a0a',
  text: '#d4c9b8',
  border: '#2a2a2a',
  gold: '#b8963e',
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('citas')

  const tabStyle = (tabId) => ({
    padding: '10px 20px',
    background: activeTab === tabId ? C.gold : 'transparent',
    color: activeTab === tabId ? '#000' : C.text,
    border: `0.5px solid ${activeTab === tabId ? C.gold : C.border}`,
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: "'Georgia', serif",
    fontWeight: activeTab === tabId ? 'bold' : 'normal',
    fontSize: 14,
    transition: 'all 0.2s',
  })

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '32px 16px', fontFamily: "'Georgia', serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24, borderBottom: `0.5px solid ${C.border}`, paddingBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: 24, margin: 0, color: '#e8dcc8', letterSpacing: 1 }}>Panel de Control</h1>
            <div style={{ fontSize: 13, color: '#b8963e' }}>Vista de Administrador</div>
          </div>
          
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button style={tabStyle('citas')} onClick={() => setActiveTab('citas')}>Citas</button>
            <button style={tabStyle('reportes')} onClick={() => setActiveTab('reportes')}>Reportes</button>
            <button style={tabStyle('clientes')} onClick={() => setActiveTab('clientes')}>Clientes</button>
            <button style={tabStyle('barberos')} onClick={() => setActiveTab('barberos')}>Barberos</button>
            <button style={tabStyle('servicios')} onClick={() => setActiveTab('servicios')}>Servicios</button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'citas' && <ManageAppointments />}
        {activeTab === 'reportes' && <Reports />}
        {activeTab === 'clientes' && <ManageClients />}
        {activeTab === 'barberos' && <ManageBarbers />}
        {activeTab === 'servicios' && <ManageServices />}

      </div>
    </div>
  )
}
