import { Link } from 'react-router-dom'
import { CircleCheckBig } from 'lucide-react'
import { Avatar, Card, CardHeader, EmptyState, Skeleton } from '../../ui'
import { formatDayMonth, formatRelative, formatTime } from '../../../lib/format'
import { isToday } from 'date-fns'
import AppointmentActions from '../appointments/AppointmentActions'

/** Próximas citas pendientes de confirmar. */
export default function PendingList({ items, total, loading, busyId, onOpen, onChangeStatus, onRequestCancel }) {
  return (
    <Card className="flex flex-col gap-space-md">
      <CardHeader
        title="Pendientes por confirmar"
        description={loading ? ' ' : total > 0 ? `${total} ${total === 1 ? 'cita espera' : 'citas esperan'} tu confirmación` : null}
      />

      {loading ? (
        <div className="flex flex-col gap-space-sm">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={CircleCheckBig}
          title="Todo al día"
          description="No hay citas esperando confirmación."
          className="py-space-lg"
        />
      ) : (
        <ul className="flex flex-col divide-y divide-outline-variant -mx-space-sm">
          {items.map((a) => (
            <li key={a.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onOpen(a)}
                onKeyDown={(e) => e.key === 'Enter' && onOpen(a)}
                className="flex items-center gap-space-sm px-space-sm py-3 rounded-lg hover:bg-surface-container-low cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Avatar name={a.clientName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-body-medium text-body-sm text-on-surface truncate">{a.clientName}</p>
                  <p className="text-body-sm text-on-surface-variant truncate">
                    {a.serviceName} · {isToday(a.start) ? formatTime(a.start) : `${formatDayMonth(a.start)} ${formatTime(a.start)}`}
                    {isToday(a.start) && <span className="text-outline"> · {formatRelative(a.start)}</span>}
                  </p>
                </div>
                <AppointmentActions
                  appointment={a}
                  compact
                  busy={busyId === a.id}
                  onChangeStatus={onChangeStatus}
                  onRequestCancel={onRequestCancel}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && total > items.length && (
        <Link to="/app/citas?estado=pending" className="text-body-sm font-body-medium text-primary hover:underline">
          Ver las {total} pendientes
        </Link>
      )}
    </Card>
  )
}
