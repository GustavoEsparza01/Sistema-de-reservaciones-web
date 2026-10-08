import { useEffect, useState } from 'react'
import { addMinutes, differenceInMinutes, isSameDay, startOfDay } from 'date-fns'
import { cn } from '../../../lib/cn'
import { getStatus } from '../../../lib/appointmentStatus'
import { formatTime } from '../../../lib/format'
import { SLOT_STEP, minutesToHHMM, shiftFor } from '../../../lib/availability'

export const PX_PER_MIN = 1.6 // 30 min = 48 px

const BLOCK_TONES = {
  pending:   'bg-amber-50 border-amber-500 text-amber-900',
  accepted:  'bg-blue-50 border-primary text-blue-950',
  completed: 'bg-emerald-50 border-emerald-600 text-emerald-950',
  cancelled: 'bg-surface-container-low border-outline text-on-surface-variant line-through decoration-outline/60',
}

/** Rango de horas a mostrar (en minutos), según turnos y citas de las columnas. */
export function visibleRange(columns) {
  let start = Infinity
  let end = -Infinity
  for (const c of columns) {
    const shift = shiftFor(c.schedule, c.date)
    if (shift) {
      start = Math.min(start, shift.start)
      end = Math.max(end, shift.end)
    }
    for (const a of c.appointments) {
      const s = differenceInMinutes(a.start, startOfDay(a.start))
      start = Math.min(start, s)
      end = Math.max(end, s + (a.duration ?? 30))
    }
  }
  if (!Number.isFinite(start)) return { start: 9 * 60, end: 20 * 60 }
  return { start: Math.floor(start / 60) * 60, end: Math.min(24 * 60, Math.ceil(end / 60) * 60) }
}

// Citas que se enciman (por ejemplo, una cancelada y la nueva) se acomodan en
// carriles. Solo se angostan las citas de cada grupo que se cruza.
function assignLanes(appointments) {
  const sorted = [...appointments].sort((a, b) => a.start - b.start)
  const placed = []
  let group = []
  let groupEnd = null
  let lanes = []

  const closeGroup = () => {
    for (const p of group) p.laneCount = Math.max(1, lanes.length)
    group = []
    lanes = []
  }

  for (const a of sorted) {
    const end = a.end ?? addMinutes(a.start, a.duration ?? 30)
    if (groupEnd && a.start >= groupEnd) closeGroup()
    let lane = lanes.findIndex((laneEnd) => laneEnd <= a.start)
    if (lane === -1) {
      lane = lanes.length
      lanes.push(end)
    } else lanes[lane] = end
    const p = { a, lane, end, laneCount: 1 }
    group.push(p)
    placed.push(p)
    // El grupo termina cuando acaba la última de sus citas
    groupEnd = group.length === 1 || end > groupEnd ? end : groupEnd
  }
  closeGroup()
  return placed
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])
  return now
}

/**
 * Cuadrícula de horas con una columna por barbero (vista Día) o por día (vista Semana).
 * columns: [{ key, header (nodo), date, schedule, appointments }]
 */
export default function TimeGrid({ columns, onSlotClick, onOpen, minColumnWidth = 180 }) {
  const now = useNow()
  const range = visibleRange(columns)
  const height = (range.end - range.start) * PX_PER_MIN
  const hours = []
  for (let m = range.start; m <= range.end; m += 60) hours.push(m)
  const slots = []
  for (let m = range.start; m < range.end; m += SLOT_STEP) slots.push(m)

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-full"
        style={{ gridTemplateColumns: `64px repeat(${columns.length}, minmax(${minColumnWidth}px, 1fr))` }}
      >
        {/* Encabezados */}
        <div className="sticky left-0 z-20 bg-surface-container-low border-b border-r border-outline-variant" />
        {columns.map((c) => (
          <div key={c.key} className="border-b border-r last:border-r-0 border-outline-variant bg-surface-container-low px-3 py-2 min-w-0">
            {c.header}
          </div>
        ))}

        {/* Horas */}
        <div className="sticky left-0 z-10 bg-surface-container-lowest border-r border-outline-variant" style={{ height }}>
          {hours.map((m) => (
            <span
              key={m}
              className={cn('absolute right-2 text-[11px] tabular-nums text-on-surface-variant', m === range.start ? 'translate-y-0.5' : m === range.end ? '-translate-y-full' : '-translate-y-1/2')}
              style={{ top: (m - range.start) * PX_PER_MIN }}
            >
              {minutesToHHMM(m)}
            </span>
          ))}
        </div>

        {/* Columnas */}
        {columns.map((c) => {
          const shift = shiftFor(c.schedule, c.date)
          const placed = assignLanes(c.appointments)
          const dayStart = startOfDay(c.date)
          const showNow = isSameDay(c.date, now)
          const nowMin = differenceInMinutes(now, dayStart)

          return (
            <div key={c.key} className="relative border-r last:border-r-0 border-outline-variant bg-surface-container-lowest" style={{ height }}>
              {/* Fuera de turno */}
              {!shift ? (
                <div className="absolute inset-0 bg-surface-container-low/70 flex items-start justify-center pt-6">
                  <span className="text-body-sm text-outline">Descanso</span>
                </div>
              ) : (
                <>
                  {shift.start > range.start && (
                    <div className="absolute inset-x-0 top-0 bg-surface-container-low/70" style={{ height: (shift.start - range.start) * PX_PER_MIN }} />
                  )}
                  {shift.end < range.end && (
                    <div className="absolute inset-x-0 bottom-0 bg-surface-container-low/70" style={{ height: (range.end - shift.end) * PX_PER_MIN }} />
                  )}
                </>
              )}

              {/* Líneas y huecos para crear citas */}
              {slots.map((m) => {
                const slotStart = addMinutes(dayStart, m)
                const usable = shift && m >= shift.start && m < shift.end && slotStart >= addMinutes(now, -SLOT_STEP + 1)
                return (
                  <button
                    key={m}
                    type="button"
                    tabIndex={usable ? 0 : -1}
                    disabled={!usable || !onSlotClick}
                    onClick={() => onSlotClick?.(c, minutesToHHMM(m))}
                    aria-label={usable ? `Nueva cita a las ${minutesToHHMM(m)}` : undefined}
                    className={cn(
                      'absolute inset-x-0 border-t',
                      m % 60 === 0 ? 'border-outline-variant' : 'border-outline-variant/50 border-dashed',
                      usable && onSlotClick ? 'hover:bg-primary-fixed/30 cursor-pointer' : 'cursor-default'
                    )}
                    style={{ top: (m - range.start) * PX_PER_MIN, height: SLOT_STEP * PX_PER_MIN }}
                  />
                )
              })}

              {/* Citas */}
              {placed.map(({ a, lane, end, laneCount }) => {
                const top = (differenceInMinutes(a.start, dayStart) - range.start) * PX_PER_MIN
                const h = Math.max(22, differenceInMinutes(end, a.start) * PX_PER_MIN - 2)
                const width = 100 / laneCount
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onOpen(a)}
                    title={`${formatTime(a.start)} – ${formatTime(end)} · ${a.clientName} · ${a.serviceName} · ${getStatus(a.status).label}`}
                    className={cn(
                      'absolute z-[5] rounded-md border-l-[3px] px-2 py-1 text-left overflow-hidden shadow-sm',
                      'hover:shadow-md hover:z-10 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      BLOCK_TONES[a.status] ?? BLOCK_TONES.accepted
                    )}
                    style={{ top: top + 1, height: h, left: `calc(${lane * width}% + 3px)`, width: `calc(${width}% - 6px)` }}
                  >
                    <p className="text-[11px] tabular-nums opacity-80 leading-tight">{formatTime(a.start)} – {formatTime(end)}</p>
                    <p className="text-[12px] font-semibold leading-tight truncate">{a.clientName}</p>
                    {h > 56 && <p className="text-[11px] leading-tight truncate opacity-80">{a.serviceName}</p>}
                  </button>
                )
              })}

              {/* Hora actual */}
              {showNow && nowMin >= range.start && nowMin <= range.end && (
                <div className="absolute inset-x-0 z-[6] pointer-events-none" style={{ top: (nowMin - range.start) * PX_PER_MIN }}>
                  <div className="h-0.5 bg-rose-500" />
                  <div className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-rose-500" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
