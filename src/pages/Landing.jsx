// Landing de Barber OS (design/stitch/16-landing).
// Solo describe funciones que el sistema ya tiene. Las vistas del producto se
// arman con los componentes reales de la app y datos de ejemplo marcados como tales.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { addMinutes, startOfDay } from 'date-fns'
import {
  ArrowRight, Banknote, BarChart3, CalendarCheck, CalendarClock, CalendarDays, Check, ChevronDown, Clock, FileDown,
  Globe, LogIn, Menu, NotebookPen, Scissors, ShieldCheck, Smartphone, Users, X,
} from 'lucide-react'
import Logo from '../components/app/Logo'
import TimeGrid from '../components/app/agenda/TimeGrid'
import { Avatar, Button, KpiCard, StatusBadge } from '../components/ui'
import { cn } from '../lib/cn'
import { useBusiness } from '../hooks/useBusiness'

// Precios: por definir. Cambia aquí los valores cuando estén decididos (null = "Por anunciar").
const PLANS = [
  {
    name: 'Básico',
    price: null,
    description: 'Para barberías de un solo sillón.',
    features: ['1 barbero', 'Página de reservas en línea', 'Agenda y citas', 'Clientes con historial'],
  },
  {
    name: 'Profesional',
    price: null,
    highlight: true,
    description: 'Para equipos que crecen.',
    features: ['Barberos ilimitados', 'Todo lo del plan Básico', 'Reportes de ingresos y PDF', 'Agenda propia para cada barbero'],
  },
  {
    name: 'Empresa',
    price: null,
    description: 'Para varias sucursales.',
    features: ['Todo lo del plan Profesional', 'Varias sucursales (próximamente)', 'Acompañamiento en la configuración'],
  },
]

const FAQS = [
  ['¿Necesito instalar algo?', 'No. Barber OS funciona en el navegador de tu computadora, tableta o celular.'],
  ['¿Mis clientes necesitan descargar una app?', 'No. Reservan desde el enlace de tu barbería, con su correo y contraseña, y ahí mismo consultan o cancelan sus citas.'],
  ['¿Qué pasa si dos clientes quieren el mismo horario?', 'El sistema solo ofrece horarios libres de cada barbero, que alcancen la duración del servicio antes del cierre. Un horario ocupado no se puede reservar dos veces.'],
  ['¿Cada barbero tiene su propio horario?', 'Sí. Defines los días y horas de cada barbero, y cada uno ve su agenda del día con las notas de sus clientes.'],
  ['¿Puedo sacar mis datos?', 'Sí. Citas, clientes y servicios se exportan a CSV (Excel), y los reportes a PDF.'],
  ['¿Cuánto cuesta?', 'Los precios se anunciarán pronto. Mientras tanto puedes ver el sistema funcionando con Peludos Barber Shop.'],
]

const FEATURES = [
  { icon: Globe, title: 'Reservas en línea 24/7', text: 'Tu barbería tiene su propia página. Los clientes eligen servicio, barbero y horario libre sin llamarte.' },
  { icon: CalendarDays, title: 'Agenda por barbero', text: 'Vista por día o por semana, con turnos, descansos y citas por estado. Agenda o reprograma con un clic.' },
  { icon: BarChart3, title: 'Reportes de ingresos', text: 'Ingresos por día, ticket promedio, servicios más pedidos y rendimiento de cada barbero.' },
]

// ── Vistas ilustrativas del producto ──────────────────────────────

const today = startOfDay(new Date())
const at = (h, m = 0) => addMinutes(today, h * 60 + m)
const demo = (id, h, m, dur, status, client, service) => ({ id, start: at(h, m), end: at(h, m + dur), duration: dur, status, clientName: client, serviceName: service })
const DEMO_SCHEDULE = Object.fromEntries(['0', '1', '2', '3', '4', '5', '6'].map((k) => [k, { isWorking: true, start: '10:00', end: '15:00' }]))
const DEMO_COLUMNS = [
  { key: 'a', name: 'Barbero A', appointments: [demo('1', 10, 0, 45, 'completed', 'Cliente 1', 'Corte clásico'), demo('2', 11, 0, 60, 'accepted', 'Cliente 2', 'Corte + barba'), demo('3', 13, 0, 30, 'pending', 'Cliente 3', 'Perfilado')] },
  { key: 'b', name: 'Barbero B', appointments: [demo('4', 10, 30, 60, 'accepted', 'Cliente 4', 'Fade'), demo('5', 12, 30, 45, 'accepted', 'Cliente 5', 'Corte clásico')] },
].map((c) => ({
  ...c,
  date: today,
  schedule: DEMO_SCHEDULE,
  header: (
    <div className="flex items-center gap-space-sm">
      <Avatar name={c.name} size="sm" />
      <span className="font-body-semibold text-body-sm">{c.name}</span>
    </div>
  ),
}))

function BrowserFrame({ url, children, className }) {
  return (
    <div className={cn('rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl overflow-hidden', className)}>
      <div className="h-9 flex items-center gap-1.5 px-3 border-b border-outline-variant bg-surface-container-low">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
        <span className="ml-3 flex-1 max-w-xs h-5 rounded bg-surface-container-lowest border border-outline-variant text-[11px] text-on-surface-variant px-2 flex items-center truncate">{url}</span>
      </div>
      <div className="pointer-events-none select-none" aria-hidden>{children}</div>
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="bg-background p-space-md flex flex-col gap-space-sm">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm">
        <KpiCard label="Citas de hoy" value="5" unit="citas" icon={CalendarCheck} className="p-3" />
        <KpiCard label="Ingresos" value="$1,250" unit="MXN" icon={Banknote} className="p-3" />
        <KpiCard label="Pendientes" value="1" unit="cita" icon={Clock} className="p-3 hidden sm:flex" />
      </div>
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden">
        {[
          ['10:00', 'Cliente 1', 'Corte clásico', 'completed'],
          ['11:00', 'Cliente 2', 'Corte + barba', 'accepted'],
          ['13:00', 'Cliente 3', 'Perfilado', 'pending'],
        ].map(([h, c, s, st]) => (
          <div key={h} className="flex items-center gap-space-sm px-3 h-11 border-b last:border-0 border-outline-variant text-body-sm">
            <span className="w-11 font-body-semibold tabular-nums">{h}</span>
            <Avatar name={c} size="sm" />
            <span className="flex-1 truncate">{c} · <span className="text-on-surface-variant">{s}</span></span>
            <StatusBadge status={st} />
          </div>
        ))}
      </div>
    </div>
  )
}

function BookingPreview() {
  const slots = ['10:00', '10:30', '11:00', '12:30', '13:00', '13:30', '14:00', '14:30']
  return (
    <div className="bg-background p-space-md flex flex-col gap-space-md">
      <div className="grid grid-cols-4 gap-1.5">
        {['Servicio', 'Barbero', 'Fecha y hora', 'Confirmar'].map((s, i) => (
          <div key={s} className="flex flex-col gap-1">
            <div className={cn('h-1 rounded-full', i <= 2 ? 'bg-primary' : 'bg-surface-container-high')} />
            <span className={cn('text-[11px]', i === 2 ? 'text-primary font-semibold' : 'text-on-surface-variant')}>{s}</span>
          </div>
        ))}
      </div>
      <p className="font-body-semibold text-body-sm">Selecciona la hora</p>
      <div className="grid grid-cols-4 gap-1.5">
        {slots.map((s) => (
          <span key={s} className={cn('h-9 rounded-lg border text-body-sm flex items-center justify-center tabular-nums', s === '12:30' ? 'bg-primary border-primary text-on-primary' : 'bg-surface-container-lowest border-outline-variant')}>
            {s}
          </span>
        ))}
      </div>
      <span className="h-10 rounded-lg bg-primary text-on-primary text-body-sm font-body-semibold flex items-center justify-center">Confirmar reserva</span>
    </div>
  )
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-outline-variant">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="w-full flex items-center justify-between gap-space-md py-space-md text-left">
        <span className="font-body-semibold">{q}</span>
        <ChevronDown size={18} className={cn('shrink-0 text-on-surface-variant transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && <p className="pb-space-md -mt-1 text-body-default text-on-surface-variant max-w-3xl">{a}</p>}
    </div>
  )
}

function SectionHeader({ eyebrow, title, text, center = false }) {
  return (
    <div className={cn('flex flex-col gap-space-sm max-w-2xl', center && 'mx-auto text-center items-center')}>
      {eyebrow && <span className="text-[12px] font-semibold uppercase tracking-wide text-primary">{eyebrow}</span>}
      <h2 className="text-[28px] md:text-[34px] leading-tight font-semibold tracking-tight text-balance">{title}</h2>
      {text && <p className="text-body-default md:text-[16px] md:leading-7 text-on-surface-variant">{text}</p>}
    </div>
  )
}

export default function Landing() {
  const business = useBusiness()
  const [menuOpen, setMenuOpen] = useState(false)
  const demoUrl = `/${business.slug}`
  const nav = [['#funciones', 'Funciones'], ['#precios', 'Precios'], ['#preguntas', 'Preguntas']]

  // Título propio de la pestaña mientras se ve la landing
  useEffect(() => {
    const previous = document.title
    document.title = 'Barber OS · El sistema operativo de tu barbería'
    return () => { document.title = previous }
  }, [])

  return (
    <div className="min-h-screen bg-surface-container-lowest font-sans text-on-surface">
      {/* Encabezado */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/90 backdrop-blur border-b border-outline-variant">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin h-16 flex items-center gap-space-lg">
          <Link to="/barber-os" aria-label="Barber OS"><Logo /></Link>
          <nav aria-label="Secciones" className="hidden md:flex items-center gap-space-lg">
            {nav.map(([href, label]) => <a key={href} href={href} className="text-body-sm font-body-medium text-on-surface-variant hover:text-on-surface">{label}</a>)}
          </nav>
          <div className="ml-auto hidden sm:flex items-center gap-space-sm">
            <Button as={Link} to="/login" variant="ghost" icon={LogIn}>Iniciar sesión</Button>
            <Button as={Link} to={demoUrl} variant="secondary">Ver demo</Button>
            <Button as={Link} to="/onboarding" iconRight={ArrowRight}>Crear mi barbería</Button>
          </div>
          <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} className="sm:hidden ml-auto p-1.5 rounded text-on-surface-variant">
            {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
        {menuOpen && (
          <nav className="sm:hidden border-t border-outline-variant px-margin-mobile py-space-sm flex flex-col">
            {nav.map(([href, label]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="py-2">{label}</a>)}
            <Link to="/login" className="py-2">Iniciar sesión</Link>
            <Link to={demoUrl} className="py-2">Ver demo</Link>
            <Button as={Link} to="/onboarding" className="justify-center mt-space-sm">Crear mi barbería</Button>
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-primary-fixed/50 to-transparent" aria-hidden />
          <div className="relative max-w-[1200px] mx-auto px-margin-mobile md:px-margin pt-[56px] md:pt-[80px] pb-[56px] grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-[48px] items-center">
            <div className="flex flex-col gap-space-lg">
              <span className="self-start inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 text-[12px] font-body-medium text-on-surface-variant">
                <Scissors size={14} className="text-primary" aria-hidden /> Software de citas para barberías
              </span>
              <h1 className="text-[40px] md:text-[56px] leading-[1.05] font-semibold tracking-tight text-balance">
                El sistema operativo de tu <span className="text-primary">barbería</span>
              </h1>
              <p className="text-[17px] leading-7 text-on-surface-variant max-w-xl">
                Agenda, equipo, clientes e ingresos en un solo lugar. Tus clientes reservan en línea a cualquier hora y tú solo ves horarios que de verdad están libres.
              </p>
              <div className="flex flex-wrap gap-space-sm">
                <Button as={Link} to="/onboarding" iconRight={ArrowRight} className="h-11 px-space-lg text-body-semibold">Crear mi barbería</Button>
                <Button as={Link} to={demoUrl} variant="secondary" className="h-11 px-space-lg">Ver demo en vivo</Button>
              </div>
              <ul className="flex flex-wrap gap-x-space-lg gap-y-space-xs text-body-sm text-on-surface-variant">
                {['Funciona en el navegador', 'Sin app para tus clientes', 'Exporta tus datos cuando quieras'].map((t) => (
                  <li key={t} className="flex items-center gap-1.5"><Check size={16} className="text-emerald-600" aria-hidden /> {t}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-space-xs">
              <BrowserFrame url="barberos.app/panel/resumen" className="min-w-0">
                <DashboardPreview />
              </BrowserFrame>
              <p className="text-[12px] text-on-surface-variant text-right">Vista ilustrativa con datos de ejemplo</p>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section id="funciones" className="scroll-mt-20 max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[64px] flex flex-col gap-[40px]">
          <SectionHeader center eyebrow="Funciones" title="Diseñado para el día a día de una barbería" text="Deja la libreta y las llamadas. Todo lo que pasa en tu barbería, en una sola pantalla." />
          <div className="grid md:grid-cols-3 gap-gutter">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl border border-outline-variant p-space-lg flex flex-col gap-space-sm">
                <span className="w-11 h-11 rounded-lg bg-primary-fixed text-primary flex items-center justify-center"><Icon size={22} strokeWidth={1.75} aria-hidden /></span>
                <h3 className="font-headline-section text-headline-section">{title}</h3>
                <p className="text-body-default text-on-surface-variant">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Agenda */}
        <section className="bg-background border-y border-outline-variant">
          <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[64px] grid grid-cols-1 lg:grid-cols-2 gap-[48px] items-center">
            <div className="flex flex-col gap-space-lg">
              <SectionHeader eyebrow="Agenda" title="Cada barbero, su turno y sus citas de un vistazo" text="Haz clic en un hueco libre para agendar. Reprograma o cambia de barbero y el sistema te muestra solo los horarios disponibles." />
              <ul className="flex flex-col gap-space-sm">
                {[
                  [CalendarClock, 'Vista por día o por semana, con descansos marcados'],
                  [ShieldCheck, 'Nunca se enciman dos citas del mismo barbero'],
                  [Users, 'Cada barbero tiene su propia agenda del día'],
                ].map(([Icon, t]) => (
                  <li key={t} className="flex items-center gap-space-sm"><Icon size={18} className="text-primary shrink-0" aria-hidden /> {t}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-space-xs min-w-0">
              <BrowserFrame url="barberos.app/panel/agenda">
                <div className="max-h-[340px] overflow-hidden">
                  <TimeGrid columns={DEMO_COLUMNS} onOpen={() => {}} minColumnWidth={150} />
                </div>
              </BrowserFrame>
              <p className="text-[12px] text-on-surface-variant text-right">Vista ilustrativa con datos de ejemplo</p>
            </div>
          </div>
        </section>

        {/* Reserva del cliente */}
        <section className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[64px] grid grid-cols-1 lg:grid-cols-2 gap-[48px] items-center">
          <div className="order-2 lg:order-1 flex flex-col gap-space-xs max-w-md w-full mx-auto">
            <BrowserFrame url={`barberos.app/${business.slug}/reservar`}>
              <BookingPreview />
            </BrowserFrame>
            <p className="text-[12px] text-on-surface-variant text-right">Vista ilustrativa</p>
          </div>
          <div className="order-1 lg:order-2 flex flex-col gap-space-lg">
            <SectionHeader eyebrow="Reservas en línea" title="Tus clientes reservan en cuatro pasos" text="Servicio, barbero (o el primero disponible), fecha y hora. Después consultan, reprograman o cancelan desde su cuenta." />
            <ul className="flex flex-col gap-space-sm">
              {[
                [Smartphone, 'Pensado para el celular'],
                [CalendarCheck, 'Solo horarios libres que alcanzan la duración del servicio'],
                [NotebookPen, 'El cliente deja indicaciones para su barbero'],
              ].map(([Icon, t]) => (
                <li key={t} className="flex items-center gap-space-sm"><Icon size={18} className="text-primary shrink-0" aria-hidden /> {t}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Clientes y reportes */}
        <section className="bg-background border-y border-outline-variant">
          <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[64px] grid md:grid-cols-2 gap-gutter">
            {[
              { icon: Users, title: 'Clientes con historial', text: 'Visitas, gasto total, barbero y servicio habituales, cumpleaños y las notas de cada corte. Llama o escribe por WhatsApp desde su expediente.' },
              { icon: FileDown, title: 'Reportes que puedes llevarte', text: 'Ingresos por día o semana, citas por estado, servicios más pedidos y rendimiento por barbero. Descárgalos en PDF o CSV.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-space-lg flex gap-space-md">
                <span className="w-11 h-11 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0"><Icon size={22} strokeWidth={1.75} aria-hidden /></span>
                <div className="flex flex-col gap-space-xs">
                  <h3 className="font-headline-section text-headline-section">{title}</h3>
                  <p className="text-body-default text-on-surface-variant">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Caso real */}
        <section className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[64px]">
          <div className="rounded-2xl bg-inverse-surface text-inverse-on-surface p-space-lg md:p-[48px] flex flex-col md:flex-row md:items-center md:justify-between gap-space-lg">
            <div className="flex flex-col gap-space-sm max-w-xl">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-blue-300">Ejemplo en vivo</span>
              <h2 className="text-[28px] leading-tight font-semibold tracking-tight text-white">Mira cómo lo usa {business.name}</h2>
              <p className="text-slate-300">Recorre su página pública y el flujo de reserva, tal como lo ven sus clientes en {business.city}.</p>
            </div>
            <Button as={Link} to={demoUrl} iconRight={ArrowRight} className="h-11 px-space-lg self-start md:self-auto">Abrir {business.name}</Button>
          </div>
        </section>

        {/* Precios */}
        <section id="precios" className="scroll-mt-20 bg-background border-y border-outline-variant">
          <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[64px] flex flex-col gap-[40px]">
            <SectionHeader center eyebrow="Precios" title="Un plan para cada barbería" text="Los precios se anunciarán pronto. Todos los planes incluyen tu página de reservas." />
            <div className="grid md:grid-cols-3 gap-gutter items-stretch">
              {PLANS.map((p) => (
                <div key={p.name} className={cn('rounded-xl border bg-surface-container-lowest p-space-lg flex flex-col gap-space-md', p.highlight ? 'border-primary ring-1 ring-primary shadow-lg' : 'border-outline-variant')}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-section text-headline-section">{p.name}</h3>
                    {p.highlight && <span className="text-[11px] font-semibold uppercase tracking-wide text-primary bg-primary-fixed rounded-full px-2 py-0.5">Recomendado</span>}
                  </div>
                  <p className="text-body-sm text-on-surface-variant">{p.description}</p>
                  <p className="flex items-baseline gap-1">
                    {p.price == null ? (
                      <span className="text-[22px] font-semibold">Por anunciar</span>
                    ) : (
                      <><span className="text-[32px] font-semibold tabular-nums">${p.price}</span><span className="text-on-surface-variant">MXN / mes</span></>
                    )}
                  </p>
                  <ul className="flex flex-col gap-space-sm flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-space-sm text-body-default"><Check size={18} className="text-emerald-600 shrink-0 mt-0.5" aria-hidden /> {f}</li>
                    ))}
                  </ul>
                  <Button as={Link} to="/onboarding" variant={p.highlight ? 'primary' : 'secondary'} className="justify-center">Empezar</Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Preguntas */}
        <section id="preguntas" className="scroll-mt-20 max-w-[860px] mx-auto px-margin-mobile md:px-margin py-[64px] flex flex-col gap-space-lg">
          <SectionHeader center eyebrow="Preguntas frecuentes" title="Lo que suelen preguntarnos" />
          <div className="border-t border-outline-variant">
            {FAQS.map(([q, a]) => <Faq key={q} q={q} a={a} />)}
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-md text-body-sm text-on-surface-variant">
          <div className="flex items-center gap-space-md">
            <Logo />
            <span>El sistema operativo de tu barbería</span>
          </div>
          <div className="flex flex-wrap gap-space-lg">
            <Link to={demoUrl} className="hover:text-on-surface">Demo: {business.name}</Link>
            <Link to="/login" className="hover:text-on-surface">Iniciar sesión</Link>
            <span>© {new Date().getFullYear()} Barber OS</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
