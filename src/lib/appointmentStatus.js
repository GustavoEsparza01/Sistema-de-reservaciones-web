// Estados de cita: valor en base de datos → etiqueta y tono de insignia
export const APPOINTMENT_STATUS = {
  pending:   { label: 'Pendiente',  tone: 'warning' },
  accepted:  { label: 'Confirmada', tone: 'primary' },
  completed: { label: 'Completada', tone: 'success' },
  cancelled: { label: 'Cancelada',  tone: 'danger'  },
}

export function getStatus(status) {
  return APPOINTMENT_STATUS[status] ?? { label: status ?? '—', tone: 'neutral' }
}
