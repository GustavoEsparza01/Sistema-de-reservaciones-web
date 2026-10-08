// Formato de datos para mostrar al usuario (español de México).
// Las fechas se muestran en la zona horaria del navegador, que para
// los negocios actuales es America/Mexico_City.
import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// Sin centavos cuando la cantidad es entera; con dos decimales cuando no
const moneyWhole = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
const moneyCents = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 })

const numberFormatter = new Intl.NumberFormat('es-MX')

function toDate(value) {
  if (value == null) return null
  const d = value instanceof Date ? value : typeof value === 'string' ? parseISO(value) : new Date(value)
  return isValid(d) ? d : null
}

// date-fns abrevia con punto ("lun.", "oct."); el diseño los usa sin punto
const noDots = (s) => s.replace(/\./g, '')

/** 2850 → "$2,850"  ·  2850.5 → "$2,850.50" */
export function formatMoney(amount) {
  if (amount == null || amount === '') return '—'
  const n = Number(amount)
  if (!Number.isFinite(n)) return '—'
  return Number.isInteger(n) ? moneyWhole.format(n) : moneyCents.format(n)
}

/** 2850 → "$2,850 MXN" */
export function formatMoneyMXN(amount) {
  const text = formatMoney(amount)
  return text === '—' ? text : `${text} MXN`
}

/** 1234 → "1,234" */
export function formatNumber(n) {
  if (n == null || n === '') return '—'
  return Number.isFinite(Number(n)) ? numberFormatter.format(Number(n)) : '—'
}

/** 0.0612 → "6.1%" (recibe una fracción) */
export function formatPercent(fraction, decimals = 1) {
  if (fraction == null || fraction === '') return '—'
  const n = Number(fraction)
  if (!Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(decimals).replace(/\.0+$/, '')}%`
}

/** → "lun 12 oct 2026" */
export function formatDate(value) {
  const d = toDate(value)
  return d ? noDots(format(d, 'EEE d MMM yyyy', { locale: es })) : '—'
}

/** → "12 oct" */
export function formatDayMonth(value) {
  const d = toDate(value)
  return d ? noDots(format(d, 'd MMM', { locale: es })) : '—'
}

/** → "lunes, 12 de octubre de 2026" */
export function formatDateLong(value) {
  const d = toDate(value)
  return d ? format(d, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : '—'
}

/** → "14:30" (24 h) */
export function formatTime(value) {
  const d = toDate(value)
  return d ? format(d, 'HH:mm') : '—'
}

/** → "lun 12 oct 2026 · 14:30" */
export function formatDateTime(value) {
  const d = toDate(value)
  return d ? `${formatDate(d)} · ${formatTime(d)}` : '—'
}

/** 90 → "1 h 30 min" · 45 → "45 min" */
export function formatDuration(minutes) {
  const m = Math.round(Number(minutes))
  if (!Number.isFinite(m) || m < 0) return '—'
  const h = Math.floor(m / 60)
  const rest = m % 60
  if (h === 0) return `${rest} min`
  return rest === 0 ? `${h} h` : `${h} h ${rest} min`
}

/** → "en 25 minutos" / "hace 2 horas" */
export function formatRelative(value) {
  const d = toDate(value)
  if (!d) return '—'
  const text = formatDistanceToNowStrict(d, { locale: es })
  return d > new Date() ? `en ${text}` : `hace ${text}`
}

/** Saludo según la hora: "Buenos días" / "Buenas tardes" / "Buenas noches" */
export function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}
