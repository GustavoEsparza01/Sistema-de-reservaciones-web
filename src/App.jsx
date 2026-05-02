import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminRoute    from './components/layout/AdminRoute'
import Navbar        from './components/layout/Navbar'
import Home              from './pages/Home'
import Login             from './pages/Login'
import Services          from './pages/Services'
import BookAppointment   from './pages/BookAppointment'
import MyAppointments    from './pages/MyAppointments'
import Profile           from './pages/Profile'
import Dashboard         from './pages/admin/Dashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"      element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/services" element={<Services />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/book"            element={<BookAppointment />} />
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/profile"         element={<Profile />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
