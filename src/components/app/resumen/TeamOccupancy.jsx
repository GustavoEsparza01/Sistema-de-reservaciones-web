import { Users } from 'lucide-react'
import { Avatar, Card, CardHeader, EmptyState, Skeleton } from '../../ui'
import { formatDuration } from '../../../lib/format'
import { cn } from '../../../lib/cn'

/** Ocupación de cada barbero hoy, según su horario. */
export default function TeamOccupancy({ rows, loading }) {
  const working = rows.filter((r) => r.working).length

  return (
    <Card className="flex flex-col gap-space-md">
      <CardHeader
        title="Ocupación del equipo hoy"
        description={loading ? ' ' : `${working} ${working === 1 ? 'barbero' : 'barberos'} en turno`}
      />

      {loading ? (
        <div className="flex flex-col gap-space-md">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState icon={Users} title="Sin barberos activos" description="Activa barberos en el panel anterior." className="py-space-lg" />
      ) : (
        <ul className="flex flex-col gap-space-md">
          {rows.map((r) => {
            const pct = Math.round(r.ratio * 100)
            return (
              <li key={r.id} className="flex items-center gap-space-sm">
                <Avatar name={r.name} size="sm" />
                <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-space-sm">
                    <span className="font-body-medium text-body-sm text-on-surface truncate">{r.name}</span>
                    <span className="text-body-sm font-body-semibold tabular-nums text-on-surface">
                      {r.working ? `${pct}%` : ''}
                    </span>
                  </div>
                  {r.working ? (
                    <>
                      <div
                        className="h-1.5 rounded-full bg-surface-container-high overflow-hidden"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Ocupación de ${r.name}`}
                      >
                        <div
                          className={cn('h-full rounded-full', pct >= 90 ? 'bg-amber-500' : 'bg-primary')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[12px] text-on-surface-variant tabular-nums">
                        {r.count} {r.count === 1 ? 'cita' : 'citas'} · {formatDuration(r.bookedMin)} de {formatDuration(r.availableMin)}
                      </span>
                    </>
                  ) : (
                    <span className="text-[12px] text-outline">Descansa hoy</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
