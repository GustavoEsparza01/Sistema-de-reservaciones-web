// Página pública del negocio (design/stitch/10-pagina-publica), con el estilo premium del portal.
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarCheck, CalendarPlus, Clock, CircleAlert, MapPin, Store, Timer, Undo2 } from 'lucide-react'
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

function SectionTitle({ id, eyebrow, title, description }) {
  return (
    <div id={id} className="scroll-mt-24 flex flex-col gap-space-sm">
      {eyebrow && (
        <span className="inline-flex items-center gap-space-sm text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
          <span className="w-6 h-px bg-current" aria-hidden /> {eyebrow}
        </span>
      )}
      <h2 className="font-display text-[30px] md:text-[40px] leading-[1.1] font-semibold text-ink">{title}</h2>
      {description && <p className="text-body-default md:text-[16px] text-on-surface-variant max-w-2xl">{description}</p>}
    </div>
  )
}

// Tarjeta clara con borde que se vuelve dorado al pasar el cursor
const premiumCard = 'rounded-2xl border border-outline-variant bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-[0_18px_40px_-22px_rgba(15,15,16,0.3)]'

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
    <>
      {/* Presentación */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,164,92,0.22),transparent_55%)]" aria-hidden />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden />
        <div className="relative max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[64px] md:py-[96px] flex flex-col md:flex-row md:items-end md:justify-between gap-space-xl">
          <div className="flex flex-col gap-space-lg max-w-2xl">
            <span
              className={cn(
                'self-start inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold border',
                status.open ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-white/15 bg-white/5 text-ink-muted'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', status.open ? 'bg-emerald-400' : 'bg-ink-muted')} aria-hidden />
              {status.text}
            </span>
            <h1 className="font-display text-[44px] md:text-[64px] leading-[1.02] font-semibold text-balance">{business.name}</h1>
            <p className="text-[17px] md:text-[18px] leading-8 text-ink-muted">{business.tagline}</p>
            <p className="flex items-center gap-1.5 text-body-sm text-gold-light">
              <MapPin size={16} strokeWidth={1.75} className="text-gold" aria-hidden /> {business.city}
            </p>
          </div>
          <div className="flex flex-wrap gap-space-sm self-start md:self-auto">
            <Button as={Link} to={`${base}/reservar`} variant="gold" icon={CalendarPlus} className="h-12 px-space-lg text-[15px]">
              Reservar cita
            </Button>
            <Button as="a" href="#servicios" variant="outline-light" className="h-12 px-space-lg text-[15px]">
              Ver servicios
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[64px] md:py-[80px] flex flex-col gap-[72px]">
        {error && (
          <Card>
            <EmptyState icon={CircleAlert} title="No se pudo cargar la información" description="Revisa tu conexión y recarga la página." />
          </Card>
        )}

        {/* Servicios */}
        <section className="flex flex-col gap-space-xl" aria-labelledby="servicios-titulo">
          <SectionTitle id="servicios" eyebrow="Servicios" title="Lo que hacemos" description="Elige el servicio para ver los horarios disponibles y reservar." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {loading
              ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
              : services.map((s) => (
                  <div key={s.id} className={cn(premiumCard, 'group p-space-lg flex flex-col gap-space-sm')}>
                    <div className="flex items-start justify-between gap-space-sm">
                      <h3 className="font-display text-[21px] font-semibold text-ink">{s.name}</h3>
                      <span className="font-display text-[21px] font-semibold text-gold-deep tabular-nums whitespace-nowrap">{formatMoneyMXN(s.price)}</span>
                    </div>
                    <p className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                      <Timer size={14} strokeWidth={1.75} aria-hidden /> {formatDuration(s.duration)}
                    </p>
                    {s.description && <p className="text-body-sm text-on-surface-variant leading-6 flex-1">{s.description}</p>}
                    <Link
                      to={`${base}/reservar?servicio=${s.id}`}
                      className="mt-auto pt-space-sm inline-flex items-center gap-1.5 text-body-semibold text-ink group-hover:text-gold-deep transition-colors"
                    >
                      Reservar <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </div>
                ))}
          </div>
          {!loading && !error && services.length === 0 && (
            <Card><EmptyState icon={Store} title="Aún no hay servicios publicados" /></Card>
          )}
        </section>

        {/* Equipo */}
        <section className="flex flex-col gap-space-xl">
          <SectionTitle id="equipo" eyebrow="Barberos" title="Nuestro equipo" description="Elige con quién quieres atenderte." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {loading
              ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)
              : barbers.map((b) => (
                  <div key={b.id} className={cn(premiumCard, 'p-space-lg flex flex-col items-center text-center gap-space-sm')}>
                    <span className="rounded-full p-1 ring-2 ring-gold/60">
                      <Avatar name={b.name} src={b.photo} className="!w-24 !h-24 !text-[30px]" />
                    </span>
                    <h3 className="font-display text-[20px] font-semibold text-ink mt-space-xs">{b.name}</h3>
                    <p className="text-body-sm text-on-surface-variant flex-1">{b.bio || 'Barbero de Peludos Barber Shop.'}</p>
                    <Button as={Link} to={`${base}/reservar?barbero=${b.id}`} variant="secondary" size="sm" className="hover:!border-gold">
                      Reservar con {b.name === 'Barbero' ? 'este barbero' : b.name.split(' ')[0]}
                    </Button>
                  </div>
                ))}
          </div>
        </section>

        {/* Horarios y ubicación */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-[40px] items-start">
          <div className="flex flex-col gap-space-xl">
            <SectionTitle id="horarios" eyebrow="Visítanos" title="Horarios y ubicación" />
            <div className="rounded-2xl border border-outline-variant bg-white flex flex-col divide-y divide-outline-variant overflow-hidden">
              {business.hours.map((h) => {
                const today = h.days.includes(new Date().getDay())
                return (
                  <div key={h.label} className={cn('flex items-center justify-between px-5 py-3.5', today && 'bg-gold-soft')}>
                    <span className={cn('text-body-default', today && 'font-body-semibold')}>
                      {h.label}{today && <span className="text-gold-deep text-body-sm"> · hoy</span>}
                    </span>
                    <span className="tabular-nums text-body-default">{h.open} – {h.close}</span>
                  </div>
                )
              })}
            </div>
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

          <div className="rounded-2xl bg-ink text-white p-space-lg md:p-space-xl flex flex-col gap-space-lg lg:mt-[76px]">
            {[
              { icon: CalendarCheck, title: 'Reserva en minutos', text: 'Elige servicio, barbero y horario disponible desde tu celular.' },
              { icon: Undo2, title: 'Cancela desde tu cuenta', text: 'Consulta o cancela tus citas en "Mis citas" cuando lo necesites.' },
              { icon: Clock, title: 'Pagas en el local', text: 'No se cobra nada por adelantado al reservar.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-space-md items-start">
                <span className="w-10 h-10 rounded-full border border-gold/40 bg-gold/10 text-gold flex items-center justify-center shrink-0">
                  <Icon size={18} strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <p className="font-display text-[18px] font-semibold">{title}</p>
                  <p className="text-body-sm text-ink-muted">{text}</p>
                </div>
              </div>
            ))}
            <Button as={Link} to={`${base}/reservar`} variant="gold" icon={CalendarPlus} className="justify-center h-11">
              Reservar cita
            </Button>
          </div>
        </section>
      </div>
    </>
  )
}
