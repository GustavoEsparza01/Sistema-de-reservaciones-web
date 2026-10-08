// Perfil del cliente (design/stitch/13-perfil).
import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useBusiness } from '../../hooks/useBusiness'
import { useMyAppointments } from '../../hooks/useMyAppointments'
import { PasswordForm, ProfileForm } from '../../components/account/AccountForms'
import { Button } from '../../components/ui'

export default function Perfil() {
  const { session } = useAuth()
  const business = useBusiness()
  const { appointments, loading } = useMyAppointments(session?.user.id)
  const visits = appointments.filter((a) => a.status === 'completed').length

  return (
    <div className="max-w-[860px] mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-space-lg">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-space-md">
        <div>
          <h1 className="font-headline-page-mobile text-headline-page-mobile md:font-headline-page md:text-headline-page">Mi perfil</h1>
          <p className="text-body-default text-on-surface-variant">Tus datos de contacto y el acceso a tu cuenta en {business.name}.</p>
        </div>
        <Button as={Link} to={`/${business.slug}/mis-citas`} variant="secondary" icon={CalendarDays} className="self-start sm:self-auto">Mis citas</Button>
      </header>

      <ProfileForm
        title="Información personal"
        description="La barbería usa estos datos para contactarte sobre tus citas."
        subtitle={loading ? ' ' : visits === 0 ? 'Aún sin visitas' : `${visits} ${visits === 1 ? 'visita' : 'visitas'} en ${business.name}`}
        showRoles={false}
      />
      <PasswordForm />
    </div>
  )
}
