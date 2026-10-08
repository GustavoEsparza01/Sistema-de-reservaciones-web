import { useId, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardHeader, Skeleton } from '../../ui'
import { formatDate, formatDayMonth, formatMoney, formatMoneyMXN } from '../../../lib/format'
import { revenueSeries } from '../../../lib/resumenStats'
import { cn } from '../../../lib/cn'

const RANGES = [7, 30, 90]

// Colores del gráfico (paleta A). El azul pasó el validador de contraste.
const LINE = '#2563EB'
const GRID = '#E2E8F0'
const AXIS_TEXT = '#475569'

const compactMoney = (v) => (v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `$${v}`)

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { date, revenue } = payload[0].payload
  return (
    <div className="bg-inverse-surface text-inverse-on-surface rounded-lg shadow-xl px-3 py-2 text-body-sm">
      <p className="text-slate-300">{formatDate(date)}</p>
      <p className="font-body-semibold text-white tabular-nums">{formatMoneyMXN(revenue)}</p>
    </div>
  )
}

/** Ingresos de citas completadas por día (7, 30 o 90 días). */
export default function RevenueChart({ appointments, loading }) {
  const [days, setDays] = useState(30)
  const gradientId = useId().replace(/:/g, '')
  const { series, total, change } = useMemo(() => revenueSeries(appointments, days), [appointments, days])
  const hasData = series.some((d) => d.revenue > 0)
  const Trend = change != null && change < 0 ? TrendingDown : TrendingUp

  return (
    <Card className="flex flex-col gap-space-md">
      <CardHeader
        title={`Ingresos de los últimos ${days} días`}
        description="Suma de las citas completadas"
        action={
          <div role="group" aria-label="Periodo de la gráfica" className="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-container-low border border-outline-variant">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={days === r}
                onClick={() => setDays(r)}
                className={cn(
                  'h-7 px-2.5 rounded-md text-body-sm font-body-medium transition-colors',
                  days === r ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                {r} días
              </button>
            ))}
          </div>
        }
      />

      {loading ? (
        <>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-[220px] w-full" />
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-baseline gap-x-space-sm gap-y-1">
            <span className="font-numeric-metric text-numeric-metric tabular-nums">{formatMoney(total)}</span>
            <span className="text-body-sm text-on-surface-variant">MXN</span>
            {change != null && (
              <span className={cn('inline-flex items-center gap-1 text-body-sm font-body-medium', change >= 0 ? 'text-emerald-700' : 'text-rose-600')}>
                <Trend size={14} strokeWidth={2} aria-hidden />
                {`${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
                <span className="text-on-surface-variant font-normal">vs. {days} días anteriores</span>
              </span>
            )}
          </div>

          {hasData ? (
            <div className="h-[220px] -ml-2" aria-label={`Gráfica de ingresos diarios, total ${formatMoneyMXN(total)}`} role="img">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={LINE} stopOpacity={0.14} />
                      <stop offset="100%" stopColor={LINE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDayMonth}
                    tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: GRID }}
                    minTickGap={28}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickFormatter={compactMoney}
                    tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={52}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: AXIS_TEXT, strokeDasharray: '3 3' }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={LINE}
                    strokeWidth={2}
                    fill={`url(#${gradientId})`}
                    activeDot={{ r: 5, fill: LINE, stroke: '#FFFFFF', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center rounded-lg bg-surface-container-low text-body-sm text-on-surface-variant">
              Aún no hay citas completadas en este periodo.
            </div>
          )}
        </>
      )}
    </Card>
  )
}
