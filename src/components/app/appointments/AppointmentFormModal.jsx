import { useEffect, useId, useMemo, useState } from 'react'
import { format, parseISO, startOfDay } from 'date-fns'
import { Search, X } from 'lucide-react'
import { supabase } from '../../../lib/supabaseClient'
import {
  createAppointment, fetchBarberDay, rescheduleAppointment, searchClients,
} from '../../../lib/appointments'
import { availableSlots, shiftFor, minutesToHHMM } from '../../../lib/availability'
import { formatDateLong, formatDuration, formatMoneyMXN, formatTime } from '../../../lib/format'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { cn } from '../../../lib/cn'
import { Avatar, Button, Input, Modal, Select, Spinner, Switch, Textarea } from '../../ui'

const one = (v) => (Array.isArray(v) ? v[0] : v)
const toDateInput = (d) => format(d, 'yyyy-MM-dd')

/** Servicios y barberos activos para el formulario. */
function useBookingOptions(open) {
  const [options, setOptions] = useState(null)
  useEffect(() => {
    if (!open) return
    let alive = true
    Promise.all([
      supabase.from('services').select('id, name, price, duration_min').eq('is_active', true).order('name'),
      supabase.from('barbers').select('id, schedule, profiles ( full_name )').eq('is_active', true),
    ]).then(([s, b]) => {
      if (!alive) return
      setOptions({
        services: (s.data ?? []).map((x) => ({ id: x.id, name: x.name, price: Number(x.price) || 0, duration: x.duration_min || 30 })),
        barbers: (b.data ?? [])
          .map((x) => ({ id: x.id, name: one(x.profiles)?.full_name ?? 'Barbero', schedule: x.schedule ?? {} }))
          .sort((x, y) => x.name.localeCompare(y.name, 'es')),
      })
    })
    return () => { alive = false }
  }, [open])
  return options
}

/** Buscador de clientes registrados. */
function ClientPicker({ value, onChange, error }) {
  const [text, setText] = useState('')
  const [results, setResults] = useState(null)
  const debounced = useDebouncedValue(text, 300)

  useEffect(() => {
    if (value) return
    let alive = true
    setResults(null)
    searchClients(debounced).then((r) => alive && setResults(r)).catch(() => alive && setResults([]))
    return () => { alive = false }
  }, [debounced, value])

  if (value) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="font-body-semibold text-body-sm">Cliente</span>
        <div className="flex items-center gap-space-sm p-2 rounded-lg border border-outline-variant">
          <Avatar name={value.full_name ?? '?'} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="font-body-medium text-body-sm truncate">{value.full_name}</p>
            {value.phone && <p className="text-[12px] text-on-surface-variant tabular-nums">{value.phone}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" icon={X} aria-label="Cambiar cliente" onClick={() => onChange(null)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Input
        label="Cliente"
        required
        icon={Search}
        placeholder="Buscar por nombre o teléfono"
        value={text}
        onChange={(e) => setText(e.target.value)}
        error={error}
        autoFocus
      />
      <ul className="max-h-40 overflow-y-auto rounded-lg border border-outline-variant divide-y divide-outline-variant" aria-label="Clientes encontrados">
        {results == null ? (
          <li className="p-3 flex justify-center text-on-surface-variant"><Spinner size={16} /></li>
        ) : results.length === 0 ? (
          <li className="p-3 text-body-sm text-on-surface-variant">
            No hay clientes con ese nombre. La persona debe registrarse primero en la página de reservas.
          </li>
        ) : (
          results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onChange(c)}
                className="w-full flex items-center gap-space-sm px-3 py-2 text-left hover:bg-surface-container-low"
              >
                <Avatar name={c.full_name ?? '?'} size="sm" />
                <span className="min-w-0 flex-1 truncate text-body-sm">{c.full_name ?? 'Sin nombre'}</span>
                {c.phone && <span className="text-[12px] text-on-surface-variant tabular-nums">{c.phone}</span>}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

/**
 * Crear una cita (mode="create") o reprogramar/reasignar una existente (mode="reschedule").
 * - preset: { barberId, date (Date), time ("HH:MM") } para precargar al crear desde la agenda
 * - appointment: la cita a reprogramar
 */
export default function AppointmentFormModal({ open, mode = 'create', appointment, preset, onClose, onDone }) {
  const formId = useId()
  const options = useBookingOptions(open)
  const isReschedule = mode === 'reschedule'

  const [client, setClient] = useState(null)
  const [serviceId, setServiceId] = useState('')
  const [barberId, setBarberId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [confirmed, setConfirmed] = useState(true)
  const [busyDay, setBusyDay] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Valores iniciales al abrir
  useEffect(() => {
    if (!open) return
    setErrors({})
    setSubmitError(null)
    setNotes('')
    setConfirmed(true)
    if (isReschedule && appointment) {
      setClient(null)
      setServiceId(appointment.serviceId ?? '')
      setBarberId(appointment.barberId ?? '')
      setDate(toDateInput(appointment.start))
      setTime(formatTime(appointment.start))
    } else {
      setClient(null)
      setServiceId('')
      setBarberId(preset?.barberId ?? '')
      setDate(toDateInput(preset?.date ?? new Date()))
      setTime(preset?.time ?? '')
    }
  }, [open, isReschedule, appointment, preset])

  const service = isReschedule
    ? appointment && { id: appointment.serviceId, name: appointment.serviceName, duration: appointment.duration ?? 30, price: appointment.price }
    : options?.services.find((s) => s.id === serviceId)
  const barber = options?.barbers.find((b) => b.id === barberId)
  const dateObj = date ? startOfDay(parseISO(date)) : null

  // Citas del barbero ese día
  useEffect(() => {
    if (!open || !barberId || !dateObj) {
      setBusyDay(null)
      return
    }
    let alive = true
    setBusyDay(null)
    fetchBarberDay(barberId, dateObj).then((r) => alive && setBusyDay(r)).catch(() => alive && setBusyDay([]))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, barberId, date])

  const slots = useMemo(() => {
    if (!barber || !dateObj || !service || busyDay == null) return null
    return availableSlots({
      schedule: barber.schedule,
      date: dateObj,
      duration: service.duration,
      appointments: busyDay,
      ignoreId: isReschedule ? appointment?.id : null,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barber, date, service?.id, service?.duration, busyDay])

  // Si la hora elegida ya no está libre, se quita
  useEffect(() => {
    if (slots && time && !slots.includes(time)) setTime('')
  }, [slots, time])

  const shift = barber && dateObj ? shiftFor(barber.schedule, dateObj) : null

  async function handleSubmit(e) {
    e.preventDefault()
    const found = {}
    if (!isReschedule && !client) found.client = 'Elige un cliente.'
    if (!service) found.service = 'Elige un servicio.'
    if (!barberId) found.barber = 'Elige un barbero.'
    if (!date) found.date = 'Elige una fecha.'
    if (!time) found.time = 'Elige un horario disponible.'
    setErrors(found)
    if (Object.keys(found).length) return

    const [h, m] = time.split(':').map(Number)
    const start = new Date(dateObj)
    start.setHours(h, m, 0, 0)

    setSaving(true)
    setSubmitError(null)
    try {
      if (isReschedule) {
        await rescheduleAppointment(appointment, { barberId, start })
        onDone?.({ type: 'reschedule', start, barberName: barber?.name })
      } else {
        await createAppointment({
          clientId: client.id,
          barberId,
          service,
          start,
          notes,
          status: confirmed ? 'accepted' : 'pending',
        })
        onDone?.({ type: 'create', start, clientName: client.full_name })
      }
    } catch (err) {
      // El trigger de la base de datos rechaza citas encimadas
      setSubmitError(
        /overlap|traslap|solap/i.test(err.message)
          ? 'Ese horario se acaba de ocupar. Elige otro.'
          : /row-level security|permission/i.test(err.message)
            ? 'Tu usuario no tiene permiso para hacer este cambio en la base de datos.'
            : err.message
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      size="lg"
      title={isReschedule ? 'Reprogramar cita' : 'Nueva cita'}
      description={
        isReschedule && appointment
          ? `${appointment.clientName} · ${appointment.serviceName} · ahora el ${formatDateLong(appointment.start)} a las ${formatTime(appointment.start)}`
          : 'Agenda una cita para un cliente registrado.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" form={formId} loading={saving}>{isReschedule ? 'Guardar cambio' : 'Agendar cita'}</Button>
        </>
      }
    >
      {!options ? (
        <div className="py-space-xl flex justify-center text-on-surface-variant"><Spinner /></div>
      ) : (
        <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-md">
          {!isReschedule && <ClientPicker value={client} onChange={setClient} error={errors.client} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            {!isReschedule && (
              <Select
                label="Servicio"
                required
                placeholder="Selecciona un servicio"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                error={errors.service}
                options={options.services.map((s) => ({ value: s.id, label: `${s.name} · ${formatDuration(s.duration)} · ${formatMoneyMXN(s.price)}` }))}
              />
            )}
            <Select
              label={isReschedule ? 'Barbero (puedes reasignarlo)' : 'Barbero'}
              required
              placeholder="Selecciona un barbero"
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              error={errors.barber}
              options={options.barbers.map((b) => ({ value: b.id, label: b.name }))}
            />
            <Input
              label="Fecha"
              required
              type="date"
              min={toDateInput(new Date())}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-body-semibold text-body-sm">
              Horario {shift && <span className="font-normal text-on-surface-variant">· turno {minutesToHHMM(shift.start)} – {minutesToHHMM(shift.end)}</span>}
            </span>
            {!barberId || !service || !date ? (
              <p className="text-body-sm text-on-surface-variant">Elige servicio, barbero y fecha para ver los horarios libres.</p>
            ) : slots == null ? (
              <div className="py-space-sm text-on-surface-variant"><Spinner size={16} /></div>
            ) : !shift ? (
              <p className="text-body-sm text-on-surface-variant">{barber?.name} descansa ese día. Elige otra fecha u otro barbero.</p>
            ) : slots.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No quedan horarios libres para {formatDuration(service.duration)} ese día.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Horarios disponibles">
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={time === s}
                    onClick={() => setTime(s)}
                    className={cn(
                      'h-8 px-3 rounded-lg border text-body-sm tabular-nums transition-colors',
                      time === s
                        ? 'bg-primary border-primary text-on-primary'
                        : 'bg-surface-container-lowest border-outline-variant hover:border-primary hover:text-primary'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {errors.time && <p className="text-body-sm text-error">{errors.time}</p>}
          </div>

          {!isReschedule && (
            <>
              <Textarea label="Notas" placeholder="Preferencias del cliente (opcional)" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Switch
                checked={confirmed}
                onChange={setConfirmed}
                label="Marcar como confirmada"
                description="Si la apagas, la cita queda pendiente de confirmar."
              />
            </>
          )}

          {submitError && (
            <p role="alert" className="text-body-sm text-error bg-error-container rounded-lg px-3 py-2">{submitError}</p>
          )}
        </form>
      )}
    </Modal>
  )
}
