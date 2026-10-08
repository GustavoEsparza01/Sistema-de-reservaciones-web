import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hasRole, homePathFor } from '../../lib/roles'
import Spinner from '../ui/Spinner'

/**
 * Protege un grupo de rutas.
 *   <Route element={<RequireAuth />}>                 cualquier usuario con sesión
 *   <Route element={<RequireAuth roles={['admin']} />}>  solo admin
 *   <Route element={<RequireAuth roles={['barber']} />}> barbero (o admin que es barbero)
 *
 * Sin sesión → /login?volver=<ruta actual>
 * Sin permiso → página de inicio de su rol
 */
export default function RequireAuth({ roles }) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-on-surface-variant">
        <Spinner size={24} />
      </div>
    )
  }

  if (!auth.session) {
    const volver = location.pathname + location.search
    return <Navigate to={`/login?volver=${encodeURIComponent(volver)}`} replace />
  }

  if (!hasRole(auth, roles)) {
    return <Navigate to={homePathFor(auth)} replace />
  }

  return <Outlet />
}
