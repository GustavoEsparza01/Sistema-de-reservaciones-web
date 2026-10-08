import { useEffect, useState } from 'react'
import { CalendarClock, CalendarDays, Clock, MessageCircle, Phone, Scissors, StickyNote, User } from 'lucide-react'
import { Avatar, Button, Drawer, StatusBadge } from '../../ui'
import { formatDateLong, formatDuration, formatMoneyMXN, formatTime } from '../../../lib/format'
import { countClientVisits, telLink, whatsappLink } from '../../../lib/appointments'

// Número de citas completadas del cliente de la cita abierta
function useClientVisits(clientId) {
  const [visits, setVisits] = useState(null)
  useEffect(() => {
    let alive = true
    setVisits(null)
    if (clientId) countClientVisits(clientId).then((n) => alive && setVisits(n))
    return () => { alive = false }
  }, [clientId])
  return visits
}

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
export default function AppointmentDrawer({ appointment: a, onClose, busy, onChangeStatus, onRequestCancel, onReschedule }) {
  const visits = useClientVisits(a?.clientId)
  const tel = telLink(a?.clientPhone)
  const wa = whatsappLink(a?.clientPhone)
  const footer = a && (a.status === 'pending' || a.status === 'accepted') && (
    <>
      {onReschedule && (
        <Button variant="secondary" icon={CalendarClock} disabled={busy} onClick={() => onReschedule(a)} className="mr-auto">
          Reprogramar
        </Button>
      )}
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
      subtitle={a ? `${formatDateLong(a.start)} · ${formatTime(a.start)} h` : ''}
      footer={footer || null}
    >
      {a && (
        <div className="flex flex-col gap-space-lg">
          <div className="flex items-center gap-space-md">
            <Avatar name={a.clientName} size="lg" />
            <div className="min-w-0 flex flex-col gap-1 items-start">
              <p className="font-body-semibold text-body-semibold text-on-surface truncate max-w-full">{a.clientName}</p>
              <div className="flex flex-wrap items-center gap-space-sm">
                <StatusBadge status={a.status} />
                {visits != null && (
                  <span className="text-body-sm text-on-surface-variant">
                    {visits === 0 ? 'Primera visita' : `${visits} ${visits === 1 ? 'visita' : 'visitas'}`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {(tel || wa) && (
            <div className="flex gap-space-sm">
              {tel && <Button as="a" href={tel} variant="secondary" size="sm" icon={Phone} className="flex-1 justify-center">Llamar</Button>}
              {wa && (
                <Button as="a" href={wa} target="_blank" rel="noreferrer" variant="secondary" size="sm" icon={MessageCircle} className="flex-1 justify-center">
                  WhatsApp
                </Button>
              )}
            </div>
          )}

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
