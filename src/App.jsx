import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminRoute    from './components/layout/AdminRoute'
import BarberRoute   from './components/layout/BarberRoute'
import Navbar        from './components/layout/Navbar'
import RequireAuth   from './components/layout/RequireAuth'
import RoleHome      from './components/layout/RoleHome'
import AppLayout     from './layouts/AppLayout'
import Home              from './pages/Home'
import Login             from './pages/Login'
import Services          from './pages/Services'
import BookAppointment   from './pages/BookAppointment'
import MyAppointments    from './pages/MyAppointments'
import AppointmentDetails from './pages/AppointmentDetails'
import Profile           from './pages/Profile'
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

// El Navbar viejo solo se muestra en las páginas que aún no se rediseñan
function LegacyNavbar() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/app') || pathname === '/inicio') return null
  return <Navbar />
}

/*
 * Rutas durante la migración (ver docs/design/PLAN_REDISENO.md):
 * - /app/*        panel nuevo (admin y barbero)
 * - /anterior/*   pantallas anteriores que el panel nuevo aún no reemplaza
 * - resto         páginas actuales del cliente, hasta la Fase 4
 */
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <LegacyNavbar />
          <Routes>
            {/* Páginas actuales (cliente y públicas) */}
            <Route path="/"      element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/services" element={<Services />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/book"            element={<BookAppointment />} />
              <Route path="/my-appointments" element={<MyAppointments />} />
              <Route path="/my-appointments/:id" element={<AppointmentDetails />} />
              <Route path="/profile"         element={<Profile />} />
            </Route>
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

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
