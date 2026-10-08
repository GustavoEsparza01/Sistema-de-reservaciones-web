// Pantalla Clientes del administrador (design/stitch/04-clientes).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Banknote, CircleAlert, Download, RefreshCw, Search, UserCheck, Users } from 'lucide-react'
import { fetchClients, setClientBlocked, updateClient } from '../../lib/clients'
import { downloadCsv, datedFileName } from '../../lib/csv'
import { formatDate, formatMoney, formatMoneyMXN } from '../../lib/format'
import {
  Avatar, Badge, Button, Card, EmptyState, Input, KpiCard, Modal, Pagination, Select, Table, Tabs, useToast,
} from '../../components/ui'
import ClientDrawer from '../../components/app/clientes/ClientDrawer'
import AppointmentFormModal from '../../components/app/appointments/AppointmentFormModal'

const SORTS = [
  { value: 'reciente', label: 'Última visita' },
  { value: 'gasto', label: 'Gasto total' },
  { value: 'visitas', label: 'Número de visitas' },
  { value: 'nombre', label: 'Nombre (A–Z)' },
]

const sorters = {
  reciente: (x, y) => (y.lastVisit?.getTime() ?? 0) - (x.lastVisit?.getTime() ?? 0) || x.name.localeCompare(y.name, 'es'),
  gasto: (x, y) => y.spent - x.spent,
  visitas: (x, y) => y.visits - x.visits,
  nombre: (x, y) => x.name.localeCompare(y.name, 'es'),
}

export default function Clientes() {
  const toast = useToast()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [state, setState] = useState({ clients: [], loading: true, error: null })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [blocking, setBlocking] = useState(null)
  const [booking, setBooking] = useState(null)

  const tab = params.get('estado') ?? 'todos'
  const sort = params.get('orden') ?? 'reciente'
  const openId = params.get('cliente')

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
    try {
      setState({ clients: await fetchClients(), loading: false, error: null })
    } catch (error) {
      console.error('Clientes:', error)
      setState((s) => ({ ...s, loading: false, error }))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setParam = (k, v, fallback) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (!v || v === fallback) next.delete(k)
      else next.set(k, v)
      return next
    }, { replace: true })

  const { clients, loading, error } = state
  const counts = {
    todos: clients.length,
    activos: clients.filter((c) => !c.blocked).length,
    bloqueados: clients.filter((c) => c.blocked).length,
  }

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clients
      .filter((c) => (tab === 'activos' ? !c.blocked : tab === 'bloqueados' ? c.blocked : true))
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone?.includes(q))
      .sort(sorters[sort] ?? sorters.reciente)
  }, [clients, tab, search, sort])

  useEffect(() => setPage(1), [tab, search, sort, pageSize])
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)
  const open = openId ? clients.find((c) => c.id === openId) ?? null : null

  const totalSpent = clients.reduce((s, c) => s + c.spent, 0)
  const withVisits = clients.filter((c) => c.visits > 0).length
  const returning = clients.filter((c) => c.visits >= 2).length

  async function saveEdit(e) {
    e.preventDefault()
    const name = editForm.full_name.trim()
    if (!name) return
    setSaving(true)
    try {
      await updateClient(editing.id, { full_name: name, phone: editForm.phone.trim() })
      toast({ title: 'Cliente actualizado', description: name })
      setEditing(null)
      await load({ silent: true })
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo guardar', description: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function confirmBlock() {
    const c = blocking
    setBlocking(null)
    try {
      await setClientBlocked(c.id, !c.blocked)
      toast({
        title: c.blocked ? 'Cliente desbloqueado' : 'Cliente bloqueado',
        description: c.blocked ? `${c.name} ya puede reservar en línea.` : `${c.name} ya no puede reservar en línea.`,
      })
      await load({ silent: true })
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo cambiar el estado', description: err.message })
    }
  }

  function exportCsv() {
    downloadCsv(
      datedFileName('clientes'),
      ['Cliente', 'Teléfono', 'Visitas', 'Última visita', 'Gasto total (MXN)', 'Citas próximas', 'Cancelaciones', 'Estado'],
      rows.map((c) => [c.name, c.phone, c.visits, c.lastVisit ? formatDate(c.lastVisit) : '', c.spent, c.upcoming, c.cancelled, c.blocked ? 'Bloqueado' : 'Activo'])
    )
  }

  const columns = [
    {
      key: 'cliente',
      header: 'Cliente',
      render: (c) => (
        <div className="flex items-center gap-space-sm min-w-[180px]">
          <Avatar name={c.name} size="sm" />
          <div className="min-w-0">
            <p className="font-body-medium truncate flex items-center gap-space-xs">
              {c.name}
              {c.isBarber && <Badge className="!text-[11px]">Barbero</Badge>}
            </p>
            {c.upcoming > 0 && <p className="text-[12px] text-primary">{c.upcoming} {c.upcoming === 1 ? 'cita próxima' : 'citas próximas'}</p>}
          </div>
        </div>
      ),
    },
    { key: 'telefono', header: 'Teléfono', className: 'tabular-nums whitespace-nowrap text-on-surface-variant', render: (c) => c.phone ?? '—' },
    { key: 'visitas', header: 'Visitas', align: 'right', className: 'tabular-nums', render: (c) => c.visits },
    { key: 'ultima', header: 'Última visita', className: 'whitespace-nowrap text-on-surface-variant', render: (c) => (c.lastVisit ? formatDate(c.lastVisit) : '—') },
    { key: 'gasto', header: 'Gasto total', align: 'right', className: 'tabular-nums whitespace-nowrap font-body-medium', render: (c) => formatMoneyMXN(c.spent) },
    { key: 'estado', header: 'Estado', render: (c) => (c.blocked ? <Badge tone="danger" dot>Bloqueado</Badge> : <Badge tone="success" dot>Activo</Badge>) },
  ]

  return (
    <div className="flex flex-col gap-space-lg">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-baseline gap-space-sm">
            <h1 className="font-headline-page-mobile text-headline-page-mobile md:font-headline-page md:text-headline-page">Clientes</h1>
            {!loading && <span className="text-body-sm text-on-surface-variant">{counts.todos} registrados</span>}
          </div>
          <p className="text-body-default text-on-surface-variant">Directorio, historial de visitas y preferencias de cada cliente.</p>
        </div>
        <Button variant="secondary" icon={Download} onClick={exportCsv} disabled={loading || rows.length === 0} className="self-start md:self-auto">
          Exportar CSV
        </Button>
      </header>

      {error ? (
        <Card>
          <EmptyState icon={CircleAlert} title="No se pudieron cargar los clientes" description={error.message}
            action={<Button variant="secondary" icon={RefreshCw} onClick={() => load()}>Reintentar</Button>} />
        </Card>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter" aria-label="Indicadores">
            <KpiCard label="Clientes con visitas" value={withVisits} unit={`de ${counts.todos}`} icon={Users} loading={loading} />
            <KpiCard label="Clientes que regresan" value={returning} unit={returning === 1 ? 'cliente' : 'clientes'} icon={UserCheck} loading={loading}>
              {!loading && <p className="text-body-sm text-on-surface-variant">Con 2 o más visitas</p>}
            </KpiCard>
            <KpiCard label="Gasto total de clientes" value={formatMoney(totalSpent)} unit="MXN" icon={Banknote} loading={loading} />
          </section>

          <Card padding={false} className="overflow-hidden">
            <div className="px-5 pt-1">
              <Tabs
                value={tab}
                onChange={(v) => setParam('estado', v, 'todos')}
                items={[
                  { value: 'todos', label: 'Todos', count: loading ? null : counts.todos },
                  { value: 'activos', label: 'Activos', count: loading ? null : counts.activos },
                  { value: 'bloqueados', label: 'Bloqueados', count: loading ? null : counts.bloqueados },
                ]}
              />
            </div>
            <div className="p-5 flex flex-col sm:flex-row gap-space-sm border-b border-outline-variant">
              <Input aria-label="Buscar cliente" icon={Search} placeholder="Buscar por nombre o teléfono" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs flex-1" />
              <Select aria-label="Ordenar por" value={sort} onChange={(e) => setParam('orden', e.target.value, 'reciente')} options={SORTS.map((s) => ({ value: s.value, label: `Ordenar: ${s.label}` }))} className="sm:w-60" />
            </div>
            <Table
              columns={columns}
              rows={pageRows}
              loading={loading}
              skeletonRows={6}
              onRowClick={(c) => setParam('cliente', c.id)}
              empty={
                <EmptyState
                  icon={Users}
                  title={clients.length === 0 ? 'Aún no hay clientes' : 'Sin resultados'}
                  description={clients.length === 0 ? 'Los clientes aparecen aquí cuando se registran para reservar.' : 'Ningún cliente coincide con la búsqueda.'}
                />
              }
            />
            {!loading && rows.length > 0 && (
              <Pagination className="px-5 py-3 border-t border-outline-variant" page={page} pageSize={pageSize} total={rows.length} noun="clientes" onPageChange={setPage} onPageSizeChange={setPageSize} />
            )}
          </Card>
        </>
      )}

      <ClientDrawer
        client={open}
        onClose={() => setParam('cliente', '')}
        onEdit={(c) => {
          setEditForm({ full_name: c.name === 'Sin nombre' ? '' : c.name, phone: c.phone ?? '' })
          setEditing(c)
        }}
        onToggleBlock={setBlocking}
        onNewAppointment={(c) => setBooking({ client: { id: c.id, full_name: c.name, phone: c.phone } })}
        onOpenAppointment={(a) => navigate(`/app/citas?cita=${a.id}`)}
      />

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        title="Editar cliente"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>Cancelar</Button>
            <Button type="submit" form="editar-cliente" loading={saving} disabled={!editForm.full_name.trim()}>Guardar</Button>
          </>
        }
      >
        <form id="editar-cliente" onSubmit={saveEdit} className="flex flex-col gap-space-md">
          <Input label="Nombre completo" required value={editForm.full_name} onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))} autoFocus />
          <Input label="Teléfono" type="tel" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
        </form>
      </Modal>

      <Modal
        open={!!blocking}
        onClose={() => setBlocking(null)}
        size="sm"
        title={blocking?.blocked ? `¿Desbloquear a ${blocking?.name}?` : `¿Bloquear a ${blocking?.name}?`}
        description={
          blocking?.blocked
            ? 'Podrá volver a reservar en línea.'
            : 'No podrá reservar en línea. Su historial se conserva y sus citas ya agendadas no cambian: revísalas en Citas.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setBlocking(null)}>Volver</Button>
            <Button variant={blocking?.blocked ? 'primary' : 'danger'} onClick={confirmBlock}>{blocking?.blocked ? 'Desbloquear' : 'Bloquear'}</Button>
          </>
        }
      />

      <AppointmentFormModal
        open={!!booking}
        mode="create"
        preset={booking}
        onClose={() => setBooking(null)}
        onDone={async (r) => {
          setBooking(null)
          toast({ title: 'Cita agendada', description: `${r.clientName} · ${formatDate(r.start)}` })
          await load({ silent: true })
        }}
      />
    </div>
  )
}
