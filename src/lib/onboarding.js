// Alta del negocio (solo frontend por ahora): valores iniciales, validación
// por paso y borrador en el navegador. Guardar en Supabase llega con la Fase 5.
import { toMinutes } from './availability'

export const BUSINESS_TYPES = [
  { value: 'barberia', label: 'Barbería' },
  { value: 'estetica', label: 'Estética' },
  { value: 'spa', label: 'Spa' },
]

export const STEPS = [
  { key: 'negocio', label: 'Tu negocio' },
  { key: 'horario', label: 'Horario' },
  { key: 'servicios', label: 'Servicios' },
  { key: 'equipo', label: 'Equipo' },
  { key: 'vista', label: 'Vista previa' },
]

// Palabras que no pueden ser la dirección de un negocio (ver PLAN_REDISENO.md)
export const RESERVED_SLUGS = [
  'app', 'login', 'registro', 'recuperar', 'restablecer', 'onboarding', 'inicio', 'api', 'admin', 'precios', 'ayuda',
  'terminos', 'privacidad', 'barber-os', 'anterior', 'services', 'book', 'profile', 'my-appointments', 'barber-agenda',
]
// Negocios que ya existen (hasta la Fase 5 solo Peludos)
export const TAKEN_SLUGS = ['peludos']

export const SLUG_BASE = 'barberos.app/'

/** "Barbería El Güero" → "barberia-el-guero" */
export function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

/** null si la dirección está libre; si no, el motivo. */
export function slugProblem(slug) {
  if (!slug) return 'Escribe la dirección de tu página.'
  if (slug.length < 3) return 'Usa al menos 3 caracteres.'
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return 'Solo letras minúsculas, números y guiones, sin espacios.'
  if (RESERVED_SLUGS.includes(slug)) return 'Esa dirección está reservada por Barber OS.'
  if (TAKEN_SLUGS.includes(slug)) return 'Esa dirección ya la usa otro negocio.'
  return null
}

const day = (isOpen, open, close) => ({ isOpen, open, close })

export const SERVICE_SUGGESTIONS = [
  { name: 'Corte clásico', price: 200, duration: 45 },
  { name: 'Corte + barba', price: 320, duration: 60 },
  { name: 'Arreglo de barba', price: 150, duration: 30 },
  { name: 'Fade / degradado', price: 250, duration: 45 },
  { name: 'Corte infantil', price: 150, duration: 30 },
]

export const DURATIONS = [15, 30, 45, 60, 75, 90, 120]

let nextId = 1
export const newId = () => `n${Date.now().toString(36)}${nextId++}`

export function emptyDraft() {
  return {
    step: 0,
    business: { name: '', type: 'barberia', phone: '', address: '', slug: '', slugEdited: false, logo: null },
    // Claves de getDay(): 0 = domingo
    hours: {
      1: day(true, '09:00', '20:00'), 2: day(true, '09:00', '20:00'), 3: day(true, '09:00', '20:00'),
      4: day(true, '09:00', '20:00'), 5: day(true, '09:00', '20:00'), 6: day(true, '09:00', '18:00'), 0: day(false, '10:00', '14:00'),
    },
    services: [],
    team: { ownerWorks: true, ownerName: '', barbers: [] },
  }
}

/** Errores del paso indicado ({} si se puede continuar). */
export function stepErrors(step, draft) {
  const e = {}
  if (step === 0) {
    const b = draft.business
    if (!b.name.trim()) e.name = 'Escribe el nombre de tu negocio.'
    if (b.phone.replace(/\D/g, '').length < 10) e.phone = 'Escribe un teléfono de 10 dígitos.'
    const s = slugProblem(b.slug)
    if (s) e.slug = s
  }
  if (step === 1) {
    const open = Object.entries(draft.hours).filter(([, d]) => d.isOpen)
    if (open.length === 0) e.hours = 'Abre al menos un día.'
    for (const [k, d] of open) if (toMinutes(d.close) <= toMinutes(d.open)) e[`day${k}`] = 'El cierre debe ser después de la apertura.'
  }
  if (step === 2) {
    if (draft.services.length === 0) e.services = 'Agrega al menos un servicio.'
    draft.services.forEach((s) => {
      if (!s.name.trim()) e[`name-${s.id}`] = 'Escribe el nombre.'
      if (!(Number(s.price) >= 0) || s.price === '') e[`price-${s.id}`] = 'Precio inválido.'
    })
  }
  if (step === 3) {
    const t = draft.team
    if (t.ownerWorks && !t.ownerName.trim()) e.ownerName = 'Escribe tu nombre.'
    if (!t.ownerWorks && t.barbers.length === 0) e.team = 'Agrega al menos un barbero o marca que tú atiendes.'
    t.barbers.forEach((b) => { if (!b.name.trim()) e[`barber-${b.id}`] = 'Escribe el nombre.' })
  }
  return e
}

// ── Borrador en el navegador ─────────────────────────────────────

const KEY = 'barberos.onboarding.borrador'
const MAX_LOGO_BYTES = 400 * 1024 // el logo en base64 no debe llenar el almacenamiento

export function loadDraft() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const saved = JSON.parse(raw)
    const base = emptyDraft()
    return { ...base, ...saved, business: { ...base.business, ...saved.business }, team: { ...base.team, ...saved.team } }
  } catch {
    return null
  }
}

export function saveDraft(draft) {
  try {
    const logo = draft.business.logo && draft.business.logo.length <= MAX_LOGO_BYTES ? draft.business.logo : null
    localStorage.setItem(KEY, JSON.stringify({ ...draft, business: { ...draft.business, logo } }))
    return true
  } catch {
    return false
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // sin almacenamiento disponible: no hay nada que borrar
  }
}
