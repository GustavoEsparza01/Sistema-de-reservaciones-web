import { useCallback, useEffect, useState } from 'react'
import { endOfMonth, startOfDay, subDays } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { APPOINTMENT_SELECT, normalizeAppointment } from '../lib/appointments'

// Se cargan 180 días hacia atrás para poder comparar los 90 días de la
// gráfica de ingresos contra los 90 anteriores.
const HISTORY_DAYS = 180
const PENDING_LIMIT = 5

/**
 * Datos de la pantalla Resumen: citas recientes, próximas pendientes y
 * barberos activos con su horario.
 */
export function useResumenData() {
  const [state, setState] = useState({
    appointments: [],
    pending: [],
    pendingCount: 0,
    barbers: [],
    loading: true,
    error: null,
  })

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }))

    const now = new Date()
    const from = startOfDay(subDays(now, HISTORY_DAYS)).toISOString()
    const to = endOfMonth(now).toISOString()

    const [appts, pending, barbers] = await Promise.all([
      supabase
        .from('appointments')
        .select(APPOINTMENT_SELECT)
        .gte('scheduled_at', from)
        .lte('scheduled_at', to)
        .order('scheduled_at', { ascending: true }),
      supabase
        .from('appointments')
        .select(APPOINTMENT_SELECT, { count: 'exact' })
        .eq('status', 'pending')
        .gte('scheduled_at', startOfDay(now).toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(PENDING_LIMIT),
      supabase
        .from('barbers')
        .select('id, schedule, profiles ( full_name )')
        .eq('is_active', true),
    ])

    const error = appts.error || pending.error || barbers.error
    if (error) {
      console.error('Resumen:', error)
      setState((s) => ({ ...s, loading: false, error }))
      return
    }

    setState({
      appointments: appts.data.map(normalizeAppointment),
      pending: pending.data.map(normalizeAppointment),
      pendingCount: pending.count ?? pending.data.length,
      barbers: barbers.data.map((b) => ({
        id: b.id,
        name: (Array.isArray(b.profiles) ? b.profiles[0] : b.profiles)?.full_name ?? 'Barbero',
        schedule: b.schedule ?? {},
      })),
      loading: false,
      error: null,
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}
