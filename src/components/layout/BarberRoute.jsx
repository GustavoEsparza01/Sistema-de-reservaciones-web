import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function BarberRoute() {
  const { isBarber, loading } = useAuth()

  if (loading) return <div style={{ padding: 20, color: '#b8963e', fontFamily: 'Georgia' }}>Cargando...</div>

  // Si no es barbero, lo enviamos al inicio
  return isBarber ? <Outlet /> : <Navigate to="/" />
}
