// Cálculos de la pantalla Resumen a partir de citas ya normalizadas.
import {
  addDays, differenceInCalendarDays, differenceInMinutes, format, endOfDay, endOfMonth, endOfWeek, isSameDay, startOfDay,
  startOfMonth, startOfWeek, subDays, subMonths, subWeeks,
} from 'date-fns'
import { es } from 'date-fns/locale'

const weekdayLabel = (d) => `vs. ${format(d, 'EEEE', { locale: es })} anterior`

export const PERIODS = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'ayer', label: 'Ayer' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
]

const WEEK = { weekStartsOn: 1 } // la semana empieza en lunes

/**
 * Rango del periodo y del periodo con el que se compara:
 * - hoy / ayer: el mismo día de la semana anterior ("vs. lunes anterior")
 * - semana: la semana anterior completa
 * - mes: el mes anterior completo
 */
export function periodRanges(period, now = new Date()) {
  switch (period) {
    case 'ayer': {
      const day = subDays(now, 1)
      return {
        current: { start: startOfDay(day), end: endOfDay(day) },
        previous: { start: startOfDay(subWeeks(day, 1)), end: endOfDay(subWeeks(day, 1)) },
        compareLabel: weekdayLabel(day),
        tableTitle: 'Citas de ayer',
      }
    }
    case 'semana':
      return {
        current: { start: startOfWeek(now, WEEK), end: endOfWeek(now, WEEK) },
        previous: { start: startOfWeek(subWeeks(now, 1), WEEK), end: endOfWeek(subWeeks(now, 1), WEEK) },
        compareLabel: 'vs. semana anterior',
        tableTitle: 'Citas de esta semana',
      }
    case 'mes':
      return {
        current: { start: startOfMonth(now), end: endOfMonth(now) },
        previous: { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) },
        compareLabel: 'vs. mes anterior',
        tableTitle: 'Citas de este mes',
      }
    case 'hoy':
    default:
      return {
        current: { start: startOfDay(now), end: endOfDay(now) },
        previous: { start: startOfDay(subWeeks(now, 1)), end: endOfDay(subWeeks(now, 1)) },
        compareLabel: weekdayLabel(now),
        tableTitle: 'Citas de hoy',
      }
  }
}

const inRange = (a, { start, end }) => a.start >= start && a.start <= end
const revenueOf = (list) => list.filter((a) => a.status === 'completed').reduce((s, a) => s + a.price, 0)

/** Variación porcentual; null si no hay base para comparar. */
export function pctChange(current, previous) {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

/** Indicadores del periodo elegido. */
export function periodStats(appointments, period, now = new Date()) {
  const ranges = periodRanges(period, now)
  const current = appointments.filter((a) => inRange(a, ranges.current))
  const previous = appointments.filter((a) => inRange(a, ranges.previous))

  const active = current.filter((a) => a.status !== 'cancelled')
  const prevActive = previous.filter((a) => a.status !== 'cancelled')
  const revenue = revenueOf(current)
  const prevRevenue = revenueOf(previous)

  return {
    ...ranges,
    list: current,
    count: active.length,
    countDiff: active.length - prevActive.length,
    hasPrevCount: prevActive.length > 0,
    byStatus: {
      accepted: current.filter((a) => a.status === 'accepted').length,
      pending: current.filter((a) => a.status === 'pending').length,
      completed: current.filter((a) => a.status === 'completed').length,
    },
    revenue,
    revenueChange: pctChange(revenue, prevRevenue),
  }
}

/** Tasa de cancelación del mes actual contra el anterior (en fracción y en puntos). */
export function cancellationStats(appointments, now = new Date()) {
  const rate = (list) => (list.length ? list.filter((a) => a.status === 'cancelled').length / list.length : null)
  const month = appointments.filter((a) => inRange(a, { start: startOfMonth(now), end: endOfMonth(now) }))
  const prevStart = startOfMonth(subMonths(now, 1))
  const prev = appointments.filter((a) => inRange(a, { start: prevStart, end: endOfMonth(prevStart) }))
  const current = rate(month)
  const previous = rate(prev)
  return {
    rate: current,
    cancelled: month.filter((a) => a.status === 'cancelled').length,
    total: month.length,
    // diferencia en puntos porcentuales
    diffPoints: current != null && previous != null ? (current - previous) * 100 : null,
  }
}

function hoursToMinutes(hhmm) {
  const [h, m] = String(hhmm || '0:0').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/**
 * Ocupación de cada barbero hoy: minutos reservados (sin canceladas) contra
 * los minutos de su horario de hoy (schedule[díaDeLaSemana]).
 */
export function teamOccupancy(barbers, appointments, now = new Date()) {
  const dayKey = String(now.getDay())
  const today = appointments.filter((a) => isSameDay(a.start, now) && a.status !== 'cancelled')

  return barbers
    .map((b) => {
      const day = b.schedule?.[dayKey]
      const working = !!day?.isWorking
      const available = working ? Math.max(0, hoursToMinutes(day.end) - hoursToMinutes(day.start)) : 0
      const mine = today.filter((a) => a.barberId === b.id)
      const booked = mine.reduce((s, a) => s + (a.duration ?? (a.end ? differenceInMinutes(a.end, a.start) : 0)), 0)
      return {
        id: b.id,
        name: b.name,
        working,
        count: mine.length,
        bookedMin: booked,
        availableMin: available,
        ratio: available > 0 ? Math.min(1, booked / available) : 0,
      }
    })
    .sort((a, b) => Number(b.working) - Number(a.working) || b.ratio - a.ratio)
}

/** Ingresos (citas completadas) por día de los últimos `days` días, más el total del periodo anterior. */
export function revenueSeries(appointments, days, now = new Date()) {
  const first = startOfDay(subDays(now, days - 1))
  const series = Array.from({ length: days }, (_, i) => ({ date: addDays(first, i), revenue: 0 }))
  let total = 0
  let previous = 0
  const prevStart = subDays(first, days)

  for (const a of appointments) {
    if (a.status !== 'completed') continue
    if (a.start >= first && a.start <= endOfDay(now)) {
      const idx = differenceInCalendarDays(a.start, first)
      if (series[idx]) series[idx].revenue += a.price
      total += a.price
    } else if (a.start >= prevStart && a.start < first) {
      previous += a.price
    }
  }

  return { series, total, change: pctChange(total, previous) }
}
