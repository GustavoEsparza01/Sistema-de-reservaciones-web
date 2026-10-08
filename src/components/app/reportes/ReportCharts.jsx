import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardHeader, EmptyState, Skeleton } from '../../ui'
import { cn } from '../../../lib/cn'
import { getStatus } from '../../../lib/appointmentStatus'
import { formatDate, formatDayMonth, formatMoneyMXN, formatPercent } from '../../../lib/format'
import { revenueBuckets } from '../../../lib/reportStats'
import { BarChart3 } from 'lucide-react'

// Colores de la paleta A (el azul pasó el validador de contraste)
const BAR = '#2563EB'
const GRID = '#E2E8F0'
const AXIS_TEXT = '#475569'

const compactMoney = (v) => (v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `$${v}`)
const noDots = (s) => s.replace(/\./g, '')

function Segmented({ value, onChange, options, label }) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-container-low border border-outline-variant">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={cn(
            'h-7 px-2.5 rounded-md text-body-sm font-body-medium transition-colors',
            value === v ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          {text}
        </button>
      ))}
    </div>
  )
}

function RevenueTooltip({ active, payload, granularity }) {
  if (!active || !payload?.length) return null
  const { date, revenue, count } = payload[0].payload
  return (
    <div className="bg-inverse-surface text-inverse-on-surface rounded-lg shadow-xl px-3 py-2 text-body-sm">
      <p className="text-slate-300">{granularity === 'semana' ? `Semana del ${formatDate(date)}` : formatDate(date)}</p>
      <p className="font-body-semibold text-white tabular-nums">{formatMoneyMXN(revenue)}</p>
      <p className="text-slate-300 tabular-nums">{count} {count === 1 ? 'cita completada' : 'citas completadas'}</p>
    </div>
  )
}

/** Ingresos por día o por semana. */
export function RevenueChart({ appointments, range, total, loading }) {
  const [granularity, setGranularity] = useState('dia')
  const data = revenueBuckets(appointments, range, granularity)
  const hasData = data.some((d) => d.revenue > 0)

  return (
    <Card className="flex flex-col gap-space-md">
      <CardHeader
        title={granularity === 'semana' ? 'Ingresos por semana' : 'Ingresos por día'}
        description={loading ? ' ' : `${formatMoneyMXN(total)} de citas completadas en el periodo`}
        action={<Segmented label="Agrupar por" value={granularity} onChange={setGranularity} options={[['dia', 'Día'], ['semana', 'Semana']]} />}
      />
      {loading ? (
        <Skeleton className="h-[260px] w-full" />
      ) : hasData ? (
        <div className="h-[260px] -ml-2" role="img" aria-label={`Gráfica de ingresos, total ${formatMoneyMXN(total)}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap={data.length > 20 ? 2 : '20%'}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => (granularity === 'semana' ? noDots(format(d, 'd MMM', { locale: es })) : formatDayMonth(d))}
                tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: GRID }}
                minTickGap={24}
                interval="preserveStartEnd"
              />
              <YAxis tickFormatter={compactMoney} tick={{ fill: AXIS_TEXT, fontSize: 12 }} tickLine={false} axisLine={false} width={52} allowDecimals={false} />
              <Tooltip content={<RevenueTooltip granularity={granularity} />} cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }} />
              <Bar dataKey="revenue" fill={BAR} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[260px] flex items-center justify-center rounded-lg bg-surface-container-low text-body-sm text-on-surface-variant">
          No hay citas completadas en este periodo.
        </div>
      )}
    </Card>
  )
}

const STATUS_BAR = {
  completed: 'bg-emerald-600',
  accepted: 'bg-primary',
  pending: 'bg-amber-500',
  cancelled: 'bg-slate-400',
}

/** Citas por estado: barras horizontales con número y porcentaje. */
export function StatusBreakdown({ rows, total, loading }) {
  return (
    <Card className="flex flex-col gap-space-md">
      <CardHeader title="Citas por estado" description={loading ? ' ' : `${total} ${total === 1 ? 'cita registrada' : 'citas registradas'}`} />
      {loading ? (
        <div className="flex flex-col gap-space-md">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
      ) : total === 0 ? (
        <EmptyState icon={BarChart3} title="Sin citas" description="No hay citas en este periodo." className="py-space-md" />
      ) : (
        <ul className="flex flex-col gap-space-md">
          {rows.map((r) => (
            <li key={r.status} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-space-sm text-body-sm">
                <span className="font-body-medium text-on-surface">{getStatus(r.status).label}</span>
                <span className="tabular-nums text-on-surface">
                  {r.count} <span className="text-on-surface-variant">· {formatPercent(r.share)}</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div className={cn('h-full rounded-full', STATUS_BAR[r.status])} style={{ width: `${r.share * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

/** Servicios más solicitados (citas completadas). */
export function TopServices({ rows, loading }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <Card className="flex flex-col gap-space-md">
      <CardHeader title="Servicios más solicitados" description="Por citas completadas y lo que recaudaron" />
      {loading ? (
        <div className="flex flex-col gap-space-md">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon={BarChart3} title="Sin datos" description="No hay citas completadas en este periodo." className="py-space-md" />
      ) : (
        <ol className="flex flex-col gap-space-md">
          {rows.map((r, i) => (
            <li key={r.name} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-space-sm text-body-sm">
                <span className="font-body-medium text-on-surface truncate">{i + 1}. {r.name}</span>
                <span className="tabular-nums text-on-surface whitespace-nowrap">
                  {r.count} {r.count === 1 ? 'cita' : 'citas'} <span className="text-on-surface-variant">· {formatMoneyMXN(r.revenue)}</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
