// Equipo: barberos, administradores y horarios semanales.
import { endOfDay, startOfDay } from 'date-fns'
import { supabase } from './supabaseClient'
import { normalizeAppointment } from './appointments'

export const BIO_MAX = 400

// Días en el orden en que se muestran (lunes primero). La clave es getDay(): 0 = domingo.
export const WEEK_DAYS = [
  { key: '1', short: 'L', name: 'Lunes' },
  { key: '2', short: 'M', name: 'Martes' },
  { key: '3', short: 'M', name: 'Miércoles' },
  { key: '4', short: 'J', name: 'Jueves' },
  { key: '5', short: 'V', name: 'Viernes' },
  { key: '6', short: 'S', name: 'Sábado' },
  { key: '0', short: 'D', name: 'Domingo' },
]

// Horario por defecto de un barbero nuevo
export const DEFAULT_SCHEDULE = {
  1: { isWorking: true, start: '10:00', end: '20:00' },
  2: { isWorking: true, start: '10:00', end: '20:00' },
  3: { isWorking: true, start: '10:00', end: '20:00' },
  4: { isWorking: true, start: '10:00', end: '20:00' },
  5: { isWorking: true, start: '10:00', end: '20:00' },
  6: { isWorking: true, start: '10:00', end: '18:00' },
  0: { isWorking: false, start: '10:00', end: '14:00' },
}

export const SCHEDULE_TEMPLATES = [
  { value: 'completa', label: 'Jornada completa (09:00 – 20:00)', start: '09:00', end: '20:00' },
  { value: 'matutino', label: 'Turno matutino (09:00 – 15:00)', start: '09:00', end: '15:00' },
  { value: 'vespertino', label: 'Turno vespertino (14:00 – 21:00)', start: '14:00', end: '21:00' },
]

const one = (v) => (Array.isArray(v) ? v[0] : v)

export const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm || '0:0').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** Completa un horario guardado con los días que falten. */
export function normalizeSchedule(schedule) {
  const base = schedule && Object.keys(schedule).length > 0 ? schedule : DEFAULT_SCHEDULE
  return Object.fromEntries(
    WEEK_DAYS.map(({ key }) => {
      const d = base[key] ?? { isWorking: false, start: '10:00', end: '18:00' }
      return [key, { isWorking: !!d.isWorking, start: d.start || '10:00', end: d.end || '18:00' }]
    })
  )
}

/** Minutos laborales por semana. */
export function weeklyMinutes(schedule) {
  return WEEK_DAYS.reduce((sum, { key }) => {
    const d = schedule[key]
    return d?.isWorking ? sum + Math.max(0, toMinutes(d.end) - toMinutes(d.start)) : sum
  }, 0)
}

/** Días con hora de salida igual o anterior a la de entrada. */
export function scheduleErrors(schedule) {
  const errors = {}
  for (const { key } of WEEK_DAYS) {
    const d = schedule[key]
    if (d.isWorking && toMinutes(d.end) <= toMinutes(d.start)) errors[key] = 'La salida debe ser después de la entrada.'
  }
  return errors
}

/**
 * Miembros del equipo: todos los barberos (activos e inactivos) y los
 * administradores que no son barberos. Incluye las citas de hoy para la ocupación.
 */
export async function fetchTeam() {
  const now = new Date()
  const [barbers, admins, today] = await Promise.all([
    // '*' incluye photo_url cuando ya existe la columna (20261008_barber_photos.sql)
    supabase.from('barbers').select('*, profiles ( id, full_name, phone, role )'),
    supabase.from('profiles').select('id, full_name, phone, role').eq('role', 'admin'),
    supabase
      .from('appointments')
      .select('id, barber_id, scheduled_at, ends_at, duration_min, status')
      .gte('scheduled_at', startOfDay(now).toISOString())
      .lte('scheduled_at', endOfDay(now).toISOString())
      .neq('status', 'cancelled'),
  ])
  if (barbers.error) throw barbers.error
  if (admins.error) throw admins.error

  const members = barbers.data.map((b) => {
    const p = one(b.profiles)
    return {
      key: `b-${b.id}`,
      barberId: b.id,
      profileId: b.profile_id,
      name: p?.full_name ?? 'Sin nombre',
      phone: p?.phone ?? null,
      isAdmin: p?.role === 'admin',
      isBarber: true,
      active: !!b.is_active,
      schedule: normalizeSchedule(b.schedule),
      bio: b.bio ?? '',
      photo: b.photo_url ?? null,
    }
  })

  const barberProfiles = new Set(members.map((m) => m.profileId))
  for (const a of admins.data) {
    if (barberProfiles.has(a.id)) continue
    members.push({
      key: `a-${a.id}`,
      barberId: null,
      profileId: a.id,
      name: a.full_name ?? 'Sin nombre',
      phone: a.phone ?? null,
      isAdmin: true,
      isBarber: false,
      active: true,
      schedule: null,
      bio: '',
      photo: null,
    })
  }

  members.sort((x, y) => Number(y.active) - Number(x.active) || x.name.localeCompare(y.name, 'es'))
  return { members, todayAppointments: (today.data ?? []).map(normalizeAppointment) }
}

/** Usuarios registrados que todavía no son barberos (para agregarlos al equipo). */
export async function fetchCandidates() {
  const [profiles, barbers] = await Promise.all([
    supabase.from('profiles').select('id, full_name, phone, role').order('full_name'),
    supabase.from('barbers').select('profile_id'),
  ])
  if (profiles.error) throw profiles.error
  const taken = new Set((barbers.data ?? []).map((b) => b.profile_id))
  return profiles.data.filter((p) => !taken.has(p.id))
}

/** Convierte a un usuario registrado en barbero activo, con el horario por defecto. */
export async function addBarber(profileId) {
  const { error } = await supabase
    .from('barbers')
    .insert([{ profile_id: profileId, is_active: true, schedule: DEFAULT_SCHEDULE }])
  if (error) throw error
}

export async function setBarberActive(barberId, active) {
  const { error } = await supabase.from('barbers').update({ is_active: active }).eq('id', barberId)
  if (error) throw error
}

export async function updateBarber(barberId, { schedule, bio }) {
  const { error } = await supabase.from('barbers').update({ schedule, bio: bio?.trim() || null }).eq('id', barberId)
  if (error) throw error
}

// Fotos de barberos: bucket público barber-photos (supabase/migrations/20261008_barber_photos.sql)
const PHOTO_BUCKET = 'barber-photos'
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const PHOTO_MAX_MB = 2

/** Mensaje de error si el archivo no sirve como foto, o null. */
export function photoFileError(file) {
  if (!PHOTO_TYPES.includes(file.type)) return 'Usa una imagen JPG, PNG o WebP.'
  if (file.size > PHOTO_MAX_MB * 1024 * 1024) return `La foto debe pesar menos de ${PHOTO_MAX_MB} MB.`
  return null
}

// Ruta dentro del bucket a partir de la URL pública
function photoPath(url) {
  const marker = `/${PHOTO_BUCKET}/`
  const i = url ? url.indexOf(marker) : -1
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}

/**
 * Cambia la foto del barbero: sube el archivo (o la quita si file es null),
 * guarda la dirección y borra la foto anterior. Devuelve la dirección nueva.
 */
export async function setBarberPhoto(barberId, file, previousUrl) {
  let url = null
  if (file) {
    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
    // Nombre nuevo en cada cambio para que el navegador no muestre la foto vieja guardada en caché
    const path = `${barberId}/${Date.now()}.${ext}`
    const up = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type })
    if (up.error) throw up.error
    url = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
  }

  const { error } = await supabase.from('barbers').update({ photo_url: url }).eq('id', barberId)
  if (error) throw error

  // Si falla, solo queda un archivo sin usar en el bucket
  const old = photoPath(previousUrl)
  if (old) await supabase.storage.from(PHOTO_BUCKET).remove([old])
  return url
}
