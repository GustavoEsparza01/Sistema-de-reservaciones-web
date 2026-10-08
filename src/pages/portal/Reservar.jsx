// Flujo de reserva del cliente (design/stitch/11-reserva): servicio → barbero → fecha y hora → confirmar.
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { addDays, format, isToday, parseISO, startOfDay, endOfDay, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ArrowLeft, ArrowRight, CalendarCheck, CalendarDays, CalendarPlus, Check, CircleAlert, Clock, LogIn, MapPin,
  Scissors, Sparkles, Sun, Sunset, Timer, User,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useBusiness } from '../../hooks/useBusiness'
import { supabase } from '../../lib/supabaseClient'
import { fetchPublicBarbers, fetchPublicServices } from '../../lib/publicData'
import { createAppointment, normalizeAppointment } from '../../lib/appointments'
import { availableSlots, shiftFor, toMinutes } from '../../lib/availability'
import { formatDateLong, formatDuration, formatMoneyMXN } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Avatar, Button, Card, EmptyState, Skeleton, Spinner, Textarea, useToast } from '../../components/ui'

const ANY = 'cualquiera'
const DAYS_AHEAD = 30
const STEPS = ['Servicio', 'Barbero', 'Fecha y hora', 'Confirmar']
const noDots = (s) => s.replace(/\./g, '')

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

function Stepper({ step }) {
  return (
    <ol className="grid grid-cols-4 gap-space-xs" aria-label="Pasos de la reserva">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < step
        const current = n === step
        return (
          <li key={label} className="flex flex-col gap-1.5" aria-current={current ? 'step' : undefined}>
            <div className={cn('h-1 rounded-full', done || current ? 'bg-primary' : 'bg-surface-container-high')} />
            <span className={cn('text-[12px] font-body-medium flex items-center gap-1', current ? 'text-primary' : done ? 'text-on-surface' : 'text-outline')}>
              {done && <Check size={12} strokeWidth={2.5} aria-hidden />}
              <span className="hidden sm:inline">Paso {n} · </span>{label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Choice({ selected, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'w-full text-left rounded-lg border p-space-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        selected ? 'border-primary bg-primary-fixed/30 ring-1 ring-primary' : 'border-outline-variant bg-surface-container-lowest hover:border-primary',
        className
      )}
    >
      {children}
    </button>
  )
}

function googleCalendarLink({ title, start, end, location }) {
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const p = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${fmt(start)}/${fmt(end)}`, location })
  return `https://calendar.google.com/calendar/render?${p}`
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

  useEffect(() => {
    let alive = true
    Promise.all([fetchPublicServices(), fetchPublicBarbers()])
      .then(([services, barbers]) => alive && setCatalog({ services, barbers, loading: false, error: null }))
      .catch((error) => alive && setCatalog((c) => ({ ...c, loading: false, error })))
    return () => { alive = false }
  }, [])

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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Citas del día elegido para calcular horarios libres
  useEffect(() => {
    if (!date) return
    let alive = true
    setDayAppointments(null)
    fetchDayAppointments(date).then((r) => alive && setDayAppointments(r)).catch(() => alive && setDayAppointments([]))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get('fecha')])

  const candidates = barber ? [barber] : catalog.barbers

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
  const worksOn = (d) => candidates.some((b) => shiftFor(b.schedule, d))

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
        setDayAppointments(await fetchDayAppointments(date).catch(() => []))
      }
      toast({ tone: 'error', title: 'No se pudo reservar', description: taken ? 'El horario ya no está disponible.' : err.message })
    } finally {
      setSaving(false)
    }
  }

  // ── Reserva registrada ───────────────────────────────────────
  if (booked) {
    return (
      <div className="max-w-[640px] mx-auto px-margin-mobile md:px-margin py-space-xl">
        <Card className="flex flex-col items-center text-center gap-space-md p-space-xl">
          <span className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CalendarCheck size={28} strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-emerald-700">Solicitud enviada</p>
            <h1 className="font-headline-page text-headline-page mt-1">¡Tu cita quedó registrada!</h1>
            <p className="text-body-default text-on-surface-variant mt-space-xs">
              La barbería la revisará y la verás como <span className="font-body-medium text-on-surface">Confirmada</span> en "Mis citas".
            </p>
          </div>
          <dl className="w-full text-left rounded-lg border border-outline-variant divide-y divide-outline-variant">
            {[
              ['Folio', `#${booked.id.slice(0, 8).toUpperCase()}`],
              ['Servicio', `${booked.service.name} · ${formatMoneyMXN(booked.service.price)}`],
              ['Fecha', formatDateLong(booked.start)],
              ['Hora', `${format(booked.start, 'HH:mm')} – ${format(booked.end, 'HH:mm')} h`],
              ['Barbero', booked.barber.name],
              ['Lugar', `${business.name}, ${business.city}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-space-md px-space-md py-2.5 text-body-sm">
                <dt className="text-on-surface-variant">{k}</dt>
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
              variant="secondary"
              icon={CalendarPlus}
              className="justify-center"
            >
              Agregar a Google Calendar
            </Button>
            <Button as={Link} to="/my-appointments" icon={CalendarDays} className="justify-center">Ver mis citas</Button>
          </div>
          <Link to={`/${business.slug}`} className="text-body-sm text-primary hover:underline">Volver a la página principal</Link>
        </Card>
      </div>
    )
  }

  const morning = slotMap ? [...slotMap.keys()].filter((s) => toMinutes(s) < 14 * 60) : []
  const afternoon = slotMap ? [...slotMap.keys()].filter((s) => toMinutes(s) >= 14 * 60) : []

  return (
    <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-space-lg">
      <header className="flex flex-col gap-space-md">
        <div>
          <h1 className="font-headline-page-mobile text-headline-page-mobile md:font-headline-page md:text-headline-page">Reservar cita</h1>
          <p className="text-body-default text-on-surface-variant">{business.name} · {business.city}</p>
        </div>
        <Stepper step={step} />
      </header>

      {catalog.error ? (
        <Card><EmptyState icon={CircleAlert} title="No se pudo cargar la información" description="Revisa tu conexión y recarga la página." /></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-gutter items-start">
          <div className="flex flex-col gap-space-lg min-w-0">
            {/* Paso 1: servicio */}
            {step === 1 && (
              <section className="flex flex-col gap-space-md">
                <h2 className="font-headline-section text-headline-section">1. Selecciona tu servicio</h2>
                {catalog.loading ? (
                  [0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
                ) : (
                  <div className="grid gap-space-sm">
                    {catalog.services.map((s) => (
                      <Choice key={s.id} selected={service?.id === s.id} onClick={() => update({ servicio: s.id, hora: '' }, 2)}>
                        <div className="flex items-start justify-between gap-space-md">
                          <div className="min-w-0">
                            <p className="font-body-semibold">{s.name}</p>
                            <p className="flex items-center gap-1 text-body-sm text-on-surface-variant mt-0.5"><Timer size={14} strokeWidth={1.75} aria-hidden /> {formatDuration(s.duration)}</p>
                            {s.description && <p className="text-body-sm text-on-surface-variant mt-1">{s.description}</p>}
                          </div>
                          <span className="font-body-semibold tabular-nums whitespace-nowrap">{formatMoneyMXN(s.price)}</span>
                        </div>
                      </Choice>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Paso 2: barbero */}
            {step === 2 && (
              <section className="flex flex-col gap-space-md">
                <h2 className="font-headline-section text-headline-section">2. Elige a tu barbero</h2>
                <div className="grid sm:grid-cols-2 gap-space-sm">
                  <Choice selected={barberParam === ANY} onClick={() => update({ barbero: ANY, hora: '' }, 3)}>
                    <div className="flex items-center gap-space-sm">
                      <span className="w-12 h-12 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0"><Sparkles size={22} strokeWidth={1.75} aria-hidden /></span>
                      <div>
                        <p className="font-body-semibold">Cualquier barbero</p>
                        <p className="text-body-sm text-on-surface-variant">Te asignamos al primero disponible</p>
                      </div>
                    </div>
                  </Choice>
                  {catalog.barbers.map((b) => (
                    <Choice key={b.id} selected={barber?.id === b.id} onClick={() => update({ barbero: b.id, hora: '' }, 3)}>
                      <div className="flex items-center gap-space-sm">
                        <Avatar name={b.name} size="lg" />
                        <div className="min-w-0">
                          <p className="font-body-semibold truncate">{b.name}</p>
                          {b.bio && <p className="text-body-sm text-on-surface-variant line-clamp-2">{b.bio}</p>}
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
                <h2 className="font-headline-section text-headline-section">3. Selecciona fecha y hora</h2>
                <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" role="radiogroup" aria-label="Fecha">
                  {days.map((d) => {
                    const available = worksOn(d)
                    const selected = date && d.getTime() === date.getTime()
                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        role="radio"
                        aria-checked={!!selected}
                        disabled={!available}
                        onClick={() => update({ fecha: format(d, 'yyyy-MM-dd'), hora: '' })}
                        className={cn(
                          'shrink-0 w-16 rounded-lg border py-2 flex flex-col items-center gap-0.5 transition-colors',
                          selected ? 'bg-primary border-primary text-on-primary' : 'bg-surface-container-lowest border-outline-variant hover:border-primary',
                          !available && 'opacity-40 cursor-not-allowed hover:border-outline-variant'
                        )}
                      >
                        <span className={cn('text-[11px] uppercase font-semibold', selected ? 'text-on-primary/80' : 'text-on-surface-variant')}>
                          {isToday(d) ? 'Hoy' : isTomorrow(d) ? 'Mañ.' : noDots(format(d, 'EEE', { locale: es }))}
                        </span>
                        <span className="font-body-semibold tabular-nums">{format(d, 'd')}</span>
                        <span className={cn('text-[11px]', selected ? 'text-on-primary/80' : 'text-on-surface-variant')}>{noDots(format(d, 'MMM', { locale: es }))}</span>
                      </button>
                    )
                  })}
                </div>

                {!date ? (
                  <p className="text-body-sm text-on-surface-variant">Elige un día para ver los horarios disponibles.</p>
                ) : slotMap == null ? (
                  <div className="py-space-lg flex justify-center text-on-surface-variant"><Spinner /></div>
                ) : slotMap.size === 0 ? (
                  <Card>
                    <EmptyState
                      icon={Clock}
                      title="No quedan horarios este día"
                      description={barber ? `Prueba otro día o elige "Cualquier barbero".` : 'Prueba con otro día.'}
                    />
                  </Card>
                ) : (
                  <div className="flex flex-col gap-space-md" role="radiogroup" aria-label="Hora">
                    {[['Mañana', Sun, morning], ['Tarde', Sunset, afternoon]].map(([label, Icon, list]) =>
                      list.length ? (
                        <div key={label} className="flex flex-col gap-space-sm">
                          <p className="flex items-center gap-1.5 text-body-sm font-body-semibold text-on-surface-variant"><Icon size={16} strokeWidth={1.75} aria-hidden /> {label}</p>
                          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-1.5">
                            {list.map((s) => (
                              <button
                                key={s}
                                type="button"
                                role="radio"
                                aria-checked={time === s}
                                onClick={() => update({ hora: s }, 4)}
                                className={cn(
                                  'h-10 rounded-lg border text-body-sm font-body-medium tabular-nums transition-colors',
                                  time === s ? 'bg-primary border-primary text-on-primary' : 'bg-surface-container-lowest border-outline-variant hover:border-primary hover:text-primary'
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
                <h2 className="font-headline-section text-headline-section">4. Revisa y confirma tu cita</h2>
                {!session ? (
                  <Card className="flex flex-col gap-space-md">
                    <p className="text-body-default">Para confirmar necesitas una cuenta. Así podrás ver, cambiar o cancelar tu cita después.</p>
                    <div className="flex flex-wrap gap-space-sm">
                      <Button as={Link} to={`/login?volver=${encodeURIComponent(location.pathname + location.search)}`} icon={LogIn}>
                        Iniciar sesión o registrarme
                      </Button>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">Tu selección se conserva: al entrar regresarás a este paso.</p>
                  </Card>
                ) : (
                  <Card className="flex flex-col gap-space-md">
                    <div className="flex items-center gap-space-sm">
                      <Avatar name={profile?.full_name || 'Cliente'} />
                      <div>
                        <p className="font-body-semibold">{profile?.full_name || 'Cliente'}</p>
                        <p className="text-body-sm text-on-surface-variant tabular-nums">{profile?.phone || session.user.email}</p>
                      </div>
                      <Link to="/profile" className="ml-auto text-body-sm text-primary hover:underline">Editar mis datos</Link>
                    </div>
                    <Textarea
                      label="Notas para tu barbero (opcional)"
                      placeholder="Ej. Degradado bajo, solo tijera arriba."
                      rows={3}
                      maxLength={300}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    {!assigned && slotMap && (
                      <p role="alert" className="text-body-sm text-error bg-error-container rounded-lg px-3 py-2">Ese horario ya no está disponible. Elige otro.</p>
                    )}
                    {submitError && <p role="alert" className="text-body-sm text-error bg-error-container rounded-lg px-3 py-2">{submitError}</p>}
                    <Button onClick={confirm} loading={saving} disabled={!assigned || notes.length > 300} icon={CalendarCheck} className="justify-center h-11">
                      Confirmar reserva{service ? ` · ${formatMoneyMXN(service.price)}` : ''}
                    </Button>
                    <p className="text-body-sm text-on-surface-variant text-center">Sin pago por adelantado: pagas en el local al terminar.</p>
                  </Card>
                )}
              </section>
            )}

            {step > 1 && (
              <Button variant="ghost" icon={ArrowLeft} className="self-start" onClick={() => update({}, step - 1)}>
                Volver al paso anterior
              </Button>
            )}
          </div>

          {/* Resumen */}
          <aside className="lg:sticky lg:top-24">
            <Card className="flex flex-col gap-space-md">
              <h2 className="font-headline-section text-headline-section">Resumen de tu cita</h2>
              <dl className="flex flex-col gap-space-sm text-body-sm">
                {[
                  [Scissors, 'Servicio', service ? `${service.name} · ${formatDuration(service.duration)}` : null, 1],
                  [User, 'Barbero', barberParam === ANY ? (assigned ? `${assigned.name} (asignado)` : 'Cualquier barbero') : barber?.name, 2],
                  [CalendarDays, 'Fecha', date ? formatDateLong(date) : null, 3],
                  [Clock, 'Hora', time ? `${time} h` : null, 3],
                  [MapPin, 'Lugar', `${business.name}, ${business.city}`, null],
                ].map(([Icon, label, value, editStep]) => (
                  <div key={label} className="flex gap-space-sm">
                    <Icon size={16} strokeWidth={1.75} className="text-on-surface-variant mt-0.5 shrink-0" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <dt className="text-on-surface-variant">{label}</dt>
                      <dd className={cn('first-letter:uppercase', value ? 'text-on-surface font-body-medium' : 'text-outline')}>{value ?? 'Por elegir'}</dd>
                    </div>
                    {value && editStep && editStep < step && (
                      <button type="button" onClick={() => update({}, editStep)} className="text-primary text-[12px] hover:underline self-start">Cambiar</button>
                    )}
                  </div>
                ))}
              </dl>
              <div className="border-t border-outline-variant pt-space-md flex items-baseline justify-between">
                <span className="text-body-sm text-on-surface-variant">Total a pagar en el local</span>
                <span className="font-headline-section text-headline-section tabular-nums">{service ? formatMoneyMXN(service.price) : '—'}</span>
              </div>
              {step < 4 && step < maxStep && (
                <Button variant="secondary" iconRight={ArrowRight} className="justify-center" onClick={() => update({}, step + 1)}>Continuar</Button>
              )}
            </Card>
          </aside>
        </div>
      )}
    </div>
  )
}
