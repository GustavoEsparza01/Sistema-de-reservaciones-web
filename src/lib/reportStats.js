// Cálculos de la pantalla Reportes a partir de citas normalizadas.
import {
  addDays, differenceInCalendarDays, endOfMonth, format, parseISO, startOfMonth, startOfWeek, subDays, subMonths,
} from 'date-fns'
import { pctChange } from './resumenStats'

export const REPORT_PERIODS = [
  { value: 'hoy', label: 'Hoy' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: 'mes', label: 'Este mes' },
  { value: 'mes-anterior', label: 'Mes anterior' },
  { value: 'custom', label: 'Personalizado' },
]

const ymd = (d) => format(d, 'yyyy-MM-dd')

/** Fechas (yyyy-mm-dd) de un periodo predefinido. */
export function presetRange(period, now = new Date()) {
  switch (period) {
    case 'hoy': return { from: ymd(now), to: ymd(now) }
    case '7d': return { from: ymd(subDays(now, 6)), to: ymd(now) }
    case '30d': return { from: ymd(subDays(now, 29)), to: ymd(now) }
    case 'mes-anterior': {
      const prev = subMonths(now, 1)
      return { from: ymd(startOfMonth(prev)), to: ymd(endOfMonth(prev)) }
    }
    case 'mes':
    default:
      return { from: ymd(startOfMonth(now)), to: ymd(endOfMonth(now)) }
  }
}

/**
 * Periodo con el que se compara: si es un mes completo, el mes anterior completo;
 * si no, los mismos días justo antes del elegido.
 */
export function previousRange({ from, to }) {
  const start = parseISO(from)
  const end = parseISO(to)
  if (ymd(start) === ymd(startOfMonth(start)) && ymd(end) === ymd(endOfMonth(start))) {
    const prev = subMonths(start, 1)
    return { from: ymd(startOfMonth(prev)), to: ymd(endOfMonth(prev)), label: 'vs. mes anterior' }
  }
  const days = differenceInCalendarDays(end, start) + 1
  return {
    from: ymd(subDays(start, days)),
    to: ymd(subDays(start, 1)),
    label: days === 1 ? 'vs. día anterior' : `vs. ${days} días anteriores`,
  }
}

const completed = (list) => list.filter((a) => a.status === 'completed')
const sumPrice = (list) => list.reduce((s, a) => s + a.price, 0)

function summary(list) {
  const done = completed(list)
  const revenue = sumPrice(done)
  const cancelled = list.filter((a) => a.status === 'cancelled').length
  return {
    total: list.length,
    completed: done.length,
    revenue,
    avgTicket: done.length ? revenue / done.length : null,
    cancelRate: list.length ? cancelled / list.length : null,
    cancelled,
  }
}

/** Indicadores del periodo contra el anterior. */
export function reportKpis(current, previous) {
  const c = summary(current)
  const p = summary(previous)
  return {
    ...c,
    revenueChange: pctChange(c.revenue, p.revenue),
    completedChange: pctChange(c.completed, p.completed),
    avgTicketChange: c.avgTicket != null && p.avgTicket ? pctChange(c.avgTicket, p.avgTicket) : null,
    // diferencia en puntos porcentuales
    cancelDiffPoints: c.cancelRate != null && p.cancelRate != null ? (c.cancelRate - p.cancelRate) * 100 : null,
  }
}

/** Ingresos y citas completadas por día o por semana (lunes) dentro del rango. */
export function revenueBuckets(list, { from, to }, granularity = 'dia') {
  const start = parseISO(from)
  const end = parseISO(to)
  const buckets = new Map()

  if (granularity === 'semana') {
    for (let d = startOfWeek(start, { weekStartsOn: 1 }); d <= end; d = addDays(d, 7)) {
      buckets.set(ymd(d), { date: d, revenue: 0, count: 0 })
    }
  } else {
    for (let d = start; d <= end; d = addDays(d, 1)) buckets.set(ymd(d), { date: d, revenue: 0, count: 0 })
  }

  for (const a of completed(list)) {
    const key = ymd(granularity === 'semana' ? startOfWeek(a.start, { weekStartsOn: 1 }) : a.start)
    const b = buckets.get(key)
    if (b) {
      b.revenue += a.price
      b.count += 1
    }
  }
  return [...buckets.values()]
}

/** Cuántas citas hay en cada estado. */
export function statusBreakdown(list) {
  const order = ['completed', 'accepted', 'pending', 'cancelled']
  return order.map((status) => {
    const count = list.filter((a) => a.status === status).length
    return { status, count, share: list.length ? count / list.length : 0 }
  })
}

/** Servicios con más citas completadas y lo que recaudaron. */
export function topServices(list, limit = 5) {
  const map = new Map()
  for (const a of completed(list)) {
    const s = map.get(a.serviceName) ?? { name: a.serviceName, count: 0, revenue: 0 }
    s.count += 1
    s.revenue += a.price
    map.set(a.serviceName, s)
  }
  return [...map.values()].sort((x, y) => y.count - x.count || y.revenue - x.revenue).slice(0, limit)
}

/** Rendimiento de cada barbero en el periodo, más los totales. */
export function barberPerformance(list) {
  const map = new Map()
  for (const a of list) {
    const key = a.barberId ?? a.barberName
    const b = map.get(key) ?? { id: key, name: a.barberName, appointments: [] }
    b.appointments.push(a)
    map.set(key, b)
  }
  const rows = [...map.values()]
    .map((b) => ({ id: b.id, name: b.name, ...summary(b.appointments) }))
    .sort((x, y) => y.revenue - x.revenue || y.completed - x.completed)
  return { rows, totals: summary(list) }
}
