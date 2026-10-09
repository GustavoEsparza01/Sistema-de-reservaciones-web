// Flujo de reserva del cliente (design/stitch/11-reserva): servicio → barbero → fecha y hora → confirmar.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { addDays, format, isToday, parseISO, startOfDay, endOfDay, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ArrowLeft, ArrowRight, CalendarCheck, CalendarDays, CalendarPlus, Check, ChevronUp, CircleAlert, Clock, LogIn, MapPin, RotateCw,
  Scissors, Sun, Sunset, Timer, User, Users,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useBusiness } from '../../hooks/useBusiness'
import { googleCalendarLink } from '../../hooks/useMyAppointments'
import { supabase } from '../../lib/supabaseClient'
import { fetchPublicBarbers, fetchPublicServices } from '../../lib/publicData'
import { createAppointment, normalizeAppointment } from '../../lib/appointments'
import { availableSlots, shiftFor, toMinutes } from '../../lib/availability'
import { formatDateLong, formatDuration, formatMoneyMXN } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Avatar, Button, EmptyState, Textarea, useToast } from '../../components/ui'
import PortalCard from '../../components/portal/PortalCard'

const ANY = 'cualquiera'
const DAYS_AHEAD = 30
const STEPS = ['Servicio', 'Barbero', 'Fecha y hora', 'Confirmar']
const noDots = (s) => s.replace(/\./g, '')
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Flechas, Inicio y Fin mueven el foco entre los radios habilitados del grupo (no eligen). */
function moveAmongRadios(e) {
  const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: 'first', End: 'last' }
  const dir = keys[e.key]
  if (!dir) return
  const radios = [...e.currentTarget.querySelectorAll('[role="radio"]:not(:disabled)')]
  const i = radios.indexOf(document.activeElement)
  if (i === -1) return
  e.preventDefault()
  const next = dir === 'first' ? 0 : dir === 'last' ? radios.length - 1 : Math.min(Math.max(i + dir, 0), radios.length - 1)
  radios[next].focus()
  radios[next].scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

/** Citas (no canceladas) de todos los barberos en un día. */
async function fetchDayAppointments(date) {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, barber_id, scheduled_at, ends_at, duration_min, status')
    .neq('status', 'cancelled')
    .gte('scheduled_at', startOfDay(date).toISOString())
    .lte('scheduled_at', endOfDay(date).toISOString())
  if (error) throw error
  return data.map(normalizeAppointment)
}

const NEXT_SLOT_DAYS = 14

/**
 * Próximo horario libre de cada barbero para el servicio elegido: revisa día por
 * día (máx. 2 semanas) y se detiene cuando ya encontró lugar para todos.
 * map: id → { date, time } o null si no hay lugar. Si falla, simplemente no se muestra.
 */
function useNextSlots(barbers, service, enabled, loadDay) {
  const [state, setState] = useState({ loading: false, map: null })
  useEffect(() => {
    if (!enabled || !service || barbers.length === 0) return
    let alive = true
    setState({ loading: true, map: null })
    ;(async () => {
      const map = new Map()
      const pending = new Set(barbers.map((b) => b.id))
      const today = startOfDay(new Date())
      for (let i = 0; i < NEXT_SLOT_DAYS && pending.size > 0; i++) {
        const day = addDays(today, i)
        const working = barbers.filter((b) => pending.has(b.id) && shiftFor(b.schedule, day))
        if (working.length === 0) continue
        const appointments = await loadDay(day)
        if (!alive) return
        for (const b of working) {
          const [first] = availableSlots({ schedule: b.schedule, date: day, duration: service.duration, appointments: appointments.filter((a) => a.barberId === b.id) })
          if (first) {
            map.set(b.id, { date: day, time: first })
            pending.delete(b.id)
          }
        }
      }
      for (const id of pending) map.set(id, null)
      if (alive) setState({ loading: false, map })
    })().catch(() => alive && setState({ loading: false, map: null }))
    return () => { alive = false }
  }, [enabled, service, barbers])
  return state
}

/** "Hoy 17:00", "Mañana 09:00" o "jue 10 oct, 09:00" */
function slotLabel({ date, time }) {
  if (isToday(date)) return `Hoy ${time}`
  if (isTomorrow(date)) return `Mañana ${time}`
  return `${noDots(format(date, 'EEE d MMM', { locale: es }))}, ${time}`
}

/** Línea "Próximo lugar" dentro de la tarjeta del barbero (cambia de tono si está elegida). */
function NextSlot({ loading, slot }) {
  if (loading) return <span className="block h-4 w-36 mt-1 rounded bg-ink/10 group-aria-pressed:bg-white/15 animate-pulse" aria-hidden />
  if (slot === undefined) return null
  if (slot === null) return <p className="text-body-sm text-ink/70 group-aria-pressed:text-white/70 mt-1">Sin lugar en las próximas 2 semanas</p>
  return (
    <p className="flex items-center gap-1 text-body-sm font-body-medium text-gold-deep group-aria-pressed:text-gold-light mt-1 tabular-nums">
      <Clock size={14} strokeWidth={1.75} aria-hidden /> Próximo lugar: {slotLabel(slot)}
    </p>
  )
}

// Interruptor de datos de prueba: solo se dibuja en desarrollo. Es herramienta, no diseño.
const DEMO_MODES = [['', 'Real'], ['peor', 'Peor caso'], ['vacio', 'Vacío'], ['uno', 'Uno'], ['sinlugar', 'Sin horarios']]
function DemoDataToggle({ mode, onChange }) {
  if (!import.meta.env.DEV) return null
  return (
    <div className="fixed top-[76px] left-1/2 -translate-x-1/2 z-50 flex gap-0.5 rounded-full bg-neutral-200 p-0.5 text-[12px] shadow" style={{ fontFamily: 'system-ui, sans-serif' }} role="group" aria-label="Datos de prueba (solo desarrollo)">
      {DEMO_MODES.map(([value, label]) => (
        <button
          key={value || 'real'}
          type="button"
          onClick={() => onChange(value)}
          className={cn('rounded-full px-2.5 py-1 whitespace-nowrap', mode === value ? 'bg-white text-black shadow-sm' : 'text-neutral-600')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function Stepper({ step }) {
  return (
    <ol className="grid grid-cols-4 gap-space-xs" aria-label="Pasos de la reserva">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < step
        const current = n === step
        return (
          <li key={label} className="flex flex-col gap-1.5" aria-current={current ? 'step' : undefined}>
            <div className={cn('h-1 rounded-full transition-colors duration-300', done || current ? 'bg-gold' : 'bg-ink/10')} />
            <span className={cn('text-[12px] font-body-medium flex items-center gap-1', current ? 'text-gold-deep' : done ? 'text-ink' : 'text-ink/60')}>
              {done && <Check size={12} strokeWidth={2.5} aria-hidden />}
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

// Opción elegida en carbón; los hijos ajustan sus tonos con group-aria-pressed:
function Choice({ selected, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'group w-full text-left rounded-xl border p-space-md transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        selected ? 'border-ink bg-ink text-white' : 'border-ink/10 bg-white hover:border-gold hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-18px_rgba(15,15,16,0.35)]',
        className
      )}
    >
      {children}
    </button>
  )
}

/** Filas del resumen (sobre fondo carbón) con "Cambiar" en lo ya elegido. */
function SummaryRows({ rows, step, onEdit }) {
  return (
    <dl className="flex flex-col gap-space-sm text-body-sm">
      {rows.map(([Icon, label, value, editStep]) => (
        <div key={label} className="flex gap-space-sm">
          <Icon size={16} strokeWidth={1.75} className="text-gold mt-0.5 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <dt className="text-ink-muted">{label}</dt>
            <dd className={cn('first-letter:uppercase', value ? 'text-white font-body-medium' : 'text-white/60')}>{value ?? 'Por elegir'}</dd>
          </div>
          {value && editStep && editStep < step && (
            // Área de toque de ~44 px sin mover el acomodo
            <button
              type="button"
              onClick={() => onEdit(editStep)}
              aria-label={`Cambiar ${label.toLowerCase()}`}
              className="self-start -my-3 -mr-2 px-2 py-3 text-[12px] text-gold-light hover:text-gold hover:underline underline-offset-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              Cambiar
            </button>
          )}
        </div>
      ))}
    </dl>
  )
}

/** "$4,850.50" grande y "MXN" chico: el total no se parte en dos líneas. */
function Price({ amount, className }) {
  const [value, currency] = formatMoneyMXN(amount).split(' ')
  return (
    <span className={cn('font-display font-semibold text-gold tabular-nums whitespace-nowrap', className)}>
      {value}{currency && <span className="ml-1 font-sans text-[11px] font-medium tracking-wide text-gold-light">{currency}</span>}
    </span>
  )
}

/** Resumen de la cita como comprobante carbón: lo elegido y el total. */
function Summary({ rows, step, total, onEdit, children }) {
  return (
    <PortalCard tone="ink" className="flex flex-col gap-space-md">
      <h2 className="font-display text-[20px] font-semibold">Resumen de tu cita</h2>
      <SummaryRows rows={rows} step={step} onEdit={onEdit} />
      {/* Corte de comprobante */}
      <div className="border-t border-dashed border-ink-line pt-space-md flex items-baseline justify-between gap-space-sm">
        <span className="text-body-sm text-ink-muted min-w-0">Total a pagar en el local</span>
        {total != null
          ? <Price amount={total} className="text-[26px] shrink-0" />
          : <span className="text-body-sm text-white/60">Por elegir</span>}
      </div>
      {children}
    </PortalCard>
  )
}

/**
 * Barra fija abajo en celular: lo elegido, el total y la acción del paso
 * ("Continuar", o en el paso 4 "Iniciar sesión" / "Confirmar").
 * Al tocarla se despliega el resumen completo. Es sticky dentro de la página,
 * así que al final se detiene antes del pie.
 */
function MobileSummaryBar({ rows, step, total, onEdit, action }) {
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [step])
  const service = rows[0][2]
  const time = rows[3][2]

  return (
    <div className="lg:hidden sticky bottom-0 z-30 mt-auto -mx-margin-mobile md:-mx-margin -mb-space-xl">
      <div className="bg-ink text-white border-t border-ink-line shadow-[0_-16px_32px_-16px_rgba(15,15,16,0.55)]">
        <div id="resumen-movil" className={cn('grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
          <div className="overflow-hidden" inert={open ? undefined : ''}>
            <div className="px-margin-mobile md:px-margin pt-space-md pb-space-sm border-b border-dashed border-ink-line">
              <SummaryRows rows={rows} step={step} onEdit={(s) => { setOpen(false); onEdit(s) }} />
            </div>
          </div>
        </div>
        <div className="px-margin-mobile md:px-margin pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-space-sm">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="resumen-movil"
            className="min-w-0 flex-1 text-left py-1"
          >
            {/* Con botón a la derecha hay menos espacio: solo "Paso N de 4" */}
            <span className="flex items-center gap-1 text-[12px] text-ink-muted min-w-0">
              <span className="truncate">Paso {step} de {STEPS.length}{!action && <> · {open ? 'Ocultar' : 'Ver'} resumen</>}</span>
              <ChevronUp size={14} strokeWidth={1.75} className={cn('shrink-0 transition-transform duration-300', !open && 'rotate-180')} aria-hidden />
              {action && <span className="sr-only">{open ? 'Ocultar' : 'Ver'} resumen</span>}
            </span>
            {/* Con botón, la segunda línea es el total (no cabe todo a 320 px); sin botón, lo elegido */}
            {action && total != null ? <Price amount={total} className="block text-[18px] leading-tight" /> : (
            <span className="block truncate text-body-medium">
              {service ? service.split(' · ')[0] : 'Elige un servicio'}{time ? ` · ${time}` : ''}
            </span>
            )}
          </button>
          {!action && total != null && (
            <Price amount={total} className="text-[22px] shrink-0" />
          )}
          {action}
        </div>
      </div>
    </div>
  )
}

export default function Reservar() {
  const business = useBusiness()
  const { session, profile } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const [params, setParams] = useSearchParams()

  const [catalog, setCatalog] = useState({ services: [], barbers: [], loading: true, error: null })
  const [dayAppointments, setDayAppointments] = useState(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [booked, setBooked] = useState(null)

  // Solo en desarrollo: ?datos=peor|vacio|uno|sinlugar cambia los datos por los de prueba
  const demoMode = import.meta.env.DEV ? params.get('datos') ?? '' : ''
  const loadDay = demoMode ? async () => [] : fetchDayAppointments

  useEffect(() => {
    let alive = true
    setCatalog({ services: [], barbers: [], loading: true, error: null })
    const load = demoMode
      ? import('./reservarDemoData').then(({ DEMO_DATA }) => [DEMO_DATA[demoMode]?.services ?? [], DEMO_DATA[demoMode]?.barbers ?? []])
      : Promise.all([fetchPublicServices(), fetchPublicBarbers()])
    load
      .then(([services, barbers]) => alive && setCatalog({ services, barbers, loading: false, error: null }))
      .catch((error) => alive && setCatalog((c) => ({ ...c, loading: false, error })))
    return () => { alive = false }
  }, [demoMode])

  // Selección actual (vive en la URL)
  const service = catalog.services.find((s) => s.id === params.get('servicio')) ?? null
  const barberParam = params.get('barbero') ?? ''
  const barber = barberParam === ANY ? null : catalog.barbers.find((b) => b.id === barberParam) ?? null
  const barberChosen = barberParam === ANY || !!barber
  const date = params.get('fecha') ? startOfDay(parseISO(params.get('fecha'))) : null
  const time = params.get('hora') ?? ''

  // El paso no puede adelantarse a lo que falta elegir
  const maxStep = !service ? 1 : !barberChosen ? 2 : !date || !time ? 3 : 4
  const step = Math.min(Number(params.get('paso')) || maxStep, maxStep)

  function update(changes, nextStep) {
    if (changes.hora) setSubmitError(null)
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(changes)) {
          if (v === '' || v == null) next.delete(k)
          else next.set(k, String(v))
        }
        if (nextStep) next.set('paso', String(nextStep))
        return next
      },
      { replace: false }
    )
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  // Al cambiar de paso, el foco va al título del paso nuevo (teclado y lector de pantalla).
  // En la primera carga no se mueve el foco.
  const stepHeading = useRef(null)
  const firstStep = useRef(true)
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return }
    stepHeading.current?.focus({ preventScroll: true })
  }, [step])

  // En el paso 3, la tira de días se desplaza hasta el día elegido (p. ej. el próximo lugar del barbero)
  useEffect(() => {
    if (step !== 3) return
    document.querySelector('[data-selected-day]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, params.get('fecha')])

  // Citas del día elegido para calcular horarios libres. Si la consulta falla
  // no se muestran horarios (serían falsos): se avisa y se ofrece reintentar.
  const [dayError, setDayError] = useState(false)
  const [dayRetry, setDayRetry] = useState(0)
  useEffect(() => {
    if (!date) return
    let alive = true
    setDayAppointments(null)
    setDayError(false)
    loadDay(date)
      .then((r) => alive && setDayAppointments(r))
      .catch(() => alive && setDayError(true))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get('fecha'), dayRetry])

  const candidates = barber ? [barber] : catalog.barbers

  // Paso 2: próximo lugar de cada barbero (y el más pronto para "Cualquier barbero")
  const nextSlots = useNextSlots(catalog.barbers, service, step >= 2, loadDay)
  const earliestSlot = nextSlots.map
    ? [...nextSlots.map.values()].filter(Boolean).sort((a, b) => a.date - b.date || toMinutes(a.time) - toMinutes(b.time))[0] ?? null
    : undefined

  // Al elegir barbero, el paso 3 abre en el día de su próximo lugar
  // (salvo que ya haya un día elegido en el que ese barbero trabaje)
  function chooseBarber(id, next) {
    const keep = date && (id === ANY ? catalog.barbers : catalog.barbers.filter((b) => b.id === id)).some((b) => shiftFor(b.schedule, date))
    update({ barbero: id, hora: '', ...(!keep && next ? { fecha: format(next.date, 'yyyy-MM-dd') } : {}) }, 3)
  }

  // Horario → barbero que lo atiende (con "cualquiera", el primero libre)
  const slotMap = useMemo(() => {
    if (!service || !date || dayAppointments == null) return null
    const map = new Map()
    for (const b of candidates) {
      const mine = dayAppointments.filter((a) => a.barberId === b.id)
      for (const s of availableSlots({ schedule: b.schedule, date, duration: service.duration, appointments: mine })) {
        if (!map.has(s)) map.set(s, b)
      }
    }
    return new Map([...map.entries()].sort(([x], [y]) => toMinutes(x) - toMinutes(y)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id, barberParam, date?.getTime(), dayAppointments, catalog.barbers])

  const assigned = time && slotMap ? slotMap.get(time) ?? null : null
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(startOfDay(new Date()), i))
  // Un día se puede elegir si algún barbero trabaja y aún cabe el servicio
  // (hoy puede quedar sin tiempo aunque sea día laboral)
  const worksOn = (d) =>
    candidates.some((b) =>
      shiftFor(b.schedule, d) &&
      (!service || availableSlots({ schedule: b.schedule, date: d, duration: service.duration, appointments: [] }).length > 0)
    )

  async function confirm() {
    if (!assigned || !session) return
    const [h, m] = time.split(':').map(Number)
    const start = new Date(date)
    start.setHours(h, m, 0, 0)
    setSaving(true)
    setSubmitError(null)
    try {
      const id = await createAppointment({ clientId: session.user.id, barberId: assigned.id, service, start, notes, status: 'pending' })
      setBooked({ id, start, end: new Date(start.getTime() + service.duration * 60000), barber: assigned, service })
      window.scrollTo({ top: 0 })
    } catch (err) {
      const taken = /overlap|traslap|solap/i.test(err.message)
      setSubmitError(taken ? 'Ese horario se acaba de ocupar. Elige otro, por favor.' : 'No se pudo registrar tu cita. Inténtalo de nuevo.')
      if (taken) {
        update({ hora: '' }, 3)
        setDayRetry((n) => n + 1)
      }
      toast({ tone: 'error', title: 'No se pudo reservar', description: taken ? 'Ese horario ya no está disponible. Elige otro.' : 'Revisa tu conexión e inténtalo de nuevo.' })
    } finally {
      setSaving(false)
    }
  }

  // ── Reserva registrada ───────────────────────────────────────
  if (booked) {
    return (
      <div className="max-w-[640px] mx-auto px-margin-mobile md:px-margin py-space-xl">
        <PortalCard className="flex flex-col items-center text-center gap-space-md p-space-xl">
          <span className="w-14 h-14 rounded-full bg-ink text-gold ring-1 ring-gold/40 flex items-center justify-center">
            <CalendarCheck size={28} strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-[30px] leading-tight font-semibold text-ink">¡Tu cita quedó registrada!</h1>
            <p className="text-body-default text-ink/70 mt-space-xs max-w-[46ch] mx-auto">
              Queda pendiente hasta que la barbería la confirme; te avisarán por WhatsApp o llamada. También verás el cambio en "Mis citas".
            </p>
          </div>
          <dl className="w-full text-left rounded-xl border border-ink/10 divide-y divide-ink/10">
            {[
              ['Folio', `#${booked.id.slice(0, 8).toUpperCase()}`],
              ['Servicio', `${booked.service.name} · ${formatMoneyMXN(booked.service.price)}`],
              ['Fecha', formatDateLong(booked.start)],
              ['Hora', `${format(booked.start, 'HH:mm')} a ${format(booked.end, 'HH:mm')} h`],
              ['Barbero', booked.barber.name],
              ['Lugar', `${business.name}, ${business.city}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-space-md px-space-md py-2.5 text-body-sm">
                <dt className="text-ink/70">{k}</dt>
                <dd className="text-right font-body-medium first-letter:uppercase">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="w-full grid sm:grid-cols-2 gap-space-sm">
            <Button
              as="a"
              href={googleCalendarLink({ title: `${booked.service.name} · ${business.name}`, start: booked.start, end: booked.end, location: `${business.name}, ${business.city}` })}
              target="_blank"
              rel="noreferrer"
              variant="outline-dark"
              icon={CalendarPlus}
              className="justify-center"
            >
              Agregar a Google Calendar
            </Button>
            <Button variant="gold" as={Link} to={`/${business.slug}/mis-citas`} icon={CalendarDays} className="justify-center">Ver mis citas</Button>
          </div>
          <Link to={`/${business.slug}`} className="text-body-sm text-gold-deep hover:underline">Volver a la página principal</Link>
        </PortalCard>
      </div>
    )
  }

  const morning = slotMap ? [...slotMap.keys()].filter((s) => toMinutes(s) < 12 * 60) : []
  const afternoon = slotMap ? [...slotMap.keys()].filter((s) => toMinutes(s) >= 12 * 60) : []

  // Teclado en días y horas: un solo Tab entra al grupo (el elegido o el primero
  // disponible) y las flechas recorren las opciones; Enter o Espacio elige.
  const tabbableDay = (date && worksOn(date) ? date : days.find(worksOn))?.getTime()
  const tabbableSlot = time && slotMap?.has(time) ? time : (slotMap ? [...slotMap.keys()][0] : null)


  // [icono, etiqueta, valor, paso donde se cambia]
  const summaryRows = [
    [Scissors, 'Servicio', service ? `${service.name} · ${formatDuration(service.duration)}` : null, 1],
    [User, 'Barbero', barberParam === ANY ? (assigned ? `${assigned.name} (asignado)` : 'Cualquier barbero') : barber?.name, 2],
    [CalendarDays, 'Fecha', date ? formatDateLong(date) : null, 3],
    [Clock, 'Hora', time ? `${time} h` : null, 3],
    [MapPin, 'Lugar', `${business.name}, ${business.city}`, null],
  ]
  const canContinue = step < 4 && step < maxStep
  const loginUrl = `/login?volver=${encodeURIComponent(location.pathname + location.search)}`

  // Acción de la barra de abajo en celular: siempre al alcance del pulgar
  let mobileAction = null
  if (step < 4) {
    if (canContinue) mobileAction = <Button variant="gold" iconRight={ArrowRight} className="h-11" onClick={() => update({}, step + 1)}>Continuar</Button>
  } else if (!session) {
    mobileAction = <Button as={Link} to={loginUrl} variant="gold" icon={LogIn} className="h-11">Iniciar sesión</Button>
  } else if (profile?.role !== 'banned') {
    mobileAction = <Button variant="gold" onClick={confirm} loading={saving} disabled={!assigned} icon={CalendarCheck} className="h-11">Confirmar</Button>
  }

  return (
    <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-space-lg min-h-[calc(100dvh-4rem)] lg:min-h-0">
      <DemoDataToggle mode={demoMode} onChange={(v) => update({ datos: v, servicio: '', barbero: '', fecha: '', hora: '', paso: '' })} />
      <header className="flex flex-col gap-space-md">
        <div>
          <h1 className="animate-enter font-display text-[32px] md:text-[40px] leading-tight font-semibold text-ink">Reservar cita</h1>
          <p className="text-body-default text-ink/70">{business.name} · {business.city}</p>
        </div>
        <Stepper step={step} />
        {/* Anuncia el paso actual al lector de pantalla */}
        <p className="sr-only" aria-live="polite">Paso {step} de {STEPS.length}: {STEPS[step - 1]}</p>
      </header>

      {catalog.error ? (
        <PortalCard><EmptyState icon={CircleAlert} title="No se pudo cargar la información" description="Revisa tu conexión y recarga la página." /></PortalCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-gutter items-start">
          {/* key={step}: cada paso entra con animación */}
          <div key={step} className="animate-enter flex flex-col gap-space-lg min-w-0">
            {/* Paso 1: servicio */}
            {step === 1 && (
              <section className="flex flex-col gap-space-md">
                <h2 ref={stepHeading} tabIndex={-1} className="font-display text-[22px] font-semibold text-ink focus:outline-none">Elige tu servicio</h2>
                {catalog.loading ? (
                  [0, 1, 2].map((i) => <div key={i} className="h-24 w-full rounded-xl bg-ink/10 animate-pulse" aria-hidden />)
                ) : catalog.services.length === 0 ? (
                  <PortalCard>
                    <EmptyState
                      icon={Scissors}
                      title="Todavía no hay servicios para reservar"
                      description={`${business.name} aún no publica sus servicios. Vuelve pronto o visita el local.`}
                      action={<Button as={Link} to={`/${business.slug}`} variant="outline-dark" icon={ArrowLeft}>Volver al inicio</Button>}
                    />
                  </PortalCard>
                ) : (
                  <div className="grid grid-cols-1 gap-space-sm">
                    {catalog.services.map((s) => (
                      <Choice key={s.id} selected={service?.id === s.id} onClick={() => update({ servicio: s.id, hora: '' }, 2)}>
                        {/* Nombre a todo lo ancho; duración y precio debajo, para que un precio largo no aplaste el nombre */}
                        <p className="font-body-semibold [overflow-wrap:anywhere]">{s.name}</p>
                        <div className="flex items-baseline justify-between gap-space-md mt-0.5">
                          <p className="flex items-center gap-1 text-body-sm text-ink/70 group-aria-pressed:text-white/70"><Timer size={14} strokeWidth={1.75} aria-hidden /> {formatDuration(s.duration)}</p>
                          <span className="font-body-semibold tabular-nums whitespace-nowrap text-gold-deep group-aria-pressed:text-gold-light">{formatMoneyMXN(s.price)}</span>
                        </div>
                        {s.description && <p className="text-body-sm text-ink/70 group-aria-pressed:text-white/70 mt-1 [overflow-wrap:anywhere]">{s.description}</p>}
                      </Choice>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Paso 2: barbero */}
            {step === 2 && (
              <section className="flex flex-col gap-space-md">
                <h2 ref={stepHeading} tabIndex={-1} className="font-display text-[22px] font-semibold text-ink focus:outline-none">Elige a tu barbero</h2>
                {/* grid-cols-1 explícito: con una columna implícita, un texto largo ensancha la pista más que la pantalla */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  <Choice selected={barberParam === ANY} onClick={() => chooseBarber(ANY, earliestSlot)}>
                    <div className="flex items-center gap-space-sm">
                      <span className="w-12 h-12 rounded-full bg-ink text-gold ring-1 ring-gold/40 flex items-center justify-center shrink-0"><Users size={20} strokeWidth={1.75} aria-hidden /></span>
                      <div className="min-w-0">
                        <p className="font-body-semibold">Cualquier barbero</p>
                        <p className="text-body-sm text-ink/70 group-aria-pressed:text-white/70">Te asignamos al primero disponible</p>
                        <NextSlot loading={nextSlots.loading} slot={nextSlots.map ? earliestSlot : undefined} />
                      </div>
                    </div>
                  </Choice>
                  {catalog.barbers.map((b) => (
                    <Choice key={b.id} selected={barber?.id === b.id} onClick={() => chooseBarber(b.id, nextSlots.map?.get(b.id))}>
                      <div className="flex items-center gap-space-sm">
                        <Avatar name={b.name} src={b.photo} size="lg" tone="premium" className="ring-1 ring-gold/40" />
                        <div className="min-w-0">
                          <p className="font-body-semibold line-clamp-2 [overflow-wrap:anywhere]" title={b.name}>{b.name}</p>
                          {b.bio && <p className="text-body-sm text-ink/70 group-aria-pressed:text-white/70 line-clamp-2">{b.bio}</p>}
                          <NextSlot loading={nextSlots.loading} slot={nextSlots.map?.get(b.id)} />
                        </div>
                      </div>
                    </Choice>
                  ))}
                </div>
              </section>
            )}

            {/* Paso 3: fecha y hora */}
            {step === 3 && (
              <section className="flex flex-col gap-space-md">
                <h2 ref={stepHeading} tabIndex={-1} className="font-display text-[22px] font-semibold text-ink focus:outline-none">Elige día y hora</h2>
                {/* Si el horario se ocupó al confirmar, el aviso queda aquí, donde se elige otro */}
                {submitError && <p role="alert" className="text-body-sm text-error bg-error-container rounded-lg px-3 py-2">{submitError}</p>}
                <div
                  className={cn('flex gap-1.5 overflow-x-auto overscroll-x-contain snap-x snap-mandatory pt-1 pb-2 -mx-1 px-1 [scrollbar-width:thin] [scrollbar-color:rgba(15,15,16,0.2)_transparent]', tabbableDay == null && 'hidden')}
                  role="radiogroup"
                  aria-label="Día"
                  onKeyDown={moveAmongRadios}
                >
                  {days.map((d) => {
                    const available = worksOn(d)
                    const selected = date && d.getTime() === date.getTime()
                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        role="radio"
                        aria-checked={!!selected}
                        aria-label={`${formatDateLong(d)}${available ? '' : ', sin horarios'}`}
                        tabIndex={d.getTime() === tabbableDay ? 0 : -1}
                        data-selected-day={selected ? '' : undefined}
                        disabled={!available}
                        onClick={() => update({ fecha: format(d, 'yyyy-MM-dd'), hora: '' })}
                        className={cn(
                          'snap-start shrink-0 w-16 rounded-lg border py-2 flex flex-col items-center gap-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                          selected ? 'bg-ink border-ink text-white' : 'bg-white border-ink/10 hover:border-gold hover:-translate-y-0.5',
                          !available && 'opacity-40 cursor-not-allowed hover:border-ink/10 hover:translate-y-0'
                        )}
                      >
                        <span className={cn('text-[11px] uppercase font-semibold', selected ? 'text-gold-light' : 'text-ink/70')}>
                          {isToday(d) ? 'Hoy' : isTomorrow(d) ? 'Mañana' : noDots(format(d, 'EEE', { locale: es }))}
                        </span>
                        <span className="font-body-semibold tabular-nums">{format(d, 'd')}</span>
                        <span className={cn('text-[11px]', selected ? 'text-gold-light' : 'text-ink/70')}>{noDots(format(d, 'MMM', { locale: es }))}</span>
                      </button>
                    )
                  })}
                </div>

                {tabbableDay == null ? (
                  // Ningún día de los próximos 30 tiene turno: no tiene sentido pedir "elige un día"
                  <PortalCard>
                    <EmptyState
                      icon={CalendarDays}
                      title={`Sin horarios en los próximos ${DAYS_AHEAD} días`}
                      description={barber ? `${barber.name} no tiene turnos en estas fechas.` : 'La barbería aún no tiene turnos abiertos en estas fechas.'}
                      action={barber
                        ? <Button variant="outline-dark" icon={Users} onClick={() => update({ barbero: ANY, fecha: '', hora: '' })}>Ver con cualquier barbero</Button>
                        : <Button as={Link} to={`/${business.slug}`} variant="outline-dark" icon={ArrowLeft}>Volver al inicio</Button>}
                    />
                  </PortalCard>
                ) : !date ? (
                  <p className="text-body-sm text-ink/70">Elige un día para ver los horarios disponibles.</p>
                ) : dayError ? (
                  <PortalCard role="alert">
                    <EmptyState
                      icon={CircleAlert}
                      title="No pudimos cargar los horarios"
                      description="Revisa tu conexión e inténtalo de nuevo. Tu selección se conserva."
                      action={<Button variant="outline-dark" icon={RotateCw} onClick={() => setDayRetry((n) => n + 1)}>Reintentar</Button>}
                    />
                  </PortalCard>
                ) : slotMap == null ? (
                  // Mismo acomodo que los horarios, para que no salte la pantalla al cargar
                  <div className="flex flex-col gap-space-sm" aria-busy="true">
                    <span className="sr-only" role="status">Cargando horarios disponibles…</span>
                    <div className="h-4 w-24 rounded bg-ink/10 animate-pulse" />
                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-1.5">
                      {Array.from({ length: 9 }, (_, i) => <div key={i} className="h-10 rounded-lg bg-ink/10 animate-pulse" />)}
                    </div>
                  </div>
                ) : slotMap.size === 0 ? (
                  <PortalCard>
                    <EmptyState
                      icon={Clock}
                      title="No quedan horarios este día"
                      description={barber ? `${barber.name} ya no tiene lugar. Prueba otro día o con cualquier barbero.` : 'Prueba con otro día.'}
                      action={barber && (
                        <Button variant="outline-dark" icon={Users} onClick={() => update({ barbero: ANY, hora: '' })}>Ver con cualquier barbero</Button>
                      )}
                    />
                  </PortalCard>
                ) : (
                  <div className="flex flex-col gap-space-md" role="radiogroup" aria-label="Hora" onKeyDown={moveAmongRadios}>
                    {[['Por la mañana', Sun, morning], ['Por la tarde', Sunset, afternoon]].map(([label, Icon, list]) =>
                      list.length ? (
                        <div key={label} className="flex flex-col gap-space-sm">
                          <p className="flex items-center gap-1.5 text-body-sm font-body-semibold text-ink/70"><Icon size={16} strokeWidth={1.75} aria-hidden /> {label}</p>
                          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-1.5">
                            {list.map((s) => (
                              <button
                                key={s}
                                type="button"
                                role="radio"
                                aria-checked={time === s}
                                tabIndex={s === tabbableSlot ? 0 : -1}
                                onClick={() => update({ hora: s }, 4)}
                                className={cn(
                                  'h-11 rounded-lg border text-body-sm font-body-medium tabular-nums transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                                  time === s ? 'bg-ink border-ink text-gold-light' : 'bg-white border-ink/10 hover:border-gold hover:text-gold-deep hover:-translate-y-0.5'
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Paso 4: confirmar */}
            {step === 4 && (
              <section className="flex flex-col gap-space-md">
                <h2 ref={stepHeading} tabIndex={-1} className="font-display text-[22px] font-semibold text-ink focus:outline-none">Revisa y confirma</h2>
                {/* En celular el resumen se revisa aquí, antes de confirmar */}
                <div className="lg:hidden">
                  <Summary rows={summaryRows} step={step} total={service?.price} onEdit={(s) => update({}, s)} />
                </div>
                {!session ? (
                  <PortalCard className="flex flex-col gap-space-md">
                    <p className="text-body-default">Para confirmar necesitas una cuenta. Así podrás ver, cambiar o cancelar tu cita después.</p>
                    {/* En celular este botón vive en la barra de abajo */}
                    <div className="hidden lg:flex flex-wrap gap-space-sm">
                      <Button as={Link} to={loginUrl} variant="gold" icon={LogIn}>
                        Iniciar sesión o registrarme
                      </Button>
                    </div>
                    <p className="text-body-sm text-ink/70">Tu selección se conserva: al entrar regresarás a este paso.</p>
                  </PortalCard>
                ) : profile?.role === 'banned' ? (
                  <PortalCard>
                    <EmptyState
                      icon={CircleAlert}
                      title="No puedes reservar en línea"
                      description={`Tu cuenta no tiene habilitadas las reservas en línea. Comunícate con ${business.name} para agendar tu cita.`}
                    />
                  </PortalCard>
                ) : (
                  <PortalCard className="flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-sm">
                      <Avatar name={profile?.full_name || 'Cliente'} tone="premium" />
                      <div>
                        <p className="font-body-semibold">{profile?.full_name || 'Cliente'}</p>
                        <p className="text-body-sm text-ink/70 tabular-nums">{profile?.phone || session.user.email}</p>
                      </div>
                      <Link to={`/${business.slug}/perfil`} className="ml-auto text-body-sm text-gold-deep hover:underline">Editar mis datos</Link>
                    </div>
                    <Textarea
                      label="Notas para tu barbero (opcional)"
                      placeholder="Ej. Degradado bajo, solo tijera arriba."
                      rows={3}
                      maxLength={300}
                      tone="premium"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    {/* Por qué "Confirmar" aún no está activo */}
                    {dayError ? (
                      <div role="alert" className="flex flex-wrap items-center gap-space-sm text-body-sm text-error bg-error-container rounded-lg px-3 py-2">
                        <span className="flex-1 min-w-[12rem]">No pudimos comprobar que el horario siga libre.</span>
                        <button type="button" onClick={() => setDayRetry((n) => n + 1)} className="inline-flex items-center gap-1 font-body-semibold underline underline-offset-2">
                          <RotateCw size={14} strokeWidth={1.75} aria-hidden /> Reintentar
                        </button>
                      </div>
                    ) : slotMap == null ? (
                      <p role="status" className="text-body-sm text-ink/70">Comprobando que el horario siga libre…</p>
                    ) : !assigned && (
                      <p role="alert" className="text-body-sm text-error bg-error-container rounded-lg px-3 py-2">Ese horario ya no está disponible. Elige otro.</p>
                    )}
                    {submitError && <p role="alert" className="text-body-sm text-error bg-error-container rounded-lg px-3 py-2">{submitError}</p>}
                    <Button variant="gold" onClick={confirm} loading={saving} disabled={!assigned} icon={CalendarCheck} className="max-lg:hidden justify-center h-11">
                      Confirmar reserva{service ? ` · ${formatMoneyMXN(service.price)}` : ''}
                    </Button>
                    <p className="text-body-sm text-ink/70 text-center">Sin pago por adelantado: pagas en el local al terminar.</p>
                  </PortalCard>
                )}
              </section>
            )}

            {step > 1 && (
              <button
                type="button"
                onClick={() => update({}, step - 1)}
                className="self-start inline-flex items-center gap-space-xs h-11 -ml-1 px-1 rounded text-body-medium text-ink/70 hover:text-gold-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                <ArrowLeft size={18} strokeWidth={1.75} aria-hidden /> Volver al paso anterior
              </button>
            )}
          </div>

          {/* Resumen: comprobante carbón (en celular va en la barra de abajo) */}
          <aside className="hidden lg:block lg:sticky lg:top-24">
            <Summary rows={summaryRows} step={step} total={service?.price} onEdit={(s) => update({}, s)}>
              {canContinue && (
                <Button variant="gold" iconRight={ArrowRight} className="justify-center h-11" onClick={() => update({}, step + 1)}>Continuar</Button>
              )}
            </Summary>
          </aside>
        </div>
      )}

      {!catalog.error && catalog.services.length > 0 && (
        <MobileSummaryBar
          rows={summaryRows}
          step={step}
          total={service?.price}
          onEdit={(s) => update({}, s)}
          action={mobileAction}
        />
      )}
    </div>
  )
}
