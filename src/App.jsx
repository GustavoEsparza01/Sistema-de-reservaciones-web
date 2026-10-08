import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui'
import AdminRoute    from './components/layout/AdminRoute'
import BarberRoute   from './components/layout/BarberRoute'
import Navbar        from './components/layout/Navbar'
import RequireAuth   from './components/layout/RequireAuth'
import RoleHome      from './components/layout/RoleHome'
import AppLayout     from './layouts/AppLayout'
import AuthLayout        from './layouts/AuthLayout'
import Login             from './pages/auth/Login'
import Registro          from './pages/auth/Registro'
import Recuperar         from './pages/auth/Recuperar'
import Restablecer       from './pages/auth/Restablecer'
import Dashboard         from './pages/admin/Dashboard'
import BarberAgenda      from './pages/barber/BarberAgenda'
import Resumen           from './pages/app/Resumen'
import Citas             from './pages/app/Citas'
import Servicios         from './pages/app/Servicios'
import Equipo            from './pages/app/Equipo'
import Agenda            from './pages/app/Agenda'
import Reportes          from './pages/app/Reportes'
import Configuracion     from './pages/app/Configuracion'
import MiAgenda          from './pages/app/MiAgenda'
import PortalLayout      from './layouts/PortalLayout'
import Negocio           from './pages/portal/Negocio'
import Reservar          from './pages/portal/Reservar'
import MisCitas          from './pages/portal/MisCitas'
import DetalleCita       from './pages/portal/DetalleCita'
import Perfil            from './pages/portal/Perfil'

// El Navbar viejo solo se muestra en las páginas que aún no se rediseñan
const LEGACY_PATHS = ['/anterior']
function LegacyNavbar() {
  const { pathname } = useLocation()
  if (!LEGACY_PATHS.some((p) => pathname.startsWith(p))) return null
  return <Navbar />
}

// /my-appointments/:id → /peludos/mis-citas/:id
function LegacyAppointmentRedirect() {
  const { id } = useParams()
  return <Navigate to={`/peludos/mis-citas/${id}`} replace />
}

/*
 * Rutas durante la migración (ver docs/design/PLAN_REDISENO.md):
 * - /app/*        panel nuevo (admin y barbero)
 * - /:slug/*      portal del negocio (página pública, reserva, Mis citas y perfil)
 * - /anterior/*   pantallas anteriores, accesibles mientras dura la migración
 * - /login, /registro, /recuperar, /restablecer   acceso (AuthLayout)
 * - el resto de rutas viejas redirigen a las nuevas
 */
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <LegacyNavbar />
          <Routes>
            {/* Acceso y redirecciones de las rutas viejas */}
            <Route path="/" element={<Navigate to="/peludos" replace />} />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/recuperar" element={<Recuperar />} />
              <Route path="/restablecer" element={<Restablecer />} />
            </Route>
            <Route path="/services" element={<Navigate to="/peludos#servicios" replace />} />
            <Route path="/book" element={<Navigate to="/peludos/reservar" replace />} />
            <Route path="/my-appointments" element={<Navigate to="/peludos/mis-citas" replace />} />
            <Route path="/my-appointments/:id" element={<LegacyAppointmentRedirect />} />
            <Route path="/profile" element={<Navigate to="/peludos/perfil" replace />} />
            <Route element={<BarberRoute />}>
              <Route path="/anterior/agenda-barbero" element={<BarberAgenda />} />
            </Route>
            <Route path="/barber-agenda" element={<Navigate to="/app/mi-agenda" replace />} />

            {/* Después de iniciar sesión: manda a la página de cada rol */}
            <Route path="/inicio" element={<RoleHome />} />

            {/* Panel nuevo (Barber OS) */}
            <Route element={<RequireAuth roles={['admin', 'barber']} />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<RoleHome />} />
                <Route element={<RequireAuth roles={['admin']} />}>
                  <Route path="resumen" element={<Resumen />} />
                  <Route path="citas" element={<Citas />} />
                  <Route path="servicios" element={<Servicios />} />
                  <Route path="equipo" element={<Equipo />} />
                  <Route path="agenda" element={<Agenda />} />
                  <Route path="reportes" element={<Reportes />} />
                  <Route path="configuracion" element={<Configuracion />} />
                </Route>
                <Route element={<RequireAuth roles={['barber']} />}>
                  <Route path="mi-agenda" element={<MiAgenda />} />
                </Route>
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Route>
            </Route>

            {/* Panel anterior, accesible desde la barra lateral mientras dura la migración */}
            <Route element={<AdminRoute />}>
              <Route path="/anterior/admin" element={<Dashboard />} />
            </Route>
            <Route path="/admin" element={<Navigate to="/app/resumen" replace />} />

            {/* Portal del negocio (al final: /:slug captura el primer segmento) */}
            <Route path="/:slug" element={<PortalLayout />}>
              <Route index element={<Negocio />} />
              <Route path="reservar" element={<Reservar />} />
              <Route element={<RequireAuth />}>
                <Route path="mis-citas" element={<MisCitas />} />
                <Route path="mis-citas/:id" element={<DetalleCita />} />
                <Route path="perfil" element={<Perfil />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
