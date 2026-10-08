// Página pública del negocio (design/stitch/10-pagina-publica).
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CalendarCheck, CalendarPlus, Clock, CircleAlert, MapPin, Store, Timer, Undo2 } from 'lucide-react'
import { openStatus, useBusiness } from '../../hooks/useBusiness'
import { fetchPublicBarbers, fetchPublicServices } from '../../lib/publicData'
import { formatDuration, formatMoneyMXN } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Avatar, Button, Card, EmptyState, Skeleton } from '../../components/ui'

function usePublicData() {
  const [state, setState] = useState({ services: [], barbers: [], loading: true, error: null })
  useEffect(() => {
    let alive = true
    Promise.all([fetchPublicServices(), fetchPublicBarbers()])
      .then(([services, barbers]) => alive && setState({ services, barbers, loading: false, error: null }))
      .catch((error) => alive && setState((s) => ({ ...s, loading: false, error })))
    return () => { alive = false }
  }, [])
  return state
}

function SectionTitle({ id, title, description }) {
  return (
    <div id={id} className="scroll-mt-24 flex flex-col gap-space-xs">
      <h2 className="font-headline-page-mobile text-headline-page-mobile md:font-headline-page md:text-headline-page">{title}</h2>
      {description && <p className="text-body-default text-on-surface-variant max-w-2xl">{description}</p>}
    </div>
  )
}

export default function Negocio() {
  const business = useBusiness()
  const { services, barbers, loading, error } = usePublicData()
  const { hash } = useLocation()
  const status = openStatus(business)
  const base = `/${business.slug}`

  // Ir a la sección del enlace (#servicios, #equipo, #horarios)
  useEffect(() => {
    if (!hash || loading) return
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash, loading])

  return (
    <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-[56px]">
      {/* Presentación */}
      <section className="rounded-xl bg-inverse-surface text-inverse-on-surface p-space-lg md:p-[40px] flex flex-col md:flex-row md:items-end md:justify-between gap-space-lg">
        <div className="flex flex-col gap-space-md max-w-2xl">
          <span
            className={cn(
              'self-start inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold',
              status.open ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-slate-300'
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', status.open ? 'bg-emerald-400' : 'bg-slate-400')} aria-hidden />
            {status.text}
          </span>
          <h1 className="text-[32px] md:text-[40px] leading-tight font-semibold tracking-tight text-white">{business.name}</h1>
          <p className="text-body-default text-slate-300">{business.tagline}</p>
          <p className="flex items-center gap-1.5 text-body-sm text-slate-300">
            <MapPin size={16} strokeWidth={1.75} aria-hidden /> {business.city}
          </p>
        </div>
        <Button as={Link} to={`${base}/reservar`} icon={CalendarPlus} className="self-start md:self-auto h-11 px-space-lg text-body-semibold">
          Reservar cita
        </Button>
      </section>

      {error && (
        <Card>
          <EmptyState icon={CircleAlert} title="No se pudo cargar la información" description="Revisa tu conexión y recarga la página." />
        </Card>
      )}

      {/* Servicios */}
      <section className="flex flex-col gap-space-lg" aria-labelledby="servicios-titulo">
        <SectionTitle id="servicios" title="Servicios" description="Elige el servicio para ver los horarios disponibles y reservar." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {loading
            ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-44 w-full rounded-lg" />)
            : services.map((s) => (
                <Card key={s.id} className="flex flex-col gap-space-sm">
                  <div className="flex items-start justify-between gap-space-sm">
                    <h3 className="font-headline-section text-headline-section">{s.name}</h3>
                    <span className="font-body-semibold tabular-nums whitespace-nowrap">{formatMoneyMXN(s.price)}</span>
                  </div>
                  <p className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                    <Timer size={14} strokeWidth={1.75} aria-hidden /> {formatDuration(s.duration)}
                  </p>
                  {s.description && <p className="text-body-sm text-on-surface-variant flex-1">{s.description}</p>}
                  <Button as={Link} to={`${base}/reservar?servicio=${s.id}`} variant="secondary" className="justify-center mt-auto">
                    Reservar
                  </Button>
                </Card>
              ))}
        </div>
        {!loading && !error && services.length === 0 && (
          <Card><EmptyState icon={Store} title="Aún no hay servicios publicados" /></Card>
        )}
      </section>

      {/* Equipo */}
      <section className="flex flex-col gap-space-lg">
        <SectionTitle id="equipo" title="Nuestro equipo" description="Elige con quién quieres atenderte." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {loading
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-lg" />)
            : barbers.map((b) => (
                <Card key={b.id} className="flex flex-col items-center text-center gap-space-sm">
                  <Avatar name={b.name} src={b.photo} className="!w-24 !h-24 !text-[30px]" />
                  <h3 className="font-body-semibold">{b.name}</h3>
                  <p className="text-body-sm text-on-surface-variant flex-1">{b.bio || 'Barbero de Peludos Barber Shop.'}</p>
                  <Button as={Link} to={`${base}/reservar?barbero=${b.id}`} variant="ghost" size="sm">
                    Reservar con {b.name === 'Barbero' ? 'este barbero' : b.name.split(' ')[0]}
                  </Button>
                </Card>
              ))}
        </div>
      </section>

      {/* Horarios y ubicación */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
        <div className="flex flex-col gap-space-lg">
          <SectionTitle id="horarios" title="Horarios y ubicación" />
          <Card className="flex flex-col divide-y divide-outline-variant p-0">
            {business.hours.map((h) => {
              const today = h.days.includes(new Date().getDay())
              return (
                <div key={h.label} className={cn('flex items-center justify-between px-5 py-3', today && 'bg-primary-fixed/30')}>
                  <span className={cn('text-body-default', today && 'font-body-semibold')}>
                    {h.label}{today && <span className="text-primary text-body-sm"> · hoy</span>}
                  </span>
                  <span className="tabular-nums text-body-default">{h.open} – {h.close}</span>
                </div>
              )
            })}
          </Card>
          <Button
            as="a"
            href={`https://www.google.com/maps/search/${encodeURIComponent(`${business.name} ${business.city}`)}`}
            target="_blank"
            rel="noreferrer"
            variant="secondary"
            icon={MapPin}
            className="self-start"
          >
            Ver en Google Maps
          </Button>
        </div>

        <div className="grid gap-space-sm lg:pt-[56px]">
          {[
            { icon: CalendarCheck, title: 'Reserva en minutos', text: 'Elige servicio, barbero y horario disponible desde tu celular.' },
            { icon: Undo2, title: 'Cancela desde tu cuenta', text: 'Consulta o cancela tus citas en "Mis citas" cuando lo necesites.' },
            { icon: Clock, title: 'Pagas en el local', text: 'No se cobra nada por adelantado al reservar.' },
          ].map(({ icon: Icon, title, text }) => (
            <Card key={title} className="flex gap-space-md items-start">
              <span className="w-9 h-9 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                <Icon size={18} strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <p className="font-body-semibold">{title}</p>
                <p className="text-body-sm text-on-surface-variant">{text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
