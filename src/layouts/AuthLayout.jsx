import { Link, Outlet } from 'react-router-dom'
import { CalendarCheck, Clock, Scissors, Users } from 'lucide-react'
import Logo from '../components/app/Logo'
import { useBusiness } from '../hooks/useBusiness'

const FEATURES = [
  { icon: CalendarCheck, title: 'Reserva en minutos', text: 'Elige servicio, barbero y un horario que de verdad está libre.' },
  { icon: Clock, title: 'Tus citas en un solo lugar', text: 'Consulta, reprograma o cancela desde tu cuenta.' },
  { icon: Users, title: 'Para todo el equipo', text: 'El dueño ve su negocio completo y cada barbero su agenda del día.' },
]

/**
 * Pantallas de acceso (login, registro y recuperar contraseña):
 * formulario a la izquierda y panel informativo a la derecha en pantallas grandes.
 */
export default function AuthLayout() {
  const business = useBusiness()

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface-container-lowest font-sans text-on-surface">
      <div className="flex flex-col px-margin-mobile sm:px-margin py-space-lg">
        <div className="flex items-center justify-between">
          <Link to={`/${business.slug}`} className="flex items-center gap-space-sm" aria-label={`Ir a ${business.name}`}>
            <span className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
              <Scissors size={16} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="font-body-semibold">{business.name}</span>
          </Link>
          <Link to={`/${business.slug}`} className="text-body-sm text-on-surface-variant hover:text-on-surface">Volver al sitio</Link>
        </div>

        <main className="flex-1 flex items-center justify-center py-space-xl">
          <div className="w-full max-w-[400px]">
            <Outlet />
          </div>
        </main>

        <p className="text-[12px] text-on-surface-variant text-center flex items-center justify-center gap-1.5">
          Reservas con <Logo className="scale-90" />
        </p>
      </div>

      <aside className="hidden lg:flex flex-col justify-center gap-space-xl bg-inverse-surface text-inverse-on-surface px-[64px] py-space-xl">
        <div className="flex flex-col gap-space-sm max-w-md">
          <p className="text-body-sm text-slate-400">{business.name} · {business.city}</p>
          <h2 className="text-[32px] leading-tight font-semibold tracking-tight text-white">Tu próxima cita, sin llamadas ni esperas.</h2>
        </div>
        <ul className="flex flex-col gap-space-md max-w-md">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-space-md">
              <span className="w-10 h-10 rounded-lg bg-white/10 text-blue-300 flex items-center justify-center shrink-0">
                <Icon size={20} strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <p className="font-body-semibold text-white">{title}</p>
                <p className="text-body-sm text-slate-300">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
