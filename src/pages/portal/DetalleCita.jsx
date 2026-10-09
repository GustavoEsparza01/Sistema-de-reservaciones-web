// Detalle de una cita del cliente (design/stitch/12-mis-citas, screen-detalle).
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, CalendarClock, CalendarDays, CalendarPlus, CalendarX, CircleAlert, Clock, MapPin, NotebookPen, RotateCcw, Scissors, StickyNote,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useBusiness } from '../../hooks/useBusiness'
import { canCancel, canReschedule, googleCalendarLink, useMyAppointments } from '../../hooks/useMyAppointments'
import { splitNotes } from '../../lib/appointments'
import { formatDate, formatDateLong, formatDuration, formatMoneyMXN, formatTime } from '../../lib/format'
import { Avatar, Button, EmptyState, Skeleton, StatusBadge } from '../../components/ui'
import PortalCard from '../../components/portal/PortalCard'
import { useClientAppointmentActions } from '../../components/portal/ClientAppointmentActions'

const STATUS_HELP = {
  pending: 'La barbería aún no confirma esta cita. Te recomendamos revisarla más tarde.',
  accepted: 'Tu cita está confirmada. Te recomendamos llegar 5 minutos antes.',
  completed: 'Esta cita ya se realizó. ¡Gracias por tu visita!',
  cancelled: 'Esta cita fue cancelada y el horario quedó libre.',
}

function Info({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-space-sm">
      <Icon size={18} strokeWidth={1.75} className="mt-0.5 text-ink/70 shrink-0" aria-hidden />
      <div className="min-w-0">
        <dt className="text-body-sm text-ink/70">{label}</dt>
        <dd className="text-body-default first-letter:uppercase">{children}</dd>
      </div>
    </div>
  )
}

export default function DetalleCita() {
  const { id } = useParams()
  const { session } = useAuth()
  const business = useBusiness()
  const base = `/${business.slug}`
  const data = useMyAppointments(session?.user.id)
  const actions = useClientAppointmentActions(() => data.reload({ silent: true }))
  const a = data.appointments.find((x) => x.id === id)

  const back = (
    <Link
      to={`${base}/mis-citas`}
      className="self-start inline-flex items-center gap-space-xs h-11 -ml-1 px-1 rounded text-body-medium text-ink/70 hover:text-gold-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
    >
      <ArrowLeft size={18} strokeWidth={1.75} aria-hidden /> Volver a Mis citas
    </Link>
  )

  if (data.loading) {
    return (
      <div className="max-w-[960px] mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-space-md">
        {back}
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (!a) {
    return (
      <div className="max-w-[960px] mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-space-md">
        {back}
        <PortalCard>
          <EmptyState icon={CircleAlert} title="No encontramos esta cita" description="Puede que el enlace sea incorrecto o que la cita pertenezca a otra cuenta." />
        </PortalCard>
      </div>
    )
  }

  const end = a.end ?? new Date(a.start.getTime() + (a.duration ?? 30) * 60000)
  const notes = splitNotes(a.notes)
  const past = end <= new Date()

  return (
    <div className="max-w-[960px] mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-space-lg">
      {back}

      <header className="flex flex-wrap items-start justify-between gap-space-md">
        <div>
          <p className="text-body-sm text-ink/70 tabular-nums">
            Folio #{a.id.slice(0, 8).toUpperCase()}{a.createdAt ? ` · reservada el ${formatDate(a.createdAt)}` : ''}
          </p>
          <h1 className="font-display text-[32px] md:text-[40px] leading-tight font-semibold text-ink">{a.serviceName}</h1>
        </div>
        <StatusBadge status={a.status} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-gutter items-start">
        <PortalCard className="flex flex-col gap-space-lg">
          <p className="text-body-sm text-ink/70 bg-cream rounded-lg px-3 py-2">
            {past && (a.status === 'pending' || a.status === 'accepted') ? 'Esta cita ya pasó.' : STATUS_HELP[a.status]}
          </p>

          <div className="flex items-center gap-space-md">
            <Avatar name={a.barberName} size="lg" tone="premium" />
            <div>
              <p className="text-body-sm text-ink/70">Te atiende</p>
              <p className="font-body-semibold">{a.barberName}</p>
            </div>
          </div>

          <dl className="grid sm:grid-cols-2 gap-space-md">
            <Info icon={CalendarDays} label="Fecha">{formatDateLong(a.start)}</Info>
            <Info icon={Clock} label="Horario">{formatTime(a.start)} – {formatTime(end)} h ({formatDuration(a.duration)})</Info>
            <Info icon={Scissors} label="Servicio">{a.serviceName} · {formatMoneyMXN(a.price)}</Info>
            <Info icon={MapPin} label="Lugar">{business.name}, {business.city}</Info>
          </dl>

          {notes.client && (
            <div className="flex gap-space-sm text-body-sm bg-gold-soft text-ink rounded-lg px-3 py-2">
              <StickyNote size={16} className="shrink-0 mt-0.5" aria-hidden />
              <p><span className="font-body-medium">Tus indicaciones:</span> {notes.client}</p>
            </div>
          )}
          {notes.barber && (
            <div className="flex gap-space-sm text-body-sm bg-cream rounded-lg px-3 py-2">
              <NotebookPen size={16} className="shrink-0 mt-0.5" aria-hidden />
              <p><span className="font-body-medium">Nota de tu barbero:</span> {notes.barber}</p>
            </div>
          )}
        </PortalCard>

        <aside className="flex flex-col gap-space-sm">
          <PortalCard className="flex flex-col gap-space-sm">
            <h2 className="font-display text-[20px] font-semibold text-ink">Acciones</h2>
            {canReschedule(a) && <Button variant="outline-dark" icon={CalendarClock} className="justify-center" onClick={() => actions.reschedule(a)}>Reprogramar</Button>}
            {canCancel(a) && <Button variant="outline-dark" icon={CalendarX} className="justify-center" onClick={() => actions.cancel(a)}>Cancelar cita</Button>}
            {(a.status === 'pending' || a.status === 'accepted') && end > new Date() && (
              <Button
                as="a"
                target="_blank"
                rel="noreferrer"
                href={googleCalendarLink({ title: `${a.serviceName} · ${business.name}`, start: a.start, end, location: `${business.name}, ${business.city}` })}
                variant="outline-dark"
                icon={CalendarPlus}
                className="justify-center"
              >
                Agregar a Google Calendar
              </Button>
            )}
            {(a.status === 'completed' || a.status === 'cancelled' || past) && (
              <Button as={Link} to={`${base}/reservar?servicio=${a.serviceId}${a.barberId ? `&barbero=${a.barberId}` : ''}`} variant="gold" icon={RotateCcw} className="justify-center">
                Volver a reservar
              </Button>
            )}
            {a.status === 'accepted' && !past && (
              <p className="text-[12px] text-ink/70">Para cambiar una cita ya confirmada, cancélala y reserva otro horario.</p>
            )}
          </PortalCard>
          <Button
            as="a"
            target="_blank"
            rel="noreferrer"
            href={`https://www.google.com/maps/search/${encodeURIComponent(`${business.name} ${business.city}`)}`}
            variant="outline-dark"
            icon={MapPin}
            className="justify-center"
          >
            Cómo llegar
          </Button>
        </aside>
      </div>

      {actions.modals}
    </div>
  )
}
