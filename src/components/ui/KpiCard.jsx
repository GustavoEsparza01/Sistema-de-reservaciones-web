import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '../../lib/cn'
import Card from './Card'
import Skeleton from './Skeleton'

/**
 * Tarjeta de indicador.
 * - change: número en % (o el texto que se pase en changeText) comparado con el periodo anterior
 * - lowerIsBetter: true cuando bajar es bueno (por ejemplo, tasa de cancelación)
 * - children: contenido extra abajo (desglose, enlace, barra de progreso)
 */
export default function KpiCard({
  label,
  value,
  unit,
  icon: Icon,
  change,
  changeText,
  changeLabel,
  lowerIsBetter = false,
  loading = false,
  className,
  children,
}) {
  const hasChange = typeof change === 'number' && Number.isFinite(change)
  const good = hasChange && (lowerIsBetter ? change <= 0 : change >= 0)
  const Trend = hasChange && change < 0 ? TrendingDown : TrendingUp

  return (
    <Card className={cn('flex flex-col gap-space-sm', className)}>
      <div className="flex items-center justify-between gap-space-sm">
        <span className="font-table-header text-table-header uppercase text-on-surface-variant">{label}</span>
        {Icon && <Icon size={18} strokeWidth={1.75} className="text-on-surface-variant" aria-hidden />}
      </div>

      {loading ? (
        <Skeleton className="h-9 w-28" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="font-numeric-metric text-numeric-metric text-on-surface tabular-nums">{value}</span>
          {unit && <span className="text-body-sm text-on-surface-variant">{unit}</span>}
        </div>
      )}

      {!loading && hasChange && (
        <div className="flex flex-wrap items-center gap-1.5 text-body-sm">
          <span className={cn('inline-flex items-center gap-1 font-body-medium', good ? 'text-emerald-700' : 'text-rose-600')}>
            <Trend size={14} strokeWidth={2} aria-hidden />
            {changeText ?? `${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
          </span>
          {changeLabel && <span className="text-on-surface-variant">{changeLabel}</span>}
        </div>
      )}

      {children}
    </Card>
  )
}
