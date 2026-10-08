import { Check, CheckCheck, X } from 'lucide-react'
import { Button } from '../../ui'

/**
 * Acciones disponibles según el estado de la cita:
 * - pendiente: Confirmar / Rechazar
 * - confirmada: Completar / Cancelar
 * Rechazar y Cancelar piden confirmación (onRequestCancel).
 */
export default function AppointmentActions({ appointment, busy, onChangeStatus, onRequestCancel, compact = false }) {
  const stop = (fn) => (e) => {
    e.stopPropagation()
    fn()
  }

  if (appointment.status === 'pending') {
    return (
      <div className="flex items-center justify-end gap-space-xs">
        <Button size="sm" icon={Check} loading={busy} onClick={stop(() => onChangeStatus(appointment, 'accepted'))}>
          Confirmar
        </Button>
        <Button
          size={compact ? 'icon-sm' : 'sm'}
          variant="ghost"
          icon={X}
          disabled={busy}
          aria-label="Rechazar cita"
          onClick={stop(() => onRequestCancel(appointment))}
        >
          {compact ? null : 'Rechazar'}
        </Button>
      </div>
    )
  }

  if (appointment.status === 'accepted') {
    return (
      <div className="flex items-center justify-end gap-space-xs">
        <Button size="sm" variant="secondary" icon={CheckCheck} loading={busy} onClick={stop(() => onChangeStatus(appointment, 'completed'))}>
          Completar
        </Button>
        {!compact && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={stop(() => onRequestCancel(appointment))}>
            Cancelar
          </Button>
        )}
      </div>
    )
  }

  return null
}
