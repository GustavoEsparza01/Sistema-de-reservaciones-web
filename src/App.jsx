import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Spinner, ToastProvider } from './components/ui'
import RequireAuth from './components/layout/RequireAuth'
import RoleHome from './components/layout/RoleHome'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import PortalLayout from './layouts/PortalLayout'

// Cada pantalla se descarga solo cuando se visita
const Login = lazy(() => import('./pages/auth/Login'))
const Registro = lazy(() => import('./pages/auth/Registro'))
const Recuperar = lazy(() => import('./pages/auth/Recuperar'))
const Restablecer = lazy(() => import('./pages/auth/Restablecer'))
const Resumen = lazy(() => import('./pages/app/Resumen'))
const Agenda = lazy(() => import('./pages/app/Agenda'))
const Citas = lazy(() => import('./pages/app/Citas'))
const Clientes = lazy(() => import('./pages/app/Clientes'))
const Equipo = lazy(() => import('./pages/app/Equipo'))
const Servicios = lazy(() => import('./pages/app/Servicios'))
const Reportes = lazy(() => import('./pages/app/Reportes'))
const Configuracion = lazy(() => import('./pages/app/Configuracion'))
const MiAgenda = lazy(() => import('./pages/app/MiAgenda'))
const Negocio = lazy(() => import('./pages/portal/Negocio'))
const Reservar = lazy(() => import('./pages/portal/Reservar'))
const MisCitas = lazy(() => import('./pages/portal/MisCitas'))
const DetalleCita = lazy(() => import('./pages/portal/DetalleCita'))
const Perfil = lazy(() => import('./pages/portal/Perfil'))

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-on-surface-variant">
      <Spinner size={24} />
    </div>
  )
}

const page = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
)

// /my-appointments/:id (dirección anterior) → /peludos/mis-citas/:id
function OldAppointmentRedirect() {
  const { id } = useParams()
  return <Navigate to={`/peludos/mis-citas/${id}`} replace />
}

/*
 * Rutas (ver docs/design/PLAN_REDISENO.md):
 * - /app/*                    panel de admin y barbero
 * - /:slug/*                  portal del negocio: página pública, reserva, Mis citas y perfil
 * - /login, /registro, /recuperar, /restablecer   acceso
 * - las direcciones de la versión anterior redirigen a las nuevas
 */
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/peludos" replace />} />

            {/* Acceso */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={page(Login)} />
              <Route path="/registro" element={page(Registro)} />
              <Route path="/recuperar" element={page(Recuperar)} />
              <Route path="/restablecer" element={page(Restablecer)} />
            </Route>

            {/* Después de iniciar sesión: manda a la página de cada rol */}
            <Route path="/inicio" element={<RoleHome />} />

            {/* Panel (Barber OS) */}
            <Route element={<RequireAuth roles={['admin', 'barber']} />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<RoleHome />} />
                <Route element={<RequireAuth roles={['admin']} />}>
                  <Route path="resumen" element={page(Resumen)} />
                  <Route path="agenda" element={page(Agenda)} />
                  <Route path="citas" element={page(Citas)} />
                  <Route path="clientes" element={page(Clientes)} />
                  <Route path="equipo" element={page(Equipo)} />
                  <Route path="servicios" element={page(Servicios)} />
                  <Route path="reportes" element={page(Reportes)} />
                  <Route path="configuracion" element={page(Configuracion)} />
                </Route>
                <Route element={<RequireAuth roles={['barber']} />}>
                  <Route path="mi-agenda" element={page(MiAgenda)} />
                </Route>
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Route>
            </Route>

            {/* Direcciones de la versión anterior */}
            <Route path="/admin" element={<Navigate to="/app/resumen" replace />} />
            <Route path="/barber-agenda" element={<Navigate to="/app/mi-agenda" replace />} />
            <Route path="/anterior/*" element={<Navigate to="/app" replace />} />
            <Route path="/services" element={<Navigate to="/peludos#servicios" replace />} />
            <Route path="/book" element={<Navigate to="/peludos/reservar" replace />} />
            <Route path="/my-appointments" element={<Navigate to="/peludos/mis-citas" replace />} />
            <Route path="/my-appointments/:id" element={<OldAppointmentRedirect />} />
            <Route path="/profile" element={<Navigate to="/peludos/perfil" replace />} />

            {/* Portal del negocio (al final: /:slug captura el primer segmento) */}
            <Route path="/:slug" element={<PortalLayout />}>
              <Route index element={page(Negocio)} />
              <Route path="reservar" element={page(Reservar)} />
              <Route element={<RequireAuth />}>
                <Route path="mis-citas" element={page(MisCitas)} />
                <Route path="mis-citas/:id" element={page(DetalleCita)} />
                <Route path="perfil" element={page(Perfil)} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
