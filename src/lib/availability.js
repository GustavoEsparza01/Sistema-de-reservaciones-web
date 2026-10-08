// Horarios disponibles de un barbero para una fecha y duración.
import { addMinutes, isSameDay, startOfDay } from 'date-fns'

export const SLOT_STEP = 30 // minutos entre horarios ofrecidos

export const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm || '0:0').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export const minutesToHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

/** Turno del barbero ese día: { start, end } en minutos, o null si descansa. */
export function shiftFor(schedule, date) {
  const day = schedule?.[String(date.getDay())]
  if (!day?.isWorking) return null
  const start = toMinutes(day.start)
  const end = toMinutes(day.end)
  return end > start ? { start, end } : null
}

/**
 * Horarios libres (["10:00", "10:30", …]) para una cita de `duration` minutos.
 * - dentro del turno del barbero y terminando antes del cierre
 * - sin encimarse con citas no canceladas (appointments: normalizadas, del mismo barbero)
 * - ignoreId: la cita que se está reprogramando no choca consigo misma
 * - nunca en el pasado
 */
export function availableSlots({ schedule, date, duration, appointments = [], ignoreId = null, now = new Date(), step = SLOT_STEP }) {
  const shift = shiftFor(schedule, date)
  if (!shift || !duration) return []

  const dayStart = startOfDay(date)
  const busy = appointments
    .filter((a) => a.status !== 'cancelled' && a.id !== ignoreId && isSameDay(a.start, date))
    .map((a) => ({ start: a.start, end: a.end ?? addMinutes(a.start, a.duration ?? 0) }))

  const slots = []
  for (let m = shift.start; m + duration <= shift.end; m += step) {
    const start = addMinutes(dayStart, m)
    const end = addMinutes(start, duration)
    if (start < now) continue
    if (busy.some((b) => start < b.end && end > b.start)) continue
    slots.push(minutesToHHMM(m))
  }
  return slots
}
