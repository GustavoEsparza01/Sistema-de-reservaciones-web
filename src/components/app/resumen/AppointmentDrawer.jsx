import { CalendarDays, Clock, Phone, Scissors, StickyNote, User } from 'lucide-react'
import { Avatar, Button, Drawer, StatusBadge } from '../../ui'
import { formatDateLong, formatDuration, formatMoneyMXN, formatTime } from '../../../lib/format'

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-space-sm">
      <Icon size={18} strokeWidth={1.75} className="text-on-surface-variant mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0">
        <dt className="text-body-sm text-on-surface-variant">{label}</dt>
        <dd className="text-body-default text-on-surface break-words">{children}</dd>
      </div>
    </div>
  )
}

/** Panel lateral con el detalle de una cita y sus acciones. */
export default function AppointmentDrawer({ appointment: a, onClose, busy, onChangeStatus, onRequestCancel }) {
  const footer = a && (a.status === 'pending' || a.status === 'accepted') && (
    <>
      <Button variant="ghost" disabled={busy} onClick={() => onRequestCancel(a)}>
        {a.status === 'pending' ? 'Rechazar' : 'Cancelar cita'}
      </Button>
      {a.status === 'pending' ? (
        <Button loading={busy} onClick={() => onChangeStatus(a, 'accepted')}>Confirmar</Button>
      ) : (
        <Button loading={busy} onClick={() => onChangeStatus(a, 'completed')}>Marcar completada</Button>
      )}
    </>
  )

  return (
    <Drawer
      open={!!a}
      onClose={onClose}
      title="Detalle de la cita"
      subtitle={a ? `${formatTime(a.start)} h · ${a.serviceName}` : ''}
      footer={footer || null}
    >
      {a && (
        <div className="flex flex-col gap-space-lg">
          <div className="flex items-center gap-space-md">
            <Avatar name={a.clientName} size="lg" />
            <div className="min-w-0 flex flex-col gap-1 items-start">
              <p className="font-body-semibold text-body-semibold text-on-surface truncate max-w-full">{a.clientName}</p>
              <StatusBadge status={a.status} />
            </div>
          </div>

          <dl className="flex flex-col gap-space-md">
            {a.clientPhone && <Row icon={Phone} label="Teléfono">{a.clientPhone}</Row>}
            <Row icon={CalendarDays} label="Fecha">
              <span className="capitalize">{formatDateLong(a.start)}</span>
            </Row>
            <Row icon={Clock} label="Horario">
              {formatTime(a.start)}{a.end ? ` – ${formatTime(a.end)}` : ''} h
              {a.duration ? ` (${formatDuration(a.duration)})` : ''}
            </Row>
            <Row icon={Scissors} label="Servicio">
              {a.serviceName} · <span className="tabular-nums">{formatMoneyMXN(a.price)}</span>
            </Row>
            <Row icon={User} label="Barbero">{a.barberName}</Row>
            {a.notes && <Row icon={StickyNote} label="Notas del cliente">{a.notes}</Row>}
          </dl>
        </div>
      )}
    </Drawer>
  )
}
