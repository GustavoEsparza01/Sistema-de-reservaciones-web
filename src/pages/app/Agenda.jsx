// Pantalla Agenda del administrador (design/stitch/02-agenda).
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  addDays, addWeeks, endOfDay, endOfWeek, format, isSameDay, isToday, parseISO, startOfDay, startOfWeek, subDays, subWeeks,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CircleAlert, Plus, RefreshCw } from 'lucide-react'
import { useAgendaData } from '../../hooks/useAgendaData'
import { updateAppointmentStatus } from '../../lib/appointments'
import { shiftFor, minutesToHHMM } from '../../lib/availability'
import { formatDate, formatDateLong, formatDuration, formatTime } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Avatar, Button, Card, EmptyState, Modal, Select, Skeleton, Switch, useToast } from '../../components/ui'
import TimeGrid from '../../components/app/agenda/TimeGrid'
import AppointmentDrawer from '../../components/app/appointments/AppointmentDrawer'
import AppointmentFormModal from '../../components/app/appointments/AppointmentFormModal'

const WEEK = { weekStartsOn: 1 }
const noDots = (s) => s.replace(/\./g, '')

function bookedMinutes(list) {
  return list.filter((a) => a.status !== 'cancelled').reduce((s, a) => s + (a.duration ?? 0), 0)
}

export default function Agenda() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()

  const view = params.get('vista') === 'semana' ? 'semana' : 'dia'
  const date = params.get('fecha') ? startOfDay(parseISO(params.get('fecha'))) : startOfDay(new Date())
  const openId = params.get('cita')

  const from = view === 'dia' ? startOfDay(date) : startOfWeek(date, WEEK)
  const to = view === 'dia' ? endOfDay(date) : endOfWeek(date, WEEK)
  const data = useAgendaData(from, to)

  const [hidden, setHidden] = useState(() => new Set()) // barberos ocultos en vista Día
  const [showCancelled, setShowCancelled] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [form, setForm] = useState(null) // { mode, appointment?, preset? }

  function updateParams(changes) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(changes)) {
          if (v === '' || v == null) next.delete(k)
          else next.set(k, String(v))
        }
        return next
      },
      { replace: true }
    )
  }
  const goTo = (d) => updateParams({ fecha: isToday(d) ? '' : format(d, 'yyyy-MM-dd') })
  const step = (dir) => goTo(view === 'dia' ? (dir > 0 ? addDays(date, 1) : subDays(date, 1)) : dir > 0 ? addWeeks(date, 1) : subWeeks(date, 1))

  const visibleAppointments = useMemo(
    () => data.appointments.filter((a) => showCancelled || a.status !== 'cancelled'),
    [data.appointments, showCancelled]
  )

  // Barbero de la vista Semana (por defecto el primero)
  const weekBarberId = params.get('barbero') && data.barbers.some((b) => b.id === params.get('barbero'))
    ? params.get('barbero')
    : data.barbers[0]?.id
  const weekBarber = data.barbers.find((b) => b.id === weekBarberId)

  const columns = useMemo(() => {
    if (view === 'dia') {
      return data.barbers
        .filter((b) => !hidden.has(b.id))
        .map((b) => {
          const mine = visibleAppointments.filter((a) => a.barberId === b.id)
          const shift = shiftFor(b.schedule, date)
          const count = mine.filter((a) => a.status !== 'cancelled').length
          return {
            key: b.id,
            barber: b,
            date,
            schedule: b.schedule,
            appointments: mine,
            header: (
              <div className="flex items-center gap-space-sm min-w-0">
                <Avatar name={b.name} size="sm" />
                <div className="min-w-0">
                  <p className="font-body-semibold text-body-sm truncate">{b.name}</p>
                  <p className="text-[11px] text-on-surface-variant tabular-nums truncate">
                    {shift ? `${minutesToHHMM(shift.start)} – ${minutesToHHMM(shift.end)}` : 'Descansa'} · {count} {count === 1 ? 'cita' : 'citas'}
                    {count > 0 && ` (${formatDuration(bookedMinutes(mine))})`}
                  </p>
                </div>
              </div>
            ),
          }
        })
    }
    if (!weekBarber) return []
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(from, i)
      const mine = visibleAppointments.filter((a) => a.barberId === weekBarber.id && isSameDay(a.start, d))
      const count = mine.filter((a) => a.status !== 'cancelled').length
      return {
        key: d.toISOString(),
        barber: weekBarber,
        date: d,
        schedule: weekBarber.schedule,
        appointments: mine,
        header: (
          <button type="button" onClick={() => updateParams({ vista: '', fecha: format(d, 'yyyy-MM-dd') })} className="text-left w-full group">
            <p className={cn('text-[11px] uppercase tracking-wide font-semibold', isToday(d) ? 'text-primary' : 'text-on-surface-variant')}>
              {noDots(format(d, 'EEE', { locale: es }))}
            </p>
            <p className={cn('font-body-semibold tabular-nums group-hover:text-primary', isToday(d) && 'text-primary')}>
              {format(d, 'd')} <span className="text-[11px] font-normal text-on-surface-variant">{count ? `· ${count} ${count === 1 ? 'cita' : 'citas'}` : ''}</span>
            </p>
          </button>
        ),
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, data.barbers, visibleAppointments, hidden, weekBarber, date.getTime()])

  const openAppointment = openId ? data.appointments.find((a) => a.id === openId) ?? null : null

  async function changeStatus(appointment, status) {
    setBusyId(appointment.id)
    try {
      await updateAppointmentStatus(appointment.id, status)
      const title = {
        accepted: 'Cita confirmada',
        completed: 'Cita completada',
        cancelled: appointment.status === 'pending' ? 'Cita rechazada' : 'Cita cancelada',
      }[status]
      toast({ title, description: `${appointment.clientName} · ${formatTime(appointment.start)} h` })
      await data.reload({ silent: true })
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo actualizar la cita', description: err.message })
    } finally {
      setBusyId(null)
    }
  }

  async function handleFormDone(result) {
    setForm(null)
    if (result.type === 'create') {
      toast({ title: 'Cita agendada', description: `${result.clientName} · ${formatDate(result.start)} ${formatTime(result.start)} h` })
    } else {
      toast({ title: 'Cita reprogramada', description: `${formatDate(result.start)} ${formatTime(result.start)} h con ${result.barberName}` })
    }
    // Ir al día de la cita para verla
    if (!isSameDay(result.start, date) && !(view === 'semana' && result.start >= from && result.start <= to)) goTo(result.start)
    else await data.reload({ silent: true })
  }

  const title =
    view === 'dia'
      ? formatDateLong(date)
      : `${noDots(format(from, 'd MMM', { locale: es }))} – ${noDots(format(to, 'd MMM yyyy', { locale: es }))}`

  const counts = Object.fromEntries(
    data.barbers.map((b) => [b.id, data.appointments.filter((a) => a.barberId === b.id && a.status !== 'cancelled').length])
  )

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Encabezado */}
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <h1 className="font-headline-page-mobile text-headline-page-mobile md:font-headline-page md:text-headline-page">Agenda</h1>
          <p className="text-body-default text-on-surface-variant first-letter:uppercase">{title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <Button variant="secondary" onClick={() => goTo(new Date())} disabled={view === 'dia' ? isToday(date) : from <= new Date() && new Date() <= to}>
            Hoy
          </Button>
          <div className="flex">
            <Button variant="secondary" size="icon" icon={ChevronLeft} aria-label={view === 'dia' ? 'Día anterior' : 'Semana anterior'} className="rounded-r-none" onClick={() => step(-1)} />
            <Button variant="secondary" size="icon" icon={ChevronRight} aria-label={view === 'dia' ? 'Día siguiente' : 'Semana siguiente'} className="rounded-l-none -ml-px" onClick={() => step(1)} />
          </div>
          <div role="group" aria-label="Vista" className="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-container-low border border-outline-variant">
            {[['dia', 'Día'], ['semana', 'Semana']].map(([v, label]) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => updateParams({ vista: v === 'dia' ? '' : v })}
                className={cn(
                  'h-8 px-3 rounded-md text-body-sm font-body-medium transition-colors',
                  view === v ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Button icon={Plus} onClick={() => setForm({ mode: 'create', preset: { date } })}>Nueva cita</Button>
        </div>
      </header>

      {data.error ? (
        <Card>
          <EmptyState
            icon={CircleAlert}
            title="No se pudo cargar la agenda"
            description={data.error.message}
            action={<Button variant="secondary" icon={RefreshCw} onClick={() => data.reload()}>Reintentar</Button>}
          />
        </Card>
      ) : (
        <Card padding={false} className="overflow-hidden">
          {/* Barberos y opciones */}
          <div className="px-5 py-3 flex flex-wrap items-center gap-space-sm border-b border-outline-variant">
            {view === 'dia' ? (
              <div className="flex flex-wrap items-center gap-1.5" aria-label="Barberos visibles">
                <span className="text-body-sm text-on-surface-variant mr-1">Barberos:</span>
                {data.loading
                  ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-8 w-28 rounded-full" />)
                  : data.barbers.map((b) => {
                      const on = !hidden.has(b.id)
                      return (
                        <button
                          key={b.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            setHidden((prev) => {
                              const next = new Set(prev)
                              next.has(b.id) ? next.delete(b.id) : next.add(b.id)
                              return next
                            })
                          }
                          className={cn(
                            'h-8 pl-1 pr-3 rounded-full border inline-flex items-center gap-1.5 text-body-sm transition-colors',
                            on ? 'border-primary bg-primary-fixed/40 text-on-surface' : 'border-outline-variant text-outline line-through'
                          )}
                        >
                          <Avatar name={b.name} size="sm" className="!w-6 !h-6 !text-[10px]" />
                          {b.name.split(' ')[0]}
                          <span className="tabular-nums text-on-surface-variant no-underline">{counts[b.id] ?? 0}</span>
                        </button>
                      )
                    })}
              </div>
            ) : (
              <Select
                aria-label="Barbero"
                className="w-56"
                value={weekBarberId ?? ''}
                onChange={(e) => updateParams({ barbero: e.target.value })}
                options={data.barbers.map((b) => ({ value: b.id, label: `${b.name} (${counts[b.id] ?? 0})` }))}
              />
            )}
            <Switch checked={showCancelled} onChange={setShowCancelled} label="Mostrar canceladas" className="ml-auto flex-row-reverse gap-space-sm" />
          </div>

          {data.loading ? (
            <div className="p-5 flex flex-col gap-space-sm">
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : columns.length === 0 ? (
            <EmptyState
              title={data.barbers.length === 0 ? 'No hay barberos activos' : 'Ningún barbero seleccionado'}
              description={data.barbers.length === 0 ? 'Activa barberos en Equipo para ver su agenda.' : 'Elige al menos un barbero arriba.'}
            />
          ) : (
            <div className="max-h-[calc(100vh-280px)] min-h-[420px] overflow-y-auto">
              <TimeGrid
                columns={columns}
                minColumnWidth={view === 'dia' ? 200 : 130}
                onOpen={(a) => updateParams({ cita: a.id })}
                onSlotClick={(col, time) => setForm({ mode: 'create', preset: { barberId: col.barber.id, date: col.date, time } })}
              />
            </div>
          )}
        </Card>
      )}

      <p className="text-body-sm text-on-surface-variant">
        Haz clic en un hueco libre dentro del turno para agendar una cita, o en una cita para ver su detalle.
      </p>

      <AppointmentDrawer
        appointment={openAppointment}
        onClose={() => updateParams({ cita: '' })}
        busy={busyId === openAppointment?.id}
        onChangeStatus={changeStatus}
        onRequestCancel={setCancelTarget}
        onReschedule={(a) => setForm({ mode: 'reschedule', appointment: a })}
      />

      <AppointmentFormModal
        open={!!form}
        mode={form?.mode}
        appointment={form?.appointment}
        preset={form?.preset}
        onClose={() => setForm(null)}
        onDone={handleFormDone}
      />

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        size="sm"
        title={cancelTarget?.status === 'pending' ? '¿Rechazar la cita?' : '¿Cancelar la cita?'}
        description={cancelTarget ? `${cancelTarget.clientName} · ${formatDate(cancelTarget.start)} a las ${formatTime(cancelTarget.start)}. El horario quedará libre.` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>Volver</Button>
            <Button
              variant="danger"
              onClick={() => {
                const t = cancelTarget
                setCancelTarget(null)
                changeStatus(t, 'cancelled')
              }}
            >
              {cancelTarget?.status === 'pending' ? 'Rechazar cita' : 'Cancelar cita'}
            </Button>
          </>
        }
      />
    </div>
  )
}
