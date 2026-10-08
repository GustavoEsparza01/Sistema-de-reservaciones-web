import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminRoute    from './components/layout/AdminRoute'
import BarberRoute   from './components/layout/BarberRoute'
import Navbar        from './components/layout/Navbar'
import Home              from './pages/Home'
import Login             from './pages/Login'
import Services          from './pages/Services'
import BookAppointment   from './pages/BookAppointment'
import MyAppointments    from './pages/MyAppointments'
import AppointmentDetails from './pages/AppointmentDetails'
import Profile           from './pages/Profile'
import Dashboard         from './pages/admin/Dashboard'
import BarberAgenda      from './pages/barber/BarberAgenda'
import UiPreview         from './pages/app/UiPreview'

// El Navbar viejo solo se muestra en las páginas que aún no se rediseñan
function LegacyNavbar() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/app')) return null
  return <Navbar />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <LegacyNavbar />
          <Routes>
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
              <Route path="/barber-agenda" element={<BarberAgenda />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Dashboard />} />
            </Route>

            {/* Temporal (Fase 1): muestra de componentes base */}
            <Route path="/app/_ui" element={<UiPreview />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
