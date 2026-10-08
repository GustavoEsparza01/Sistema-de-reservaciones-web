import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { homePathFor } from '../../lib/roles'
import Spinner from '../ui/Spinner'

/** Redirige a la página de inicio del rol del usuario (o al login si no hay sesión). */
export default function RoleHome() {
  const auth = useAuth()

  if (auth.loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-on-surface-variant">
        <Spinner size={24} />
      </div>
    )
  }

  if (!auth.session) return <Navigate to="/login" replace />
  return <Navigate to={homePathFor(auth)} replace />
}
