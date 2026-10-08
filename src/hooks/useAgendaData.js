import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { APPOINTMENT_SELECT, normalizeAppointment } from '../lib/appointments'

const one = (v) => (Array.isArray(v) ? v[0] : v)

/** Citas entre `from` y `to` y barberos activos con su horario. */
export function useAgendaData(from, to) {
  const [state, setState] = useState({ appointments: [], barbers: [], loading: true, error: null })
  const requestId = useRef(0)
  const key = `${from.toISOString()}|${to.toISOString()}`

  const load = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }))

    const [appts, barbers] = await Promise.all([
      supabase
        .from('appointments')
        .select(APPOINTMENT_SELECT)
        .gte('scheduled_at', from.toISOString())
        .lte('scheduled_at', to.toISOString())
        .order('scheduled_at'),
      supabase.from('barbers').select('id, schedule, profiles ( full_name )').eq('is_active', true),
    ])
    if (id !== requestId.current) return

    const error = appts.error || barbers.error
    if (error) {
      console.error('Agenda:', error)
      setState((s) => ({ ...s, loading: false, error }))
      return
    }

    setState({
      appointments: appts.data.map(normalizeAppointment),
      barbers: barbers.data
        .map((b) => ({ id: b.id, name: one(b.profiles)?.full_name ?? 'Barbero', schedule: b.schedule ?? {} }))
        .sort((x, y) => x.name.localeCompare(y.name, 'es')),
      loading: false,
      error: null,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}
