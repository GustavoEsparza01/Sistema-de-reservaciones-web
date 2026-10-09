import { useState } from 'react'
import { updateAppointmentStatus } from '../../lib/appointments'
import { formatDateLong, formatTime } from '../../lib/format'
import { Button, Modal, useToast } from '../ui'
import AppointmentFormModal from '../app/appointments/AppointmentFormModal'

/**
 * Modales de cancelar y reprogramar para el cliente. Uso:
 *   const actions = useClientAppointmentActions(reload)
 *   actions.cancel(a) / actions.reschedule(a) y renderizar {actions.modals}
 */
export function useClientAppointmentActions(onChanged) {
  const toast = useToast()
  const [cancelling, setCancelling] = useState(null)
  const [busy, setBusy] = useState(false)
  const [rescheduling, setRescheduling] = useState(null)

  async function confirmCancel() {
    const a = cancelling
    setBusy(true)
    try {
      await updateAppointmentStatus(a.id, 'cancelled')
      setCancelling(null)
      toast({ tone: 'gold', title: 'Cita cancelada', description: 'El horario quedó libre. Puedes reservar otra cuando quieras.' })
      await onChanged?.()
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo cancelar la cita', description: 'Tu cita sigue activa. Revisa tu conexión e inténtalo de nuevo.' })
    } finally {
      setBusy(false)
    }
  }

  const modals = (
    <>
      <Modal
        open={!!cancelling}
        onClose={() => !busy && setCancelling(null)}
        size="sm"
        title="¿Cancelar tu cita?"
        description={
          cancelling
            ? `${cancelling.serviceName} el ${formatDateLong(cancelling.start)} a las ${formatTime(cancelling.start)} h. El horario quedará libre para otros clientes.`
            : ''
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelling(null)} disabled={busy}>Mantener cita</Button>
            <Button variant="danger" loading={busy} onClick={confirmCancel}>Sí, cancelar</Button>
          </>
        }
      />
      <AppointmentFormModal
        open={!!rescheduling}
        mode="reschedule"
        appointment={rescheduling}
        onClose={() => setRescheduling(null)}
        onDone={async (r) => {
          setRescheduling(null)
          toast({ tone: 'gold', title: 'Cita reprogramada', description: `${formatDateLong(r.start)} a las ${formatTime(r.start)} h con ${r.barberName}` })
          await onChanged?.()
        }}
      />
    </>
  )

  return { cancel: setCancelling, reschedule: setRescheduling, modals }
}
