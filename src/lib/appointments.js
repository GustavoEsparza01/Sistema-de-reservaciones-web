// Consultas y normalización de citas para el panel nuevo.
import { endOfDay, parseISO, startOfDay } from 'date-fns'
import { supabase } from './supabaseClient'
import { getStatus } from './appointmentStatus'
import { formatDate, formatTime } from './format'
import { downloadCsv } from './csv'

// Columnas que necesita el panel. El precio cobrado se toma de
// appointment_services.price_at_booking; si no hay registro, del servicio.
const BASE_COLUMNS = `
  id, client_id, barber_id, service_id, scheduled_at, ends_at, duration_min, status, notes,
  services ( name, price ),
  appointment_services ( price_at_booking ),
  barbers ( id, profiles ( full_name ) )
`
const CLIENT = 'client:profiles!appointments_client_id_fkey'

export const APPOINTMENT_SELECT = `${BASE_COLUMNS}, ${CLIENT} ( full_name, phone )`
// Con !inner se pueden filtrar las citas por nombre o teléfono del cliente
const APPOINTMENT_SELECT_SEARCH = `${BASE_COLUMNS}, ${CLIENT}!inner ( full_name, phone )`

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
    serviceId: row.service_id ?? null,
    serviceName: service?.name ?? 'Servicio',
    barberId: barber?.id ?? row.barber_id ?? null,
    barberName: one(barber?.profiles)?.full_name ?? 'Sin asignar',
    clientId: row.client_id ?? null,
    clientName: client?.full_name ?? 'Cliente',
    clientPhone: client?.phone ?? null,
  }
}

/** Cambia el estado de una cita. Lanza el error de Supabase si falla. */
export async function updateAppointmentStatus(id, status) {
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
  if (error) throw error
}

/** Cambia el estado de varias citas a la vez. */
export async function updateAppointmentsStatus(ids, status) {
  if (ids.length === 0) return
  const { error } = await supabase.from('appointments').update({ status }).in('id', ids)
  if (error) throw error
}

// ── Listado con filtros ───────────────────────────────────────────

// Quita los caracteres que rompen la sintaxis de filtros de Supabase
const cleanSearch = (q) => q.replace(/[,()*%\\]/g, ' ').trim()

/**
 * Aplica los filtros del listado a una consulta.
 * filters: { status, q, from, to, barberId, serviceId } (from/to en formato yyyy-mm-dd)
 * includeStatus=false se usa para contar por estado.
 */
function applyFilters(query, filters, { includeStatus = true } = {}) {
  const q = cleanSearch(filters.q ?? '')
  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`, { referencedTable: 'client' })
  if (includeStatus && filters.status) query = query.eq('status', filters.status)
  if (filters.from) query = query.gte('scheduled_at', startOfDay(parseISO(filters.from)).toISOString())
  if (filters.to) query = query.lte('scheduled_at', endOfDay(parseISO(filters.to)).toISOString())
  if (filters.barberId) query = query.eq('barber_id', filters.barberId)
  if (filters.serviceId) query = query.eq('service_id', filters.serviceId)
  return query
}

const selectFor = (filters) => (cleanSearch(filters.q ?? '') ? APPOINTMENT_SELECT_SEARCH : APPOINTMENT_SELECT)

/** Una página del listado (page empieza en 1), de la más reciente a la más antigua. */
export async function fetchAppointmentsPage(filters, page, pageSize) {
  const fromRow = (page - 1) * pageSize
  const query = applyFilters(
    supabase.from('appointments').select(selectFor(filters), { count: 'exact' }),
    filters
  )
    .order('scheduled_at', { ascending: false })
    .range(fromRow, fromRow + pageSize - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { rows: data.map(normalizeAppointment), total: count ?? 0 }
}

/** Cuántas citas hay en cada estado con los filtros actuales (sin el filtro de estado). */
export async function fetchStatusCounts(filters) {
  const search = cleanSearch(filters.q ?? '')
  const select = search ? `status, ${CLIENT}!inner ( full_name, phone )` : 'status'
  const { data, error } = await applyFilters(supabase.from('appointments').select(select), filters, { includeStatus: false })
  if (error) throw error
  const counts = { all: data.length, pending: 0, accepted: 0, completed: 0, cancelled: 0 }
  for (const r of data) if (r.status in counts) counts[r.status] += 1
  return counts
}

/** Todas las citas que cumplen los filtros (para exportar). */
export async function fetchAllAppointments(filters) {
  const { data, error } = await applyFilters(supabase.from('appointments').select(selectFor(filters)), filters)
    .order('scheduled_at', { ascending: false })
  if (error) throw error
  return data.map(normalizeAppointment)
}

/** Número de citas completadas de un cliente (visitas). */
export async function countClientVisits(clientId) {
  if (!clientId) return null
  const { count, error } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('status', 'completed')
  if (error) return null
  return count
}

// ── Exportar ──────────────────────────────────────────────────────

/** Descarga las citas como archivo CSV. */
export function downloadAppointmentsCsv(appointments, fileName = 'citas.csv') {
  downloadCsv(
    fileName,
    ['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Servicio', 'Barbero', 'Duración (min)', 'Precio (MXN)', 'Estado', 'Notas'],
    appointments.map((a) => [
      formatDate(a.start), formatTime(a.start), a.clientName, a.clientPhone, a.serviceName, a.barberName,
      a.duration, a.price, getStatus(a.status).label, a.notes,
    ])
  )
}

// ── Contacto ──────────────────────────────────────────────────────

/** Enlace de WhatsApp para un teléfono mexicano (agrega 52 si tiene 10 dígitos). */
export function whatsappLink(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.length < 10) return null
  return `https://wa.me/${digits.length === 10 ? `52${digits}` : digits}`
}

export function telLink(phone) {
  const digits = String(phone ?? '').replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : null
}

// ── Crear y reprogramar ───────────────────────────────────────────

/** Citas (no canceladas) de un barbero en un día, para calcular horarios libres. */
export async function fetchBarberDay(barberId, date) {
  if (!barberId || !date) return []
  const { data, error } = await supabase
    .from('appointments')
    .select('id, barber_id, scheduled_at, ends_at, duration_min, status')
    .eq('barber_id', barberId)
    .neq('status', 'cancelled')
    .gte('scheduled_at', startOfDay(date).toISOString())
    .lte('scheduled_at', endOfDay(date).toISOString())
  if (error) throw error
  return data.map(normalizeAppointment)
}

/** Busca clientes registrados por nombre o teléfono. */
export async function searchClients(text, limit = 8) {
  const q = cleanSearch(text ?? '')
  let query = supabase.from('profiles').select('id, full_name, phone').order('full_name').limit(limit)
  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`)
  const { data, error } = await query
  if (error) throw error
  return data
}

/**
 * Crea una cita como lo hace la reserva del cliente: inserta en appointments
 * y registra el servicio con su precio en appointment_services.
 */
export async function createAppointment({ clientId, barberId, service, start, notes, status = 'accepted' }) {
  const end = new Date(start.getTime() + service.duration * 60000)
  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      client_id: clientId,
      barber_id: barberId,
      service_id: service.id,
      scheduled_at: start.toISOString(),
      ends_at: end.toISOString(),
      duration_min: service.duration,
      notes: notes?.trim() || null,
      status,
    }])
    .select('id')
    .single()
  if (error) throw error

  const link = await supabase
    .from('appointment_services')
    .insert([{ appointment_id: data.id, service_id: service.id, price_at_booking: service.price }])
  if (link.error) console.error('No se pudo registrar el precio de la cita:', link.error)
  return data.id
}

/** Cambia fecha, hora y/o barbero de una cita, conservando su duración. */
export async function rescheduleAppointment(appointment, { barberId, start }) {
  const duration = appointment.duration ?? 30
  const end = new Date(start.getTime() + duration * 60000)
  const { error } = await supabase
    .from('appointments')
    .update({ barber_id: barberId, scheduled_at: start.toISOString(), ends_at: end.toISOString() })
    .eq('id', appointment.id)
  if (error) throw error
}
