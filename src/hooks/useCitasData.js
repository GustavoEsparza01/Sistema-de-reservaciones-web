import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { fetchAppointmentsPage, fetchStatusCounts } from '../lib/appointments'

const EMPTY_COUNTS = { all: 0, pending: 0, accepted: 0, completed: 0, cancelled: 0 }

/**
 * Listado de citas con filtros, paginación y contadores por estado.
 * filters: { status, q, from, to, barberId, serviceId }
 */
export function useCitasData(filters, page, pageSize) {
  const [state, setState] = useState({ rows: [], total: 0, counts: EMPTY_COUNTS, loading: true, error: null })
  const requestId = useRef(0)
  const key = JSON.stringify([filters, page, pageSize])

  const load = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const [pageData, counts] = await Promise.all([
        fetchAppointmentsPage(filters, page, pageSize),
        fetchStatusCounts(filters),
      ])
      // Ignorar respuestas viejas si el usuario cambió los filtros mientras tanto
      if (id !== requestId.current) return
      setState({ ...pageData, counts, loading: false, error: null })
    } catch (error) {
      if (id !== requestId.current) return
      console.error('Citas:', error)
      setState((s) => ({ ...s, loading: false, error }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}

/** Barberos activos y servicios, para los filtros. */
export function useFilterOptions() {
  const [options, setOptions] = useState({ barbers: [], services: [] })

  useEffect(() => {
    let alive = true
    Promise.all([
      supabase.from('barbers').select('id, profiles ( full_name )').eq('is_active', true),
      supabase.from('services').select('id, name').order('name'),
    ]).then(([b, s]) => {
      if (!alive) return
      setOptions({
        barbers: (b.data ?? [])
          .map((x) => ({ value: x.id, label: (Array.isArray(x.profiles) ? x.profiles[0] : x.profiles)?.full_name ?? 'Barbero' }))
          .sort((x, y) => x.label.localeCompare(y.label, 'es')),
        services: (s.data ?? []).map((x) => ({ value: x.id, label: x.name })),
      })
    })
    return () => { alive = false }
  }, [])

  return options
}
