// Pantalla Mi agenda del barbero (design/stitch/09-mi-agenda-barbero).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  addDays, endOfWeek, format, isSameDay, isToday, parseISO, startOfDay, startOfWeek, subDays,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Banknote, Check, CheckCheck, ChevronLeft, ChevronRight, CircleAlert, CircleCheckBig, Clock, MessageCircle,
  NotebookPen, Pencil, Phone, RefreshCw, StickyNote, X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import {
  APPOINTMENT_SELECT, completeWithNote, normalizeAppointment, splitNotes, telLink, updateAppointmentStatus, whatsappLink,
} from '../../lib/appointments'
import { shiftFor, minutesToHHMM } from '../../lib/availability'
import { BIO_MAX } from '../../lib/team'
import { formatDate, formatDateLong, formatDuration, formatMoney, formatMoneyMXN, formatTime } from '../../lib/format'
import { cn } from '../../lib/cn'
import {
  Button, Card, EmptyState, KpiCard, Modal, Skeleton, StatusBadge, Textarea, useToast,
} from '../../components/ui'

const WEEK = { weekStartsOn: 1 }
const noDots = (s) => s.replace(/\./g, '')

/** Citas del barbero en la semana visible, su horario y su biografía. */
function useMiAgendaData(barberId, date) {
  const [state, setState] = useState({ appointments: [], schedule: {}, bio: '', loading: true, error: null })
  const requestId = useRef(0)
  const weekStart = startOfWeek(date, WEEK)
  const key = `${barberId}|${weekStart.toISOString()}`

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!barberId) return
    const id = ++requestId.current
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
    const [appts, barber] = await Promise.all([
      supabase
        .from('appointments')
        .select(APPOINTMENT_SELECT)
        .eq('barber_id', barberId)
        .gte('scheduled_at', weekStart.toISOString())
        .lte('scheduled_at', endOfWeek(date, WEEK).toISOString())
        .order('scheduled_at'),
      supabase.from('barbers').select('schedule, bio').eq('id', barberId).maybeSingle(),
    ])
    if (id !== requestId.current) return
    const error = appts.error || barber.error
    if (error) {
      console.error('Mi agenda:', error)
      setState((s) => ({ ...s, loading: false, error }))
      return
    }
    setState({
      appointments: appts.data.map(normalizeAppointment),
      schedule: barber.data?.schedule ?? {},
      bio: barber.data?.bio ?? '',
      loading: false,
      error: null,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])
  return now
}

function AppointmentCard({ a, now, busy, onAccept, onReject, onComplete }) {
  const end = a.end ?? new Date(a.start.getTime() + (a.duration ?? 30) * 60000)
  const inProgress = a.status === 'accepted' && now >= a.start && now < end
  const elapsed = inProgress ? Math.round((now - a.start) / 60000) : 0
  const notes = splitNotes(a.notes)
  const tel = telLink(a.clientPhone)
  const wa = whatsappLink(a.clientPhone)
  const past = a.status === 'completed' || a.status === 'cancelled'

  return (
    <li className="grid grid-cols-[56px_1fr] gap-space-md">
      <div className="pt-4 text-right tabular-nums">
        <p className={cn('font-body-semibold text-body-sm', past ? 'text-outline' : 'text-on-surface')}>{formatTime(a.start)}</p>
        <p className="text-[12px] text-on-surface-variant">{formatTime(end)}</p>
      </div>
      <Card
        className={cn(
          'flex flex-col gap-space-sm',
          inProgress && 'border-primary ring-1 ring-primary',
          a.status === 'cancelled' && 'opacity-60'
        )}
      >
        {inProgress && (
          <div className="flex items-center justify-between gap-space-sm -mt-1">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-primary">En atención</span>
            <span className="text-[12px] tabular-nums text-on-surface-variant">{elapsed} de {a.duration ?? '—'} min</span>
          </div>
        )}
        <div className="flex flex-wrap items-start justify-between gap-space-sm">
          <div className="min-w-0">
            <p className="font-body-semibold text-on-surface">{a.clientName}</p>
            <p className="text-body-sm text-on-surface-variant">
              {a.serviceName} · {formatDuration(a.duration)} · <span className="tabular-nums">{formatMoneyMXN(a.price)}</span>
            </p>
          </div>
          <StatusBadge status={a.status} />
        </div>

        {(tel || wa) && !past && (
          <div className="flex flex-wrap gap-space-xs">
            {tel && <Button as="a" href={tel} size="sm" variant="ghost" icon={Phone} className="-ml-2">{a.clientPhone}</Button>}
            {wa && <Button as="a" href={wa} target="_blank" rel="noreferrer" size="sm" variant="ghost" icon={MessageCircle}>WhatsApp</Button>}
          </div>
        )}

        {notes.client && (
          <p className="flex gap-space-xs text-body-sm bg-amber-50 text-amber-900 rounded-lg px-3 py-2">
            <StickyNote size={16} strokeWidth={1.75} className="shrink-0 mt-0.5" aria-hidden />
            <span><span className="font-body-medium">Del cliente:</span> {notes.client}</span>
          </p>
        )}
        {notes.barber && (
          <p className="flex gap-space-xs text-body-sm bg-surface-container-low text-on-surface rounded-lg px-3 py-2">
            <NotebookPen size={16} strokeWidth={1.75} className="shrink-0 mt-0.5" aria-hidden />
            <span><span className="font-body-medium">Tu nota:</span> {notes.barber}</span>
          </p>
        )}

        {a.status === 'pending' && (
          <div className="flex flex-wrap gap-space-sm pt-space-xs">
            <Button size="sm" icon={Check} loading={busy} onClick={() => onAccept(a)}>Aceptar cita</Button>
            <Button size="sm" variant="ghost" icon={X} disabled={busy} onClick={() => onReject(a)}>Rechazar</Button>
          </div>
        )}
        {a.status === 'accepted' && (
          <div className="flex flex-wrap gap-space-sm pt-space-xs">
            <Button size="sm" icon={CheckCheck} disabled={busy} onClick={() => onComplete(a)}>Marcar como completada</Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => onReject(a)}>Cancelar</Button>
          </div>
        )}
      </Card>
    </li>
  )
}

export default function MiAgenda() {
  const { barberId, profile } = useAuth()
  const toast = useToast()
  const now = useNow()
  const [params, setParams] = useSearchParams()
  const date = params.get('fecha') ? startOfDay(parseISO(params.get('fecha'))) : startOfDay(new Date())
  const data = useMiAgendaData(barberId, date)

  const [busyId, setBusyId] = useState(null)
  const [completing, setCompleting] = useState(null)
  const [note, setNote] = useState('')
  const [rejecting, setRejecting] = useState(null)
  const [editingBio, setEditingBio] = useState(false)
  const [bio, setBio] = useState('')
  const [savingBio, setSavingBio] = useState(false)

  const goTo = (d) => setParams(isToday(d) ? {} : { fecha: format(d, 'yyyy-MM-dd') }, { replace: true })

  const day = useMemo(() => data.appointments.filter((a) => isSameDay(a.start, date)), [data.appointments, date])
  const visible = day.filter((a) => a.status !== 'cancelled')
  const cancelledCount = day.length - visible.length
  const shift = shiftFor(data.schedule, date)
  const completed = day.filter((a) => a.status === 'completed')
  const remaining = day.filter(
    (a) => (a.status === 'pending' || a.status === 'accepted') && (!isToday(date) || (a.end ?? a.start) > now)
  )
  const revenue = completed.reduce((s, a) => s + a.price, 0)

  async function run(a, fn, title) {
    setBusyId(a.id)
    try {
      await fn()
      toast({ title, description: `${a.clientName} · ${formatTime(a.start)} h` })
      await data.reload({ silent: true })
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo actualizar la cita', description: err.message })
    } finally {
      setBusyId(null)
    }
  }

  const accept = (a) => run(a, () => updateAppointmentStatus(a.id, 'accepted'), 'Cita aceptada')
  async function confirmReject() {
    const a = rejecting
    setRejecting(null)
    await run(a, () => updateAppointmentStatus(a.id, 'cancelled'), a.status === 'pending' ? 'Cita rechazada' : 'Cita cancelada')
  }
  function openComplete(a) {
    setNote(splitNotes(a.notes).barber)
    setCompleting(a)
  }
  async function confirmComplete() {
    const a = completing
    setCompleting(null)
    await run(a, () => completeWithNote(a, note), 'Cita completada')
  }

  async function saveBio() {
    setSavingBio(true)
    const { error } = await supabase.from('barbers').update({ bio: bio.trim() || null }).eq('id', barberId)
    setSavingBio(false)
    if (error) {
      toast({ tone: 'error', title: 'No se pudo guardar tu biografía', description: error.message })
      return
    }
    setEditingBio(false)
    toast({ title: 'Biografía actualizada' })
    await data.reload({ silent: true })
  }

  if (!barberId) {
    return (
      <Card>
        <EmptyState
          icon={CircleAlert}
          title="Tu cuenta no está registrada como barbero"
          description="Pide al administrador que te agregue en Equipo para ver tu agenda."
        />
      </Card>
    )
  }

  const weekStart = startOfWeek(date, WEEK)

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Encabezado */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <h1 className="font-headline-page-mobile text-headline-page-mobile md:font-headline-page md:text-headline-page">Mi agenda</h1>
          <p className="text-body-default text-on-surface-variant first-letter:uppercase">
            {formatDateLong(date)}
            {!data.loading && (shift ? ` · turno ${minutesToHHMM(shift.start)} – ${minutesToHHMM(shift.end)}` : ' · descanso')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <Button variant="secondary" disabled={isToday(date)} onClick={() => goTo(new Date())}>Hoy</Button>
          <div className="flex">
            <Button variant="secondary" size="icon" icon={ChevronLeft} aria-label="Día anterior" className="rounded-r-none" onClick={() => goTo(subDays(date, 1))} />
            <Button variant="secondary" size="icon" icon={ChevronRight} aria-label="Día siguiente" className="rounded-l-none -ml-px" onClick={() => goTo(addDays(date, 1))} />
          </div>
          <Button
            variant="ghost"
            icon={Pencil}
            onClick={() => {
              setBio(data.bio)
              setEditingBio(true)
            }}
          >
            Mi perfil público
          </Button>
        </div>
      </header>

      {/* Semana */}
      <div className="grid grid-cols-7 gap-1.5" role="tablist" aria-label="Días de la semana">
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(weekStart, i)
          const count = data.appointments.filter((a) => isSameDay(a.start, d) && a.status !== 'cancelled').length
          const selected = isSameDay(d, date)
          const off = !shiftFor(data.schedule, d)
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => goTo(d)}
              className={cn(
                'rounded-lg border py-2 flex flex-col items-center gap-0.5 transition-colors',
                selected ? 'bg-primary border-primary text-on-primary' : 'bg-surface-container-lowest border-outline-variant hover:border-primary'
              )}
            >
              <span className={cn('text-[11px] uppercase font-semibold tracking-wide', selected ? 'text-on-primary/80' : isToday(d) ? 'text-primary' : 'text-on-surface-variant')}>
                {noDots(format(d, 'EEE', { locale: es }))}
              </span>
              <span className="font-body-semibold tabular-nums">{format(d, 'd')}</span>
              <span className={cn('text-[11px] tabular-nums', selected ? 'text-on-primary/80' : 'text-on-surface-variant')}>
                {data.loading ? ' ' : off ? 'Libre' : count ? `${count} ${count === 1 ? 'cita' : 'citas'}` : '—'}
              </span>
            </button>
          )
        })}
      </div>

      {data.error ? (
        <Card>
          <EmptyState
            icon={CircleAlert}
            title="No se pudo cargar tu agenda"
            description={data.error.message}
            action={<Button variant="secondary" icon={RefreshCw} onClick={() => data.reload()}>Reintentar</Button>}
          />
        </Card>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter" aria-label="Resumen del día">
            <KpiCard label={isToday(date) ? 'Citas restantes hoy' : 'Citas por atender'} value={remaining.length} unit={`de ${visible.length}`} icon={Clock} loading={data.loading} />
            <KpiCard label="Completadas" value={completed.length} unit={completed.length === 1 ? 'cita' : 'citas'} icon={CircleCheckBig} loading={data.loading} />
            <KpiCard label="Ingresos generados" value={formatMoney(revenue)} unit="MXN" icon={Banknote} loading={data.loading}>
              {!data.loading && <p className="text-body-sm text-on-surface-variant">De citas completadas</p>}
            </KpiCard>
          </section>

          <section aria-label="Citas del día" className="flex flex-col gap-space-sm">
            {data.loading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)
            ) : visible.length === 0 ? (
              <Card>
                <EmptyState
                  icon={CircleCheckBig}
                  title={shift ? 'Sin citas este día' : 'Día de descanso'}
                  description={shift ? 'Cuando un cliente reserve contigo, la cita aparecerá aquí.' : 'No tienes turno este día.'}
                />
              </Card>
            ) : (
              <ol className="flex flex-col gap-space-sm">
                {visible.map((a) => (
                  <AppointmentCard key={a.id} a={a} now={now} busy={busyId === a.id} onAccept={accept} onReject={setRejecting} onComplete={openComplete} />
                ))}
              </ol>
            )}
            {!data.loading && cancelledCount > 0 && (
              <p className="text-body-sm text-on-surface-variant pl-[72px]">
                {cancelledCount} {cancelledCount === 1 ? 'cita cancelada' : 'citas canceladas'} este día no se muestra{cancelledCount === 1 ? '' : 'n'}.
              </p>
            )}
          </section>
        </>
      )}

      {/* Completar con nota */}
      <Modal
        open={!!completing}
        onClose={() => setCompleting(null)}
        title={completing ? `Completar cita · ${completing.clientName}` : ''}
        description={completing ? `${completing.serviceName} · ${formatMoneyMXN(completing.price)}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCompleting(null)}>Cancelar</Button>
            <Button icon={CheckCheck} onClick={confirmComplete}>Completar y guardar</Button>
          </>
        }
      >
        <Textarea
          label="Nota del corte (opcional)"
          hint="Quedará guardada en la cita para la próxima visita del cliente. La nota del cliente no se borra."
          placeholder="Ej. Desvanecido medio, máquina 1.5 en los lados, tijera arriba."
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
        />
      </Modal>

      {/* Rechazar o cancelar */}
      <Modal
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        size="sm"
        title={rejecting?.status === 'pending' ? '¿Rechazar la cita?' : '¿Cancelar la cita?'}
        description={rejecting ? `${rejecting.clientName} · ${formatDate(rejecting.start)} a las ${formatTime(rejecting.start)}. El horario quedará libre.` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejecting(null)}>Volver</Button>
            <Button variant="danger" onClick={confirmReject}>{rejecting?.status === 'pending' ? 'Rechazar cita' : 'Cancelar cita'}</Button>
          </>
        }
      />

      {/* Biografía pública */}
      <Modal
        open={editingBio}
        onClose={() => !savingBio && setEditingBio(false)}
        title="Mi perfil público"
        description={`Los clientes verán esto al elegir barbero${profile?.full_name ? `, junto a tu nombre (${profile.full_name})` : ''}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingBio(false)} disabled={savingBio}>Cancelar</Button>
            <Button loading={savingBio} disabled={bio.length > BIO_MAX} onClick={saveBio}>Guardar</Button>
          </>
        }
      >
        <Textarea
          label="Biografía"
          placeholder="Especialidades, experiencia, estilo de trabajo…"
          rows={5}
          maxLength={BIO_MAX}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          error={bio.length > BIO_MAX ? `Máximo ${BIO_MAX} caracteres.` : undefined}
          autoFocus
        />
      </Modal>
    </div>
  )
}
