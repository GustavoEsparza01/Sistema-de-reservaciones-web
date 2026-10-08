// Consultas y normalización de citas para el panel nuevo.
import { supabase } from './supabaseClient'

// Columnas que necesita el panel. El precio cobrado se toma de
// appointment_services.price_at_booking; si no hay registro, del servicio.
export const APPOINTMENT_SELECT = `
  id, scheduled_at, ends_at, duration_min, status, notes,
  services ( name, price ),
  appointment_services ( price_at_booking ),
  barbers ( id, profiles ( full_name ) ),
  client:profiles!appointments_client_id_fkey ( full_name, phone )
`

const one = (v) => (Array.isArray(v) ? v[0] : v)

/** Convierte una fila de Supabase en un objeto plano y fácil de usar en la interfaz. */
export function normalizeAppointment(row) {
  const service = one(row.services)
  const barber = one(row.barbers)
  const client = one(row.client)
  const booked = row.appointment_services ?? []

  const price = booked.length > 0
    ? booked.reduce((sum, s) => sum + (Number(s.price_at_booking) || 0), 0)
    : Number(service?.price) || 0

  const start = new Date(row.scheduled_at)
  const end = row.ends_at ? new Date(row.ends_at) : null
  const duration = row.duration_min ?? (end ? Math.round((end - start) / 60000) : null)

  return {
    id: row.id,
    start,
    end,
    duration,
    status: row.status,
    notes: row.notes,
    price,
    serviceName: service?.name ?? 'Servicio',
    barberId: barber?.id ?? null,
    barberName: one(barber?.profiles)?.full_name ?? 'Sin asignar',
    clientName: client?.full_name ?? 'Cliente',
    clientPhone: client?.phone ?? null,
  }
}

/** Cambia el estado de una cita. Lanza el error de Supabase si falla. */
export async function updateAppointmentStatus(id, status) {
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
  if (error) throw error
}
