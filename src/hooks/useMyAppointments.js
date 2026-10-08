import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { APPOINTMENT_SELECT, normalizeAppointment } from '../lib/appointments'
import { fetchPublicBarbers } from '../lib/publicData'

/**
 * Citas del cliente con sesión. Si la base no deja leer el nombre del barbero
 * desde la cita, se completa con la lista pública de barberos.
 */
export function useMyAppointments(clientId) {
  const [state, setState] = useState({ appointments: [], loading: true, error: null })

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!clientId) return
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
    const [appts, barbers] = await Promise.all([
      supabase.from('appointments').select(APPOINTMENT_SELECT).eq('client_id', clientId).order('scheduled_at', { ascending: false }),
      fetchPublicBarbers().catch(() => []),
    ])
    if (appts.error) {
      console.error('Mis citas:', appts.error)
      setState((s) => ({ ...s, loading: false, error: appts.error }))
      return
    }
    const names = new Map(barbers.map((b) => [b.id, b.name]))
    setState({
      appointments: appts.data.map((row) => {
        const a = normalizeAppointment(row)
        if (a.barberName === 'Sin asignar' && names.has(a.barberId)) a.barberName = names.get(a.barberId)
        return a
      }),
      loading: false,
      error: null,
    })
  }, [clientId])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}

/** ¿La cita sigue por delante (no completada ni cancelada y aún no termina)? */
export function isUpcoming(a, now = new Date()) {
  const end = a.end ?? new Date(a.start.getTime() + (a.duration ?? 30) * 60000)
  return (a.status === 'pending' || a.status === 'accepted') && end > now
}

/** El cliente puede cancelar mientras la cita no haya empezado. */
export const canCancel = (a, now = new Date()) => (a.status === 'pending' || a.status === 'accepted') && a.start > now

/** Como en la versión anterior, el cliente solo reprograma citas pendientes. */
export const canReschedule = (a, now = new Date()) => a.status === 'pending' && a.start > now

export function googleCalendarLink({ title, start, end, location }) {
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const p = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${fmt(start)}/${fmt(end)}`, location })
  return `https://calendar.google.com/calendar/render?${p}`
}
