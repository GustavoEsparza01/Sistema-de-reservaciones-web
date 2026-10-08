// Página TEMPORAL para revisar los componentes base. Se borra al cerrar la Fase 1.
import { useState } from 'react'
import {
  CalendarCheck, Banknote, Clock, CircleX, Download, Plus, Search, Trash2, CalendarX, Mail,
} from 'lucide-react'
import {
  Avatar, Badge, Button, Card, CardHeader, Drawer, EmptyState, Input, KpiCard, Modal, Select,
  Skeleton, StatusBadge, Table, Tabs, useToast,
} from '../../components/ui'

const EJEMPLO_CITAS = [
  { id: 1, hora: '10:00', cliente: 'Rodrigo Morales', servicio: 'Corte clásico', barbero: 'Mateo Silva', status: 'completed', precio: 250 },
  { id: 2, hora: '10:45', cliente: 'Alejandro Peña', servicio: 'Afeitado toalla caliente', barbero: 'Diego Luna', status: 'accepted', precio: 200 },
  { id: 3, hora: '11:30', cliente: 'Gabriel Torres', servicio: 'Corte + barba', barbero: 'Javier Rivas', status: 'pending', precio: 350 },
  { id: 4, hora: '13:00', cliente: 'Luis Fernando Soto', servicio: 'Corte ejecutivo', barbero: 'Andrés Castro', status: 'cancelled', precio: 280 },
]

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-space-md">
      <h2 className="font-table-header text-table-header uppercase text-on-surface-variant">{title}</h2>
      {children}
    </section>
  )
}

export default function UiPreview() {
  const toast = useToast()
  const [tab, setTab] = useState('todas')
  const [drawer, setDrawer] = useState(null)
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const columns = [
    { key: 'hora', header: 'Hora', width: 80, className: 'font-body-semibold tabular-nums' },
    {
      key: 'cliente', header: 'Cliente',
      render: (r) => (
        <div className="flex items-center gap-space-sm">
          <Avatar name={r.cliente} size="sm" />
          <span className="font-body-medium">{r.cliente}</span>
        </div>
      ),
    },
    { key: 'servicio', header: 'Servicio', className: 'text-on-surface-variant' },
    { key: 'barbero', header: 'Barbero', className: 'text-on-surface-variant' },
    { key: 'status', header: 'Estado', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'precio', header: 'Importe', align: 'right', className: 'tabular-nums', render: (r) => `$${r.precio} MXN` },
  ]

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface">
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin py-space-xl flex flex-col gap-space-xl">
        <header>
          <h1 className="font-headline-page text-headline-page">Componentes base</h1>
          <p className="text-body-default text-on-surface-variant">
            Página temporal de la Fase 1 para revisar los componentes de <code>src/components/ui</code>. Los datos son de ejemplo.
          </p>
        </header>

        <Section title="Botones">
          <div className="flex flex-wrap items-center gap-space-sm">
            <Button icon={Plus}>Nueva cita</Button>
            <Button variant="secondary" icon={Download}>Exportar</Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="danger" icon={Trash2}>Eliminar</Button>
            <Button size="sm">Confirmar</Button>
            <Button size="sm" variant="secondary">Completar</Button>
            <Button variant="secondary" size="icon" icon={Search} aria-label="Buscar" />
            <Button loading>Guardando</Button>
            <Button disabled>Deshabilitado</Button>
          </div>
        </Section>

        <Section title="Insignias y avatares">
          <div className="flex flex-wrap items-center gap-space-sm">
            <StatusBadge status="pending" />
            <StatusBadge status="accepted" />
            <StatusBadge status="completed" />
            <StatusBadge status="cancelled" />
            <Badge>Neutral</Badge>
            <Badge tone="primary">Nuevo</Badge>
            <span className="w-px h-6 bg-outline-variant mx-space-sm" />
            <Avatar name="Carlos Ramírez" size="sm" />
            <Avatar name="Mateo Silva" />
            <Avatar name="Diego Luna" size="lg" />
          </div>
        </Section>

        <Section title="Tarjetas de indicadores">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <KpiCard label="Citas de hoy" value="12" unit="citas" icon={CalendarCheck} change={20} changeText="+2 citas" changeLabel="vs. lunes anterior" />
            <KpiCard label="Ingresos de hoy" value="$2,850" unit="MXN" icon={Banknote} change={14.2} changeLabel="vs. lunes anterior" />
            <KpiCard label="Pendientes" value="3" unit="citas" icon={Clock}>
              <Button size="sm" variant="secondary" className="self-start">Revisar</Button>
            </KpiCard>
            <KpiCard label="Cancelación del mes" value="6%" icon={CircleX} change={-1.8} lowerIsBetter changeLabel="vs. mes anterior" />
          </div>
        </Section>

        <Section title="Formulario">
          <Card className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <Input label="Nombre del cliente" placeholder="Ej. Rodrigo Morales" required />
            <Input label="Correo" icon={Mail} type="email" placeholder="cliente@correo.com" hint="Le enviaremos la confirmación." />
            <Input label="Teléfono" defaultValue="55 12" error="El teléfono debe tener 10 dígitos." />
            <Select
              label="Barbero"
              placeholder="Selecciona un barbero"
              options={[{ value: '1', label: 'Mateo Silva' }, { value: '2', label: 'Diego Luna' }]}
            />
            <Input label="Fecha" type="date" />
            <Input label="Deshabilitado" value="No editable" disabled readOnly />
          </Card>
        </Section>

        <Section title="Tabla, pestañas, panel lateral y estados">
          <Card padding={false} className="overflow-hidden">
            <div className="p-5 pb-0 flex flex-col gap-space-sm">
              <CardHeader
                title="Citas de hoy"
                description="Haz clic en una fila para abrir el panel lateral."
                action={<Button size="sm" variant="secondary" onClick={() => setLoading((v) => !v)}>{loading ? 'Ver datos' : 'Ver carga'}</Button>}
              />
              <Tabs
                value={tab}
                onChange={setTab}
                items={[
                  { value: 'todas', label: 'Todas', count: 4 },
                  { value: 'pendientes', label: 'Pendientes', count: 1 },
                  { value: 'vacia', label: 'Sin resultados', count: 0 },
                ]}
              />
            </div>
            <Table
              columns={columns}
              rows={tab === 'vacia' ? [] : tab === 'pendientes' ? EJEMPLO_CITAS.filter((c) => c.status === 'pending') : EJEMPLO_CITAS}
              loading={loading}
              onRowClick={setDrawer}
              empty={
                <EmptyState
                  icon={CalendarX}
                  title="No hay citas"
                  description="Cuando un cliente reserve, sus citas aparecerán aquí."
                  action={<Button size="sm" icon={Plus}>Nueva cita</Button>}
                />
              }
            />
          </Card>
        </Section>

        <Section title="Modal, avisos y carga">
          <div className="flex flex-wrap items-center gap-space-sm">
            <Button variant="danger" onClick={() => setModal(true)}>Cancelar cita…</Button>
            <Button variant="secondary" onClick={() => toast({ title: 'Cita confirmada', description: 'Rodrigo Morales · 10:00 h' })}>Aviso de éxito</Button>
            <Button variant="secondary" onClick={() => toast({ tone: 'error', title: 'No se pudo guardar', description: 'Revisa tu conexión e inténtalo de nuevo.' })}>Aviso de error</Button>
            <Button variant="secondary" onClick={() => toast({ tone: 'info', title: 'Hay 3 citas por confirmar' })}>Aviso informativo</Button>
          </div>
          <Card className="flex flex-col gap-space-sm max-w-md">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </Card>
        </Section>
      </div>

      <Drawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title="Detalle de la cita"
        subtitle={drawer ? `${drawer.hora} h · ${drawer.servicio}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer(null)}>Cerrar</Button>
            <Button onClick={() => { setDrawer(null); toast({ title: 'Cita completada' }) }}>Marcar completada</Button>
          </>
        }
      >
        {drawer && (
          <dl className="flex flex-col gap-space-md text-body-default">
            <div className="flex items-center gap-space-sm">
              <Avatar name={drawer.cliente} size="lg" />
              <div>
                <dt className="sr-only">Cliente</dt>
                <dd className="font-body-semibold">{drawer.cliente}</dd>
                <dd><StatusBadge status={drawer.status} /></dd>
              </div>
            </div>
            <div><dt className="text-body-sm text-on-surface-variant">Barbero</dt><dd>{drawer.barbero}</dd></div>
            <div><dt className="text-body-sm text-on-surface-variant">Importe</dt><dd>${drawer.precio} MXN</dd></div>
          </dl>
        )}
      </Drawer>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        size="sm"
        title="¿Cancelar la cita?"
        description="Se avisará al cliente y el horario quedará libre. Esta acción no se puede deshacer."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>Volver</Button>
            <Button variant="danger" onClick={() => { setModal(false); toast({ title: 'Cita cancelada' }) }}>Cancelar cita</Button>
          </>
        }
      />
    </div>
  )
}
