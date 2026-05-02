import { addMinutes, format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/** Calcula ends_at sumando duration_min a scheduled_at (string ISO) */
export function calcEndsAt(scheduledAt, durationMin) {
  return addMinutes(parseISO(scheduledAt), durationMin).toISOString()
}

/** Formatea fecha para mostrar al usuario */
export function formatDate(isoString) {
  return format(parseISO(isoString), "EEEE d 'de' MMMM, HH:mm", { locale: es })
}

/** Genera slots de tiempo en un rango dado cada N minutos */
export function generateSlots(startTime, endTime, stepMin = 30) {
  const slots = []
  let current = new Date(`1970-01-01T${startTime}`)
  const end   = new Date(`1970-01-01T${endTime}`)
  while (current < end) {
    slots.push(format(current, 'HH:mm'))
    current = addMinutes(current, stepMin)
  }
  return slots
}
