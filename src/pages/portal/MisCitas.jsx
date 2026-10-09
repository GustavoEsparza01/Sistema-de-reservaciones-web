// Mis citas del cliente (design/stitch/12-mis-citas).
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, CalendarClock, CalendarPlus, CalendarX, CircleAlert, Clock, MapPin, RefreshCw, RotateCcw, Scissors, StickyNote, User,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useBusiness } from '../../hooks/useBusiness'
import { canCancel, canReschedule, googleCalendarLink, isUpcoming, useMyAppointments } from '../../hooks/useMyAppointments'
import { splitNotes } from '../../lib/appointments'
import { formatDate, formatDateLong, formatDuration, formatMoneyMXN, formatRelative, formatTime } from '../../lib/format'
import { Avatar, Button, EmptyState, Skeleton, StatusBadge, Tabs } from '../../components/ui'
import PortalCard from '../../components/portal/PortalCard'
import { useClientAppointmentActions } from '../../components/portal/ClientAppointmentActions'

function Row({ a, base, action }) {
  return (
    <li className="flex flex-wrap sm:flex-nowrap items-center gap-x-space-md gap-y-space-sm px-5 py-space-md hover:bg-cream transition-colors">
      <Link
        to={`${base}/mis-citas/${a.id}`}
        className="flex flex-1 min-w-0 flex-wrap sm:flex-nowrap items-center gap-space-md rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        <div className="w-36 shrink-0">
          <p className="font-body-semibold tabular-nums whitespace-nowrap first-letter:uppercase">{formatDate(a.start)}</p>
          <p className="text-body-sm text-ink/70 tabular-nums">{formatTime(a.start)} h · {formatDuration(a.duration)}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-body-medium truncate">{a.serviceName}</p>
          <p className="text-body-sm text-ink/70 truncate">con {a.barberName}</p>
        </div>
        <span className="tabular-nums text-body-sm font-body-medium whitespace-nowrap">{formatMoneyMXN(a.price)}</span>
        <StatusBadge status={a.status} />
      </Link>
      {action}
    </li>
  )
}

export default function MisCitas() {
  const { session } = useAuth()
  const business = useBusiness()
  const base = `/${business.slug}`
  const data = useMyAppointments(session?.user.id)
  const actions = useClientAppointmentActions(() => data.reload({ silent: true }))
  const [params, setParams] = useSearchParams()
  const tab = params.get('vista') ?? 'proximas'

  const groups = useMemo(() => {
    const now = new Date()
    const upcoming = data.appointments.filter((a) => isUpcoming(a, now)).sort((x, y) => x.start - y.start)
    const cancelled = data.appointments.filter((a) => a.status === 'cancelled')
    const history = data.appointments.filter((a) => a.status !== 'cancelled' && !isUpcoming(a, now))
    return { upcoming, history, cancelled }
  }, [data.appointments])

  const next = groups.upcoming[0]
  const visits = groups.history.filter((a) => a.status === 'completed').length

  return (
    <div className="max-w-[960px] mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-space-lg">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-space-md">
        <div>
          <h1 className="font-display text-[32px] md:text-[40px] leading-tight font-semibold text-ink">Mis citas</h1>
          <p className="text-body-default text-ink/70">
            Tus reservaciones en {business.name}{!data.loading && visits > 0 ? ` · ${visits} ${visits === 1 ? 'visita' : 'visitas'}` : ''}
          </p>
        </div>
        <Button as={Link} to={`${base}/reservar`} variant="gold" icon={CalendarPlus} className="self-start sm:self-auto">Nueva reserva</Button>
      </header>

      <Tabs
        tone="premium"
        value={tab}
        onChange={(v) => setParams(v === 'proximas' ? {} : { vista: v }, { replace: true })}
        items={[
          { value: 'proximas', label: 'Próximas', count: data.loading ? null : groups.upcoming.length },
          { value: 'historial', label: 'Historial', count: data.loading ? null : groups.history.length },
          { value: 'canceladas', label: 'Canceladas', count: data.loading ? null : groups.cancelled.length },
        ]}
      />

      {data.error ? (
        <PortalCard>
          <EmptyState icon={CircleAlert} title="No pudimos cargar tus citas" description="Revisa tu conexión e inténtalo de nuevo."
            action={<Button variant="outline-dark" icon={RefreshCw} onClick={() => data.reload()}>Reintentar</Button>} />
        </PortalCard>
      ) : data.loading ? (
        <div className="flex flex-col gap-space-sm">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}</div>
      ) : tab === 'proximas' ? (
        groups.upcoming.length === 0 ? (
          <PortalCard>
            <EmptyState icon={CalendarPlus} title="No tienes citas próximas" description="Reserva en un par de minutos y elige el horario que más te acomode."
              action={<Button as={Link} to={`${base}/reservar`} variant="gold" icon={CalendarPlus}>Reservar cita</Button>} />
          </PortalCard>
        ) : (
          <>
            {/* Próxima cita, en carbón como el resumen de la reserva: es lo primero que el cliente busca */}
            <PortalCard tone="ink" className="flex flex-col gap-space-md">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-gold-light">Tu próxima cita · {formatRelative(next.start)}</span>
                <StatusBadge status={next.status} />
              </div>
              <div>
                <p className="font-display text-[24px] font-semibold text-white first-letter:uppercase">{formatDateLong(next.start)}</p>
                <p className="text-body-default text-white/70 tabular-nums">
                  {formatTime(next.start)}{next.end ? ` – ${formatTime(next.end)}` : ''} h · {formatDuration(next.duration)}
                </p>
              </div>
              <dl className="grid sm:grid-cols-3 gap-space-md text-body-sm">
                <div className="flex gap-space-sm"><Scissors size={16} className="mt-0.5 text-gold" aria-hidden />
                  <div><dt className="text-white/70">Servicio</dt><dd className="font-body-medium">{next.serviceName} · {formatMoneyMXN(next.price)}</dd></div></div>
                <div className="flex gap-space-sm"><User size={16} className="mt-0.5 text-gold" aria-hidden />
                  <div><dt className="text-white/70">Barbero</dt><dd className="font-body-medium">{next.barberName}</dd></div></div>
                <div className="flex gap-space-sm"><MapPin size={16} className="mt-0.5 text-gold" aria-hidden />
                  <div><dt className="text-white/70">Lugar</dt><dd className="font-body-medium">{business.name}, {business.city}</dd></div></div>
              </dl>
              {splitNotes(next.notes).client && (
                <p className="flex gap-space-xs text-body-sm bg-white/5 rounded-lg px-3 py-2">
                  <StickyNote size={16} className="shrink-0 mt-0.5" aria-hidden /> {splitNotes(next.notes).client}
                </p>
              )}
              {next.status === 'pending' && (
                <p className="flex gap-space-xs text-body-sm text-gold-light bg-gold/10 rounded-lg px-3 py-2">
                  <Clock size={16} className="shrink-0 mt-0.5" aria-hidden /> La barbería aún no confirma esta cita.
                </p>
              )}
              <div className="flex flex-wrap gap-space-sm pt-space-xs">
                {canReschedule(next) && <Button variant="outline-light" icon={CalendarClock} onClick={() => actions.reschedule(next)}>Reprogramar</Button>}
                {canCancel(next) && <Button variant="outline-light" icon={CalendarX} onClick={() => actions.cancel(next)}>Cancelar cita</Button>}
                <Button
                  as="a"
                  variant="outline-light"
                  icon={CalendarPlus}
                  target="_blank"
                  rel="noreferrer"
                  href={googleCalendarLink({
                    title: `${next.serviceName} · ${business.name}`,
                    start: next.start,
                    end: next.end ?? new Date(next.start.getTime() + (next.duration ?? 30) * 60000),
                    location: `${business.name}, ${business.city}`,
                  })}
                >
                  Google Calendar
                </Button>
                <Button as={Link} to={`${base}/mis-citas/${next.id}`} variant="gold" iconRight={ArrowRight} className="sm:ml-auto">Ver detalle</Button>
              </div>
            </PortalCard>

            {groups.upcoming.length > 1 && (
              <PortalCard padding={false} className="overflow-hidden">
                <div className="px-5 pt-5 pb-2">
                  <h2 className="font-display text-[20px] font-semibold text-ink">Otras citas programadas</h2>
                </div>
                <ul className="divide-y divide-ink/10">
                  {groups.upcoming.slice(1).map((a) => <Row key={a.id} a={a} base={base} />)}
                </ul>
              </PortalCard>
            )}
          </>
        )
      ) : (
        (() => {
          const list = tab === 'historial' ? groups.history : groups.cancelled
          if (list.length === 0) {
            return (
              <PortalCard>
                <EmptyState
                  icon={tab === 'historial' ? Scissors : CalendarX}
                  title={tab === 'historial' ? 'Aún no tienes visitas' : 'No tienes citas canceladas'}
                  description={tab === 'historial' ? 'Aquí verás tus citas pasadas.' : 'Todas tus citas siguen activas o ya se completaron.'}
                />
              </PortalCard>
            )
          }
          return (
            <PortalCard padding={false} className="overflow-hidden">
              <ul className="divide-y divide-ink/10">
                {list.map((a) => (
                  <Row
                    key={a.id}
                    a={a}
                    base={base}
                    action={
                      tab === 'historial' && a.status === 'completed' ? (
                        <Button
                          as={Link}
                          to={`${base}/reservar?servicio=${a.serviceId}${a.barberId ? `&barbero=${a.barberId}` : ''}`}
                          variant="outline-dark"
                          icon={RotateCcw}
                        >
                          Volver a pedir
                        </Button>
                      ) : null
                    }
                  />
                ))}
              </ul>
            </PortalCard>
          )
        })()
      )}

      {actions.modals}
    </div>
  )
}
