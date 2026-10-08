// Pantalla Servicios del administrador (design/stitch/06-servicios).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Banknote, CircleAlert, Clock, Copy, Download, Pencil, Plus, RefreshCw, Scissors, Search, Store } from 'lucide-react'
import { createService, fetchServices, setServiceActive, updateService } from '../../lib/services'
import { downloadCsv, datedFileName } from '../../lib/csv'
import { formatDuration, formatMoney, formatMoneyMXN } from '../../lib/format'
import { Badge, Button, Card, EmptyState, Input, KpiCard, Table, Tabs, useToast } from '../../components/ui'
import ServiceFormModal from '../../components/app/servicios/ServiceFormModal'

const average = (list, key) => (list.length ? list.reduce((s, x) => s + x[key], 0) / list.length : null)

export default function Servicios() {
  const toast = useToast()
  const [state, setState] = useState({ services: [], loading: true, error: null })
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // { service } para editar, { initial } para crear
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
    try {
      setState({ services: await fetchServices(), loading: false, error: null })
    } catch (error) {
      console.error('Servicios:', error)
      setState((s) => ({ ...s, loading: false, error }))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const { services, loading, error } = state
  const active = services.filter((s) => s.active)
  const counts = { all: services.length, active: active.length, inactive: services.length - active.length }

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return services
      .filter((s) => (tab === 'active' ? s.active : tab === 'inactive' ? !s.active : true))
      .filter((s) => !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
  }, [services, tab, search])

  async function handleSubmit(values) {
    setSaving(true)
    try {
      if (modal?.service) {
        await updateService(modal.service.id, values)
        toast({ title: 'Servicio actualizado', description: values.name })
      } else {
        await createService(values)
        toast({ title: 'Servicio creado', description: values.name })
      }
      setModal(null)
      await load({ silent: true })
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo guardar el servicio', description: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(service) {
    setTogglingId(service.id)
    try {
      await setServiceActive(service.id, !service.active)
      toast({
        title: service.active ? 'Servicio desactivado' : 'Servicio activado',
        description: service.active ? `${service.name} ya no aparece al reservar.` : `${service.name} ya se puede reservar.`,
      })
      await load({ silent: true })
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo cambiar el estado', description: err.message })
    } finally {
      setTogglingId(null)
    }
  }

  function exportCsv() {
    downloadCsv(
      datedFileName('servicios'),
      ['Servicio', 'Descripción', 'Precio (MXN)', 'Duración (min)', 'Estado', 'Citas'],
      services.map((s) => [s.name, s.description, s.price, s.duration, s.active ? 'Activo' : 'Inactivo', s.bookings])
    )
  }

  const columns = [
    {
      key: 'servicio',
      header: 'Servicio',
      render: (s) => (
        <div className="flex items-center gap-space-sm min-w-[220px] max-w-[420px]">
          <div className="w-9 h-9 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
            <Scissors size={18} strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="font-body-medium truncate">{s.name}</p>
            {s.description && <p className="text-[12px] text-on-surface-variant truncate">{s.description}</p>}
          </div>
        </div>
      ),
    },
    { key: 'precio', header: 'Precio', align: 'right', className: 'tabular-nums whitespace-nowrap font-body-medium', render: (s) => formatMoneyMXN(s.price) },
    {
      key: 'duracion',
      header: 'Duración',
      className: 'text-on-surface-variant whitespace-nowrap',
      render: (s) => (
        <span className="inline-flex items-center gap-1.5">
          <Clock size={14} strokeWidth={1.75} aria-hidden /> {formatDuration(s.duration)}
        </span>
      ),
    },
    { key: 'citas', header: 'Citas', align: 'right', className: 'tabular-nums text-on-surface-variant', render: (s) => s.bookings },
    {
      key: 'estado',
      header: 'Estado',
      render: (s) => (s.active ? <Badge tone="success" dot>Activo</Badge> : <Badge dot>Inactivo</Badge>),
    },
    {
      key: 'acciones',
      header: <span className="sr-only">Acciones</span>,
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-space-xs" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon-sm" icon={Pencil} aria-label={`Editar ${s.name}`} title="Editar" onClick={() => setModal({ service: s })} />
          <Button
            variant="ghost"
            size="icon-sm"
            icon={Copy}
            aria-label={`Duplicar ${s.name}`}
            title="Duplicar"
            onClick={() => setModal({ initial: { ...s, name: `${s.name} (copia)` } })}
          />
          <Button size="sm" variant="secondary" loading={togglingId === s.id} onClick={() => toggleActive(s)} className="w-[104px] justify-center">
            {s.active ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-space-lg">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <h1 className="font-headline-page-mobile text-headline-page-mobile md:font-headline-page md:text-headline-page">Servicios</h1>
          <p className="text-body-default text-on-surface-variant">Catálogo de servicios, precios y tiempos de atención para la reserva en línea.</p>
        </div>
        <div className="flex gap-space-sm self-start md:self-auto">
          <Button variant="secondary" icon={Download} onClick={exportCsv} disabled={loading || services.length === 0}>
            Exportar CSV
          </Button>
          <Button icon={Plus} onClick={() => setModal({})}>Nuevo servicio</Button>
        </div>
      </header>

      {error ? (
        <Card>
          <EmptyState
            icon={CircleAlert}
            title="No se pudieron cargar los servicios"
            description={error.message}
            action={<Button variant="secondary" icon={RefreshCw} onClick={() => load()}>Reintentar</Button>}
          />
        </Card>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter" aria-label="Indicadores">
            <KpiCard label="Servicios activos" value={counts.active} unit={`de ${counts.all}`} icon={Store} loading={loading} />
            <KpiCard
              label="Precio promedio"
              value={average(active, 'price') == null ? '—' : formatMoney(Math.round(average(active, 'price')))}
              unit="MXN"
              icon={Banknote}
              loading={loading}
            />
            <KpiCard
              label="Duración promedio"
              value={average(active, 'duration') == null ? '—' : Math.round(average(active, 'duration'))}
              unit="min"
              icon={Clock}
              loading={loading}
            />
          </section>

          <Card padding={false} className="overflow-hidden">
            <div className="px-5 pt-1">
              <Tabs
                value={tab}
                onChange={setTab}
                items={[
                  { value: 'all', label: 'Todos', count: loading ? null : counts.all },
                  { value: 'active', label: 'Activos', count: loading ? null : counts.active },
                  { value: 'inactive', label: 'Inactivos', count: loading ? null : counts.inactive },
                ]}
              />
            </div>
            <div className="p-5 border-b border-outline-variant">
              <Input
                aria-label="Buscar servicio"
                icon={Search}
                placeholder="Buscar por nombre o descripción"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:max-w-xs"
              />
            </div>

            <Table
              columns={columns}
              rows={rows}
              loading={loading}
              skeletonRows={4}
              onRowClick={(s) => setModal({ service: s })}
              empty={
                services.length === 0 ? (
                  <EmptyState
                    icon={Scissors}
                    title="Aún no hay servicios"
                    description="Crea el primer servicio para que los clientes puedan reservar."
                    action={<Button size="sm" icon={Plus} onClick={() => setModal({})}>Nuevo servicio</Button>}
                  />
                ) : (
                  <EmptyState icon={Search} title="Sin resultados" description="Ningún servicio coincide con la búsqueda." />
                )
              }
            />
          </Card>
        </>
      )}

      <ServiceFormModal
        open={!!modal}
        service={modal?.service ?? null}
        initial={modal?.initial ?? null}
        existing={services}
        saving={saving}
        onClose={() => !saving && setModal(null)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
