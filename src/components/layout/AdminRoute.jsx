import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminRoute() {
  const { session, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}
