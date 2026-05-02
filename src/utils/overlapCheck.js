/**
 * Valida traslape en el frontend (el trigger de la BD también lo hace).
 * existingAppointments: array de { scheduled_at, ends_at, status }
 */
export function hasOverlap(existingAppointments, newStart, newEnd) {
  return existingAppointments
    .filter(a => a.status !== 'cancelled')
    .some(a => {
      const start = new Date(a.scheduled_at)
      const end   = new Date(a.ends_at)
      return new Date(newStart) < end && new Date(newEnd) > start
    })
}
