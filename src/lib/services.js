// Catálogo de servicios: consultas y validación.
import { supabase } from './supabaseClient'

export const DESCRIPTION_MAX = 160
export const DURATION_OPTIONS = [15, 30, 45, 60, 75, 90, 120]

/** Servicios con el número de citas de cada uno. */
export async function fetchServices() {
  const [services, usage] = await Promise.all([
    supabase.from('services').select('id, name, description, price, duration_min, is_active').order('name'),
    supabase.from('appointments').select('service_id'),
  ])
  if (services.error) throw services.error

  const counts = {}
  for (const r of usage.data ?? []) counts[r.service_id] = (counts[r.service_id] ?? 0) + 1

  return services.data.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description ?? '',
    price: Number(s.price) || 0,
    duration: s.duration_min,
    active: !!s.is_active,
    bookings: counts[s.id] ?? 0,
  }))
}

/**
 * Valida el formulario. Devuelve { errors, values } con los valores limpios.
 * existing: lista de servicios para avisar de nombres repetidos.
 */
export function validateService(form, existing = [], editingId = null) {
  const errors = {}
  const name = form.name.trim()
  const description = form.description.trim()
  const price = Number(form.price)
  const duration = Number(form.duration)

  if (!name) errors.name = 'Escribe el nombre del servicio.'
  else if (existing.some((s) => s.id !== editingId && s.name.trim().toLowerCase() === name.toLowerCase()))
    errors.name = 'Ya existe un servicio con ese nombre.'
  if (description.length > DESCRIPTION_MAX) errors.description = `Máximo ${DESCRIPTION_MAX} caracteres.`
  if (form.price === '' || !Number.isFinite(price) || price < 0) errors.price = 'Escribe un precio válido.'
  if (!Number.isInteger(duration) || duration < 5 || duration > 480) errors.duration = 'Elige una duración.'

  return {
    errors,
    values: { name, description: description || null, price, duration_min: duration, is_active: !!form.active },
  }
}

export async function createService(values) {
  const { error } = await supabase.from('services').insert([values])
  if (error) throw error
}

export async function updateService(id, values) {
  const { error } = await supabase.from('services').update(values).eq('id', id)
  if (error) throw error
}

export async function setServiceActive(id, active) {
  const { error } = await supabase.from('services').update({ is_active: active }).eq('id', id)
  if (error) throw error
}
