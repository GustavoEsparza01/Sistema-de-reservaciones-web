// Página pública del negocio (design/stitch/10-pagina-publica), con el estilo premium del portal.
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, CalendarCheck, CalendarPlus, Clock, CircleAlert, MapPin, Scissors, Store, Timer, Undo2 } from 'lucide-react'
import { openStatus, useBusiness } from '../../hooks/useBusiness'
import { fetchPublicBarbers, fetchPublicServices } from '../../lib/publicData'
import { formatDuration, formatMoneyMXN } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Avatar, Button, EmptyState, Skeleton } from '../../components/ui'
import PortalCard from '../../components/portal/PortalCard'
import { Marquee, Reveal, trackPointer } from '../../components/motion'

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
    <Reveal id={id} className="scroll-mt-24 flex flex-col gap-space-sm">
      {eyebrow && (
        <span className="inline-flex items-center gap-space-sm text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-deep">
          <span className="w-6 h-px bg-current" aria-hidden /> {eyebrow}
        </span>
      )}
      <h2 className="font-display text-[30px] md:text-[40px] leading-[1.1] font-semibold text-ink">{title}</h2>
      {description && <p className="text-body-default md:text-[16px] text-ink/70 max-w-2xl">{description}</p>}
    </Reveal>
  )
}

// Tarjeta clara con borde que se vuelve dorado al pasar el cursor
const premiumCard = 'rounded-xl border border-ink/10 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-[0_18px_40px_-22px_rgba(15,15,16,0.3)]'

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
        {/* Foto: en celular ocupa todo el fondo; en escritorio, la parte derecha */}
        <img
          src="/portal-hero-1024.jpg"
          srcSet="/portal-hero-640.jpg 640w, /portal-hero-1024.jpg 1024w"
          sizes="(min-width: 768px) 62vw, 100vw"
          width={1024}
          height={1024}
          fetchpriority="high"
          alt=""
          className="hero-photo absolute inset-0 w-full h-full object-cover object-[55%_30%] md:left-auto md:right-0 md:w-[62%]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink from-[30%] via-ink/70 to-ink/10 md:bg-gradient-to-r md:from-ink md:from-[38%] md:via-ink/60 md:via-[58%] md:to-ink/5"
          aria-hidden
        />
        <div className="relative max-w-[1200px] mx-auto px-margin-mobile md:px-margin min-h-[540px] md:min-h-[600px] pt-[220px] pb-[48px] md:py-[96px] flex flex-col justify-end md:justify-center">
          <div className="flex flex-col gap-space-lg max-w-xl">
            <span
              className={cn(
                'animate-enter self-start inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold border',
                status.open ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-white/15 bg-white/5 text-ink-muted'
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', status.open ? 'bg-emerald-400 animate-pulse-gold' : 'bg-ink-muted')} aria-hidden />
              {status.text}
            </span>
            <h1 style={{ '--enter-delay': '120ms' }} className="animate-enter font-display text-[44px] md:text-[64px] leading-[1.02] font-semibold text-balance">{business.name}</h1>
            <p style={{ '--enter-delay': '240ms' }} className="animate-enter text-[17px] md:text-[18px] leading-7 md:leading-8 text-white/80">{business.tagline}</p>
            <p style={{ '--enter-delay': '340ms' }} className="animate-enter flex items-center gap-1.5 text-body-sm text-gold-light">
              <MapPin size={16} strokeWidth={1.75} className="text-gold" aria-hidden /> {business.city}
            </p>
            <div style={{ '--enter-delay': '440ms' }} className="animate-enter grid grid-cols-2 sm:flex gap-space-sm mt-space-xs">
              <Button as={Link} to={`${base}/reservar`} variant="gold" icon={CalendarPlus} size="xl" className="justify-center">
                Reservar cita
              </Button>
              <Button as="a" href="#servicios" variant="outline-light" size="xl" className="justify-center backdrop-blur-sm">
                Ver servicios
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cinta con los servicios reales del negocio */}
      {services.length > 0 && (
        <section className="bg-ink-soft border-y border-ink-line py-space-md" aria-label="Servicios">
          <Marquee duration={35}>
            {[...services, ...services, ...services].map((s, i) => (
              <Link key={`${s.id}-${i}`} to={`${base}/reservar?servicio=${s.id}`} className="flex items-center gap-space-md pr-space-xl font-display italic text-[20px] md:text-[24px] text-white/85 hover:text-gold transition-colors whitespace-nowrap">
                {s.name} <span className="not-italic font-sans text-body-sm text-gold">{formatMoneyMXN(s.price)}</span>
                <Scissors size={16} className="text-gold/70" aria-hidden />
              </Link>
            ))}
          </Marquee>
        </section>
      )}

      <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[64px] md:py-[80px] flex flex-col gap-[72px]">
        {error && (
          <PortalCard>
            <EmptyState icon={CircleAlert} title="No se pudo cargar la información" description="Revisa tu conexión y recarga la página." />
          </PortalCard>
        )}

        {/* Servicios */}
        <section className="flex flex-col gap-space-xl" aria-labelledby="servicios-titulo">
          <SectionTitle id="servicios" eyebrow="Servicios" title="Lo que hacemos" description="Elige el servicio para ver los horarios disponibles y reservar." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {loading
              ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
              : services.map((s, i) => (
                  <Reveal key={s.id} delay={(i % 3) * 120}>
                  <div onMouseMove={trackPointer} className={cn(premiumCard, 'spotlight group h-full p-space-lg flex flex-col gap-space-sm')}>
                    <div className="flex items-start justify-between gap-space-sm">
                      <h3 className="font-display text-[21px] font-semibold text-ink">{s.name}</h3>
                      <span className="font-display text-[21px] font-semibold text-gold-deep tabular-nums whitespace-nowrap">{formatMoneyMXN(s.price)}</span>
                    </div>
                    <p className="flex items-center gap-1.5 text-body-sm text-ink/70">
                      <Timer size={14} strokeWidth={1.75} aria-hidden /> {formatDuration(s.duration)}
                    </p>
                    {s.description && <p className="text-body-sm text-ink/70 leading-6 flex-1">{s.description}</p>}
                    <Link
                      to={`${base}/reservar?servicio=${s.id}`}
                      className="mt-auto pt-space-sm inline-flex items-center gap-1.5 text-body-semibold text-ink group-hover:text-gold-deep transition-colors"
                    >
                      Reservar <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </div>
                  </Reveal>
                ))}
          </div>
          {!loading && !error && services.length === 0 && (
            <PortalCard><EmptyState icon={Store} title="Aún no hay servicios publicados" /></PortalCard>
          )}
        </section>

        {/* Equipo */}
        <section className="flex flex-col gap-space-xl">
          <SectionTitle id="equipo" eyebrow="Barberos" title="Nuestro equipo" description="Elige con quién quieres atenderte." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {loading
              ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)
              : barbers.map((b, i) => (
                  <Reveal key={b.id} from="scale" delay={(i % 4) * 110}>
                  <div onMouseMove={trackPointer} className={cn(premiumCard, 'spotlight group h-full p-space-lg flex flex-col items-center text-center gap-space-sm')}>
                    <span className="relative rounded-full p-1.5">
                      {/* Aro punteado que gira al pasar el cursor */}
                      <span className="absolute inset-0 rounded-full border-2 border-dashed border-gold/60 transition-colors group-hover:border-gold spin-on-hover" aria-hidden />
                      <Avatar name={b.name} src={b.photo} tone="premium" className="!w-24 !h-24 !text-[30px] transition-transform duration-500 group-hover:scale-105" />
                    </span>
                    <h3 className="font-display text-[20px] font-semibold text-ink mt-space-xs">{b.name}</h3>
                    <p className="text-body-sm text-ink/70 flex-1">{b.bio || 'Barbero de Peludos Barber Shop.'}</p>
                    <Button as={Link} to={`${base}/reservar?barbero=${b.id}`} variant="outline-dark" size="sm">
                      Reservar con {b.name === 'Barbero' ? 'este barbero' : b.name.split(' ')[0]}
                    </Button>
                  </div>
                  </Reveal>
                ))}
          </div>
        </section>

        {/* Horarios y ubicación */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-[40px] items-start">
          <div className="flex flex-col gap-space-xl">
            <SectionTitle id="horarios" eyebrow="Visítanos" title="Horarios y ubicación" />
            <Reveal from="left" className="rounded-xl border border-ink/10 bg-white flex flex-col divide-y divide-ink/10 overflow-hidden">
              {business.hours.map((h) => {
                const today = h.days.includes(new Date().getDay())
                return (
                  <div key={h.label} className={cn('relative flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-cream', today && 'bg-gold-soft hover:bg-gold-soft')}>
                    {today && <span className="absolute left-0 inset-y-0 w-1 barber-pole" aria-hidden />}
                    <span className={cn('text-body-default', today && 'font-body-semibold')}>
                      {h.label}{today && <span className="text-gold-deep text-body-sm"> · hoy</span>}
                    </span>
                    <span className="tabular-nums text-body-default">{h.open} – {h.close}</span>
                  </div>
                )
              })}
            </Reveal>
            <Button
              as="a"
              href={`https://www.google.com/maps/search/${encodeURIComponent(`${business.name} ${business.city}`)}`}
              target="_blank"
              rel="noreferrer"
              variant="outline-dark"
              icon={MapPin}
              className="self-start"
            >
              Ver en Google Maps
            </Button>
          </div>

          <Reveal from="right" className="lg:mt-[76px]">
          <div onMouseMove={trackPointer} className="spotlight overflow-hidden rounded-xl bg-ink text-white p-space-lg md:p-space-xl flex flex-col gap-space-lg">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold/15 blur-[80px] animate-drift" aria-hidden />
            {[
              { icon: CalendarCheck, title: 'Reserva en minutos', text: 'Elige servicio, barbero y horario disponible desde tu celular.' },
              { icon: Undo2, title: 'Cancela desde tu cuenta', text: 'Consulta o cancela tus citas en "Mis citas" cuando lo necesites.' },
              { icon: Clock, title: 'Pagas en el local', text: 'No se cobra nada por adelantado al reservar.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="group relative flex gap-space-md items-start">
                <span className="w-10 h-10 rounded-full border border-gold/40 bg-gold/10 text-gold flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-gold group-hover:text-ink group-hover:scale-110">
                  <Icon size={18} strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <p className="font-display text-[18px] font-semibold">{title}</p>
                  <p className="text-body-sm text-ink-muted">{text}</p>
                </div>
              </div>
            ))}
            <Button as={Link} to={`${base}/reservar`} variant="gold" icon={CalendarPlus} size="lg" className="relative justify-center">
              Reservar cita
            </Button>
          </div>
          </Reveal>
        </section>
      </div>
    </>
  )
}
