// Clientes: lista con estadísticas, historial y cambios (editar, bloquear).
import { supabase } from './supabaseClient'
import { APPOINTMENT_SELECT, normalizeAppointment } from './appointments'

// Un cliente bloqueado conserva su historial pero no puede reservar en línea.
export const BLOCKED_ROLE = 'banned'

const one = (v) => (Array.isArray(v) ? v[0] : v)

function priceOf(row) {
  const booked = row.appointment_services ?? []
  if (booked.length) return booked.reduce((s, x) => s + (Number(x.price_at_booking) || 0), 0)
  return Number(one(row.services)?.price) || 0
}

/** Clientes (activos y bloqueados) con visitas, última visita, gasto total y citas próximas. */
export async function fetchClients() {
  const [profiles, appts, barbers] = await Promise.all([
    supabase.from('profiles').select('id, full_name, phone, birthdate, role').in('role', ['client', BLOCKED_ROLE]),
    supabase.from('appointments').select('client_id, status, scheduled_at, services ( price ), appointment_services ( price_at_booking )'),
    supabase.from('barbers').select('profile_id'),
  ])
  if (profiles.error) throw profiles.error
  if (appts.error) throw appts.error

  const barberIds = new Set((barbers.data ?? []).map((b) => b.profile_id))
  const stats = new Map()
  const now = new Date()
  for (const r of appts.data) {
    const s = stats.get(r.client_id) ?? { visits: 0, spent: 0, lastVisit: null, upcoming: 0, cancelled: 0 }
    const start = new Date(r.scheduled_at)
    if (r.status === 'completed') {
      s.visits += 1
      s.spent += priceOf(r)
      if (!s.lastVisit || start > s.lastVisit) s.lastVisit = start
    } else if (r.status === 'cancelled') {
      s.cancelled += 1
    } else if (start > now) {
      s.upcoming += 1
    }
    stats.set(r.client_id, s)
  }

  return profiles.data.map((p) => ({
    id: p.id,
    name: p.full_name || 'Sin nombre',
    phone: p.phone ?? null,
    birthdate: p.birthdate ?? null,
    blocked: p.role === BLOCKED_ROLE,
    isBarber: barberIds.has(p.id),
    ...(stats.get(p.id) ?? { visits: 0, spent: 0, lastVisit: null, upcoming: 0, cancelled: 0 }),
  }))
}

/** Todas las citas de un cliente, de la más reciente a la más antigua. */
export async function fetchClientHistory(clientId) {
  const { data, error } = await supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .eq('client_id', clientId)
    .order('scheduled_at', { ascending: false })
  if (error) throw error
  return data.map(normalizeAppointment)
}

/** Barbero y servicio que más se repiten en las citas completadas. */
export function favorites(history) {
  const count = (key) => {
    const m = new Map()
    for (const a of history.filter((x) => x.status === 'completed')) m.set(a[key], (m.get(a[key]) ?? 0) + 1)
    const top = [...m.entries()].sort((x, y) => y[1] - x[1])[0]
    return top ? { name: top[0], times: top[1] } : null
  }
  return { barber: count('barberName'), service: count('serviceName') }
}

export async function updateClient(id, { full_name, phone }) {
  const { error } = await supabase.from('profiles').update({ full_name, phone: phone || null }).eq('id', id)
  if (error) throw error
}

export async function setClientBlocked(id, blocked) {
  const { error } = await supabase.from('profiles').update({ role: blocked ? BLOCKED_ROLE : 'client' }).eq('id', id)
  if (error) throw error
}
