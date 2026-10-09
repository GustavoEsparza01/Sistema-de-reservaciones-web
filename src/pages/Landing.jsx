// Landing de Barber OS, dirección "producto primero".
// El contenido (textos, planes, preguntas) vive en components/landing/content.
// Solo describe funciones que el sistema ya tiene; lo que se muestra del producto es
// interfaz real con datos de ejemplo marcados como tales.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, CalendarClock, Check, ChevronDown, FileDown, LogIn, Menu, Scissors, ShieldCheck, Users, X,
} from 'lucide-react'
import Logo from '../components/app/Logo'
import TimeGrid from '../components/app/agenda/TimeGrid'
import BookingDemo from '../components/landing/BookingDemo'
import { FAQS, FEATURES, MARQUEE_ITEMS, PLANS, STATS, DEMO_COLUMNS } from '../components/landing/content'
import { Button } from '../components/ui'
import { Marquee, Reveal } from '../components/motion'
import { cn } from '../lib/cn'
import { useBusiness } from '../hooks/useBusiness'

const NAV = [['#funciones', 'Funciones'], ['#precios', 'Precios'], ['#preguntas', 'Preguntas']]

// Lo que hace el cliente en cada paso del portal (mismos nombres que el stepper)
const BOOKING_STEPS = [
  ['Servicio', 'Ve precio y duración de cada servicio.'],
  ['Barbero', 'Elige con quién, o el primero disponible.'],
  ['Fecha y hora', 'Solo horarios libres que alcanzan la duración del servicio.'],
  ['Solicitar', 'Deja indicaciones para su barbero y envía.'],
]

function SectionTitle({ title, text, dark = false, className }) {
  return (
    <Reveal className={cn('flex flex-col gap-space-md max-w-2xl', className)}>
      <h2 className={cn('font-display text-[32px] md:text-[44px] leading-[1.1] font-semibold text-balance', dark ? 'text-white' : 'text-ink')}>{title}</h2>
      {text && <p className={cn('text-body-default md:text-[17px] md:leading-7 max-w-[60ch]', dark ? 'text-ink-muted' : 'text-ink/70')}>{text}</p>}
    </Reveal>
  )
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-ink/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group w-full flex items-center justify-between gap-space-md py-space-lg text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        <span className={cn('font-body-semibold text-[16px] transition-colors group-hover:text-gold-deep', open && 'text-gold-deep')}>{q}</span>
        <span className={cn('w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-[transform,background-color,border-color,color] duration-[250ms] ease-out-strong', open ? 'bg-ink border-ink text-gold rotate-180' : 'border-ink/15 text-ink/70 group-hover:border-gold')}>
          <ChevronDown size={16} aria-hidden />
        </span>
      </button>
      {/* grid-rows anima la altura sin medirla */}
      <div className={cn('grid transition-[grid-template-rows,opacity] duration-300 ease-out-strong', open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')} inert={open ? undefined : ''}>
        <p className="overflow-hidden text-body-default leading-7 text-ink/70 max-w-[65ch]">
          <span className="block pb-space-lg">{a}</span>
        </p>
      </div>
    </div>
  )
}

export default function Landing() {
  const business = useBusiness()
  const demoUrl = `/${business.slug}`
  const [menuOpen, setMenuOpen] = useState(false)
  const enter = (ms) => ({ '--enter-delay': `${ms}ms` })
  const [reservas, agenda, reportes] = FEATURES
  const ReservasIcon = reservas.icon

  useEffect(() => {
    const previous = document.title
    document.title = 'Barber OS · El sistema operativo de tu barbería'
    return () => { document.title = previous }
  }, [])

  return (
    <div className="min-h-[100dvh] bg-cream font-sans text-ink overflow-x-clip">
      <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur border-b border-ink-line text-white pt-[env(safe-area-inset-top)]">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin h-16 flex items-center gap-space-lg">
          <Link to="/barber-os" aria-label="Barber OS, inicio"><Logo tone="premium" /></Link>
          <nav aria-label="Secciones" className="hidden md:flex items-center gap-space-lg">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="text-body-sm font-body-medium text-ink-muted hover:text-white transition-colors">{label}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-space-xs sm:gap-space-sm">
            <Link to="/login" className="hidden sm:inline-flex items-center gap-space-xs h-11 px-space-sm text-body-medium text-ink-muted hover:text-white transition-colors">
              <LogIn size={18} strokeWidth={1.75} aria-hidden /> Iniciar sesión
            </Link>
            <Button as={Link} to={demoUrl} variant="outline-light" className="hidden lg:inline-flex">Ver demo</Button>
            <Button as={Link} to="/onboarding" variant="gold" className="hidden sm:inline-flex">Crear mi barbería</Button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              className="md:hidden -mr-2 w-11 h-11 flex items-center justify-center rounded text-white hover:bg-white/10"
            >
              {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav aria-label="Secciones" className="md:hidden border-t border-ink-line px-margin-mobile py-space-sm flex flex-col">
            {NAV.map(([href, label]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="py-3">{label}</a>)}
            <Link to="/login" className="py-3">Iniciar sesión</Link>
            <Link to={demoUrl} className="py-3">Ver demo</Link>
            <Button as={Link} to="/onboarding" variant="gold" size="lg" className="justify-center mt-space-sm">Crear mi barbería</Button>
          </nav>
        )}
      </header>

      <main>
        {/* Hero: el mensaje a la izquierda y el producto real (una reserva que se puede probar) a la derecha */}
        <section className="relative bg-ink text-white">
          {/* Un solo resplandor dorado, quieto, detrás del teléfono */}
          <div className="pointer-events-none absolute right-0 top-10 w-[560px] h-[560px] max-w-full rounded-full bg-gold/10 blur-[110px]" aria-hidden />
          <div className="relative max-w-[1200px] mx-auto px-margin-mobile md:px-margin pt-[48px] pb-[64px] md:pt-[72px] md:pb-[96px] grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[48px] lg:gap-[64px] items-center">
            <div className="flex flex-col gap-space-lg max-w-[34rem]">
              <h1 className="animate-enter font-display text-[42px] sm:text-[52px] lg:text-[64px] leading-[1.04] font-semibold text-balance" style={enter(0)}>
                Que tus clientes reserven solos.
              </h1>
              <p className="animate-enter text-[17px] md:text-[18px] leading-8 text-ink-muted max-w-[44ch]" style={enter(120)}>
                Eligen servicio, barbero y hora desde el celular. Tú ves la agenda de todo tu equipo en un solo lugar.
              </p>
              <div className="animate-enter flex flex-col sm:flex-row gap-space-sm" style={enter(220)}>
                <Button as={Link} to="/onboarding" variant="gold" size="xl" iconRight={ArrowRight} className="justify-center">Crear mi barbería</Button>
                <Button as={Link} to={demoUrl} variant="outline-light" size="xl" className="justify-center">Ver demo</Button>
              </div>
            </div>

            <div id="probar" className="scroll-mt-24">
              <BookingDemo className="animate-enter" style={enter(320)} />
            </div>
          </div>
        </section>

        {/* Cinta de funciones (la única cinta de la página) */}
        <section className="bg-ink-soft border-y border-ink-line py-space-md" aria-label="Funciones principales">
          <Marquee duration={45}>
            {MARQUEE_ITEMS.map((t) => (
              <span key={t} className="flex items-center gap-space-xl pr-space-xl py-1 font-display italic text-[22px] md:text-[26px] leading-[1.2] text-white/85 whitespace-nowrap">
                {t} <Scissors size={18} className="text-gold not-italic" aria-hidden />
              </span>
            ))}
          </Marquee>
        </section>

        {/* Cifras: datos del producto, no métricas de negocio */}
        <section className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin pt-[64px]" aria-label="Barber OS en cifras">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-gutter gap-y-space-xl">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 80} className="flex flex-col-reverse gap-1 border-t border-ink/15 pt-space-md">
                <dt className="text-body-sm text-ink/70 max-w-[18ch]">{s.label}</dt>
                <dd className="font-display text-[44px] md:text-[56px] leading-none font-semibold tabular-nums">{s.to}{s.suffix}</dd>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* Funciones: una celda grande en carbón y dos claras */}
        <section id="funciones" className="scroll-mt-20 max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[72px] md:py-[96px] flex flex-col gap-[40px]">
          <SectionTitle title="Diseñado para el día a día de una barbería" text="Deja la libreta y las llamadas. Todo lo que pasa en tu barbería, en una sola pantalla." />
          <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-gutter">
            <Reveal className="md:row-span-2 rounded-2xl bg-ink text-white p-space-xl md:p-[40px] flex flex-col gap-space-md">
              <span className="w-12 h-12 rounded-xl border border-gold/40 bg-gold/10 text-gold flex items-center justify-center"><ReservasIcon size={22} strokeWidth={1.75} aria-hidden /></span>
              <h3 className="font-display text-[28px] md:text-[32px] leading-tight font-semibold">{reservas.title}</h3>
              <p className="text-body-default md:text-[17px] leading-7 text-ink-muted max-w-[44ch]">{reservas.text}</p>
              <a href="#probar" className="mt-auto self-start inline-flex items-center gap-1.5 min-h-11 text-body-semibold text-gold-light hover:text-gold transition-colors">
                Pruébalo arriba <ArrowRight size={16} aria-hidden />
              </a>
            </Reveal>
            {[agenda, reportes].map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={(i + 1) * 100} className="rounded-2xl border border-ink/10 bg-white p-space-xl flex flex-col gap-space-sm">
                <span className="w-11 h-11 rounded-xl bg-ink text-gold flex items-center justify-center"><Icon size={20} strokeWidth={1.75} aria-hidden /></span>
                <h3 className="font-display text-[22px] font-semibold mt-space-xs">{title}</h3>
                <p className="text-body-default leading-6 text-ink/70">{text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Agenda: texto y la agenda real del panel */}
        <section className="bg-white border-y border-ink/10">
          <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[72px] md:py-[96px] grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-[48px] items-center">
            <div className="flex flex-col gap-space-xl">
              <SectionTitle title="Cada barbero, su turno y sus citas de un vistazo" text="Haz clic en un hueco libre para agendar. Reprograma o cambia de barbero y el sistema te muestra solo los horarios disponibles." />
              <ul className="flex flex-col gap-space-md">
                {[
                  [CalendarClock, 'Vista por día o por semana, con descansos marcados'],
                  [ShieldCheck, 'Nunca se enciman dos citas del mismo barbero'],
                  [Users, 'Cada barbero tiene su propia agenda del día'],
                ].map(([Icon, t], i) => (
                  <Reveal as="li" key={t} delay={i * 80} className="flex items-center gap-space-md">
                    <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-gold/50 bg-gold-soft text-gold-deep"><Icon size={17} aria-hidden /></span>
                    <span>{t}</span>
                  </Reveal>
                ))}
              </ul>
            </div>
            <Reveal className="flex flex-col gap-space-xs min-w-0">
              <div className="rounded-xl border border-ink/10 bg-white shadow-[0_30px_60px_-30px_rgba(15,15,16,0.35)] overflow-hidden">
                <div className="max-h-[340px] overflow-hidden pointer-events-none select-none" aria-hidden>
                  <TimeGrid columns={DEMO_COLUMNS} onOpen={() => {}} minColumnWidth={150} />
                </div>
              </div>
              <p className="text-[12px] text-ink/70 text-right">Agenda del panel con datos de ejemplo</p>
            </Reveal>
          </div>
        </section>

        {/* Reserva del cliente: los cuatro pasos tal como los nombra el portal */}
        <section className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[72px] md:py-[96px] flex flex-col gap-[40px]">
          <SectionTitle
            title="Tus clientes reservan en cuatro pasos"
            text="Pensado para el celular. Después consultan, reprograman o cancelan desde su cuenta."
          />
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {BOOKING_STEPS.map(([name, text], i) => (
              <Reveal as="li" key={name} delay={i * 80} className="flex flex-col gap-space-sm border-t-2 border-gold pt-space-md">
                <h3 className="font-display text-[22px] font-semibold">{name}</h3>
                <p className="text-body-default leading-6 text-ink/70">{text}</p>
              </Reveal>
            ))}
          </ol>
          <Button as="a" href="#probar" variant="outline-dark" size="lg" className="self-start">Probar la reserva</Button>
        </section>

        {/* Clientes y reportes */}
        <section className="bg-ink text-white">
          <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[72px] md:py-[96px] flex flex-col gap-[40px]">
            <SectionTitle dark title="Conoce a tus clientes y lo que ganas" />
            <div className="grid md:grid-cols-2 gap-gutter">
              {[
                { icon: Users, title: 'Clientes con historial', text: 'Visitas, gasto total, barbero y servicio habituales, cumpleaños y las notas de cada corte. Llama o escribe por WhatsApp desde su expediente.' },
                { icon: FileDown, title: 'Reportes que puedes llevarte', text: 'Ingresos por día o semana, citas por estado, servicios más pedidos y rendimiento por barbero. Descárgalos en PDF o CSV.' },
              ].map(({ icon: Icon, title, text }, i) => (
                <Reveal key={title} delay={i * 100} className="rounded-2xl border border-ink-line bg-ink-soft p-space-xl flex flex-col sm:flex-row gap-space-md sm:gap-space-lg">
                  <span className="w-12 h-12 rounded-xl border border-gold/40 bg-gold/10 text-gold flex items-center justify-center shrink-0"><Icon size={22} strokeWidth={1.75} aria-hidden /></span>
                  <div className="flex flex-col gap-space-sm">
                    <h3 className="font-display text-[22px] font-semibold">{title}</h3>
                    <p className="text-body-default leading-6 text-ink-muted">{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Caso real */}
        <section className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[72px] md:py-[96px]">
          <Reveal className="rounded-3xl bg-ink text-white p-space-xl md:p-[56px] flex flex-col md:flex-row md:items-center md:justify-between gap-space-xl ring-1 ring-gold/30">
            <div className="flex flex-col gap-space-md max-w-xl">
              <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold">Ejemplo en vivo</span>
              <h2 className="font-display text-[32px] md:text-[42px] leading-[1.1] font-semibold">Mira cómo lo usa {business.name}</h2>
              <p className="text-ink-muted text-[17px] leading-7">Recorre su página pública y el flujo de reserva, tal como lo ven sus clientes en {business.city}.</p>
            </div>
            <Button as={Link} to={demoUrl} variant="gold" iconRight={ArrowRight} size="xl" className="self-start md:self-auto">Abrir {business.name}</Button>
          </Reveal>
        </section>

        {/* Precios */}
        <section id="precios" className="scroll-mt-20 bg-white border-y border-ink/10">
          <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[72px] md:py-[96px] flex flex-col gap-[40px]">
            <SectionTitle title="Un plan para cada barbería" text="Los precios se anunciarán pronto. Todos los planes incluyen tu página de reservas." />
            <div className="grid md:grid-cols-3 gap-gutter items-stretch">
              {PLANS.map((p, i) => (
                <Reveal key={p.name} delay={i * 100} className={cn('rounded-2xl border p-space-xl flex flex-col gap-space-md', p.highlight ? 'bg-ink text-white border-ink' : 'bg-cream border-ink/10')}>
                  <div className="flex items-center justify-between gap-space-sm">
                    <h3 className="font-display text-[24px] font-semibold">{p.name}</h3>
                    {p.highlight && <span className="text-[11px] font-semibold uppercase tracking-wide text-ink bg-gold rounded-full px-2.5 py-0.5">Recomendado</span>}
                  </div>
                  <p className={cn('text-body-sm', p.highlight ? 'text-ink-muted' : 'text-ink/70')}>{p.description}</p>
                  <p className="flex items-baseline gap-1">
                    {p.price == null ? (
                      <span className={cn('font-display text-[26px] font-semibold', p.highlight && 'text-gold')}>Por anunciar</span>
                    ) : (
                      <><span className="font-display text-[36px] font-semibold tabular-nums">${p.price}</span><span className={p.highlight ? 'text-ink-muted' : 'text-ink/70'}>MXN / mes</span></>
                    )}
                  </p>
                  <div className={cn('h-px', p.highlight ? 'bg-ink-line' : 'bg-ink/10')} />
                  <ul className="flex flex-col gap-space-sm flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-space-sm text-body-default"><Check size={18} className={cn('shrink-0 mt-0.5', p.highlight ? 'text-gold' : 'text-gold-deep')} aria-hidden /> {f}</li>
                    ))}
                  </ul>
                  <Button as={Link} to="/onboarding" variant={p.highlight ? 'gold' : 'outline-dark'} size="lg" className="justify-center">Empezar</Button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Preguntas: título a la izquierda y respuestas a la derecha en escritorio */}
        <section id="preguntas" className="scroll-mt-20 max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[72px] md:py-[96px] grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-[40px]">
          <SectionTitle title="Lo que suelen preguntarnos" />
          <Reveal className="border-t border-ink/10">
            {FAQS.map(([q, a]) => <Faq key={q} q={q} a={a} />)}
          </Reveal>
        </section>
      </main>

      <footer className="bg-ink text-ink-muted">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[48px] pb-[max(48px,env(safe-area-inset-bottom))] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-md text-body-sm">
          <div className="flex items-center gap-space-md">
            <Logo tone="premium" />
            <span>El sistema operativo de tu barbería</span>
          </div>
          <div className="flex flex-wrap gap-x-space-lg">
            <Link to={demoUrl} className="inline-flex items-center min-h-11 hover:text-gold transition-colors">Demo: {business.name}</Link>
            <Link to="/login" className="inline-flex items-center min-h-11 hover:text-gold transition-colors">Iniciar sesión</Link>
            <span className="inline-flex items-center min-h-11">© {new Date().getFullYear()} Barber OS</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
