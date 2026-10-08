import { useEffect, useId, useState } from 'react'
import { Button, Input, Modal, Select, Switch, Textarea } from '../../ui'
import { DESCRIPTION_MAX, DURATION_OPTIONS, validateService } from '../../../lib/services'
import { formatDuration } from '../../../lib/format'

const EMPTY = { name: '', description: '', price: '', duration: '30', active: true }

/**
 * Crear o editar un servicio.
 * - service: el servicio a editar (null para crear)
 * - initial: valores para precargar al crear (por ejemplo, al duplicar)
 */
export default function ServiceFormModal({ open, service, initial, existing, saving, onClose, onSubmit }) {
  const formId = useId()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    const base = service ?? initial
    setForm(
      base
        ? {
            name: base.name ?? '',
            description: base.description ?? '',
            price: String(base.price ?? ''),
            duration: String(base.duration ?? 30),
            active: base.active ?? true,
          }
        : EMPTY
    )
    setErrors({})
  }, [open, service, initial])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }))

  // Si la duración guardada no está en la lista (por ejemplo 50 min), se agrega
  const durations = DURATION_OPTIONS.includes(Number(form.duration))
    ? DURATION_OPTIONS
    : [...DURATION_OPTIONS, Number(form.duration)].filter(Boolean).sort((a, b) => a - b)

  function handleSubmit(e) {
    e.preventDefault()
    const { errors: found, values } = validateService(form, existing, service?.id ?? null)
    setErrors(found)
    if (Object.keys(found).length === 0) onSubmit(values)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={service ? 'Editar servicio' : 'Nuevo servicio'}
      description={service ? 'Los cambios de precio aplican a las citas nuevas; las ya reservadas conservan su precio.' : 'Agrega un servicio al catálogo de reservas.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" form={formId} loading={saving}>{service ? 'Guardar cambios' : 'Crear servicio'}</Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="flex flex-col gap-space-md">
        <Input
          label="Nombre del servicio"
          required
          autoFocus
          placeholder="Ej. Corte clásico"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
        />
        <Textarea
          label="Descripción para clientes"
          placeholder="Qué incluye el servicio"
          maxLength={DESCRIPTION_MAX}
          value={form.description}
          onChange={set('description')}
          error={errors.description}
        />
        <div className="grid grid-cols-2 gap-space-md">
          <Input
            label="Precio"
            required
            type="number"
            inputMode="decimal"
            min="0"
            step="10"
            suffix="MXN"
            value={form.price}
            onChange={set('price')}
            error={errors.price}
          />
          <Select
            label="Duración"
            required
            value={form.duration}
            onChange={set('duration')}
            error={errors.duration}
            options={durations.map((d) => ({ value: String(d), label: formatDuration(d) }))}
          />
        </div>
        <Switch
          checked={form.active}
          onChange={set('active')}
          label="Servicio activo"
          description="Los clientes pueden elegirlo al reservar."
          className="pt-space-xs"
        />
      </form>
    </Modal>
  )
}
