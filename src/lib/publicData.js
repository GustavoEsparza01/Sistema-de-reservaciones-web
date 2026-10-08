// Datos que ve cualquier visitante: servicios y barberos activos.
import { supabase } from './supabaseClient'

const one = (v) => (Array.isArray(v) ? v[0] : v)

export async function fetchPublicServices() {
  const { data, error } = await supabase
    .from('services')
    .select('id, name, description, price, duration_min')
    .eq('is_active', true)
    .order('price')
  if (error) throw error
  return data.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description ?? '',
    price: Number(s.price) || 0,
    duration: s.duration_min || 30,
  }))
}

/**
 * Barberos activos con nombre, biografía y horario.
 * Usa la vista public_barbers (supabase/migrations/20261007_public_barbers_view.sql)
 * para que los visitantes sin sesión vean los nombres. Si la vista aún no existe,
 * lee la tabla barbers (los nombres solo llegan si hay sesión).
 */
export async function fetchPublicBarbers() {
  const view = await supabase.from('public_barbers').select('id, full_name, bio, schedule')
  if (!view.error) {
    return view.data
      .map((b) => ({ id: b.id, name: b.full_name ?? 'Barbero', bio: b.bio ?? '', schedule: b.schedule ?? {} }))
      .sort((x, y) => x.name.localeCompare(y.name, 'es'))
  }

  const { data, error } = await supabase
    .from('barbers')
    .select('id, bio, schedule, profiles ( full_name )')
    .eq('is_active', true)
  if (error) throw error
  return data
    .map((b) => ({ id: b.id, name: one(b.profiles)?.full_name ?? 'Barbero', bio: b.bio ?? '', schedule: b.schedule ?? {} }))
    .sort((x, y) => x.name.localeCompare(y.name, 'es'))
}
