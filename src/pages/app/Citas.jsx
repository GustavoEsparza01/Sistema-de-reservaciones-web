// Pantalla Citas del administrador (design/stitch/03-citas).
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isToday, isTomorrow, isYesterday } from 'date-fns'
import { CalendarX, CheckCheck, Check, CircleAlert, Download, FilterX, Plus, RefreshCw, Search, X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { datedFileName } from '../../lib/csv'
import {
  APPOINTMENT_SELECT, downloadAppointmentsCsv, fetchAllAppointments, normalizeAppointment,
  updateAppointmentStatus, updateAppointmentsStatus,
} from '../../lib/appointments'
import { formatDate, formatDayMonth, formatDuration, formatMoneyMXN, formatTime } from '../../lib/format'
import { useCitasData, useFilterOptions } from '../../hooks/useCitasData'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import {
  Avatar, Button, Card, EmptyState, Input, Modal, Pagination, Select, StatusBadge, Table, Tabs, useToast,
} from '../../components/ui'
import AppointmentActions from '../../components/app/appointments/AppointmentActions'
import AppointmentDrawer from '../../components/app/appointments/AppointmentDrawer'
import AppointmentFormModal from '../../components/app/appointments/AppointmentFormModal'

const STATUS_TABS = [
  { value: '', label: 'Todas', countKey: 'all' },
  { value: 'pending', label: 'Pendientes', countKey: 'pending' },
  { value: 'accepted', label: 'Confirmadas', countKey: 'accepted' },
  { value: 'completed', label: 'Completadas', countKey: 'completed' },
  { value: 'cancelled', label: 'Canceladas', countKey: 'cancelled' },
]

const DEFAULT_PAGE_SIZE = 10

function dayLabel(date) {
  if (isToday(date)) return 'Hoy'
  if (isTomorrow(date)) return 'Mañana'
  if (isYesterday(date)) return 'Ayer'
  return formatDayMonth(date)
}

export default function Citas() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const options = useFilterOptions()

  // Los filtros viven en la URL para poder compartir el enlace y usar "atrás"
  const filters = useMemo(
    () => ({
      status: params.get('estado') ?? '',
      q: params.get('q') ?? '',
      from: params.get('desde') ?? '',
      to: params.get('hasta') ?? '',
      barberId: params.get('barbero') ?? '',
      serviceId: params.get('servicio') ?? '',
    }),
    [params]
  )
  const page = Math.max(1, Number(params.get('pagina')) || 1)
  const pageSize = Number(params.get('filas')) || DEFAULT_PAGE_SIZE
  const openId = params.get('cita')

  const data = useCitasData(filters, page, pageSize)
  const [selected, setSelected] = useState(() => new Set())
  const [busyId, setBusyId] = useState(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null) // { appointments: [...] }
  const [deepLinked, setDeepLinked] = useState(null)
  const [form, setForm] = useState(null) // { mode, appointment? }

  // Búsqueda con espera para no consultar en cada tecla
  const [searchText, setSearchText] = useState(filters.q)
  const debouncedSearch = useDebouncedValue(searchText, 350)
  useEffect(() => {
    if (debouncedSearch !== filters.q) updateParams({ q: debouncedSearch })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  // Limpiar la selección al cambiar de filtros o de página
  const listKey = JSON.stringify([filters, page, pageSize])
  useEffect(() => setSelected(new Set()), [listKey])

  /** Cambia parámetros de la URL; cualquier cambio de filtro vuelve a la página 1. */
  function updateParams(changes, { resetPage = true } = {}) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(changes)) {
          if (v === '' || v == null) next.delete(k)
          else next.set(k, String(v))
        }
        if (resetPage && !('pagina' in changes)) next.delete('pagina')
        return next
      },
      { replace: true }
    )
  }

  const hasFilters = filters.q || filters.from || filters.to || filters.barberId || filters.serviceId
  function clearFilters() {
    setSearchText('')
    updateParams({ q: '', desde: '', hasta: '', barbero: '', servicio: '' })
  }

  // Cita abierta en el panel lateral: de la página actual o cargada por enlace directo
  const openAppointment = useMemo(
    () => (openId ? data.rows.find((r) => r.id === openId) ?? (deepLinked?.id === openId ? deepLinked : null) : null),
    [openId, data.rows, deepLinked]
  )
  useEffect(() => {
    if (!openId || data.loading || data.rows.some((r) => r.id === openId)) return
    let alive = true
    supabase.from('appointments').select(APPOINTMENT_SELECT).eq('id', openId).maybeSingle()
      .then(({ data: row }) => alive && setDeepLinked(row ? normalizeAppointment(row) : null))
    return () => { alive = false }
  }, [openId, data.loading, data.rows])

  const openDrawer = (a) => updateParams({ cita: a.id }, { resetPage: false })
  const closeDrawer = () => updateParams({ cita: '' }, { resetPage: false })

  async function refreshAfterChange() {
    await data.reload({ silent: true })
    if (deepLinked) setDeepLinked(null)
  }

  async function changeStatus(appointment, status) {
    setBusyId(appointment.id)
    try {
      await updateAppointmentStatus(appointment.id, status)
      const title = {
        accepted: 'Cita confirmada',
        completed: 'Cita completada',
        cancelled: appointment.status === 'pending' ? 'Cita rechazada' : 'Cita cancelada',
      }[status]
      toast({ title, description: `${appointment.clientName} · ${formatDate(appointment.start)} ${formatTime(appointment.start)} h` })
      await refreshAfterChange()
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo actualizar la cita', description: err.message })
    } finally {
      setBusyId(null)
    }
  }

  // ── Acciones en bloque ─────────────────────────────────────────
  const selectedRows = data.rows.filter((r) => selected.has(r.id))
  const bulk = {
    confirm: selectedRows.filter((r) => r.status === 'pending'),
    complete: selectedRows.filter((r) => r.status === 'accepted'),
    cancel: selectedRows.filter((r) => r.status === 'pending' || r.status === 'accepted'),
  }

  async function bulkChange(list, status, title) {
    if (list.length === 0) return
    setBulkBusy(true)
    try {
      await updateAppointmentsStatus(list.map((r) => r.id), status)
      toast({ title: `${list.length} ${list.length === 1 ? 'cita' : 'citas'} · ${title}` })
      setSelected(new Set())
      await refreshAfterChange()
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudieron actualizar las citas', description: err.message })
    } finally {
      setBulkBusy(false)
    }
  }

  async function confirmCancel() {
    const list = cancelTarget?.appointments ?? []
    setCancelTarget(null)
    if (list.length === 1) await changeStatus(list[0], 'cancelled')
    else await bulkChange(list, 'cancelled', 'canceladas')
  }

  async function exportFiltered() {
    setExporting(true)
    try {
      const all = await fetchAllAppointments(filters)
      if (all.length === 0) {
        toast({ tone: 'info', title: 'No hay citas para exportar con estos filtros' })
        return
      }
      downloadAppointmentsCsv(all, datedFileName('citas'))
      toast({ title: `Se exportaron ${all.length} citas` })
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo exportar', description: err.message })
    } finally {
      setExporting(false)
    }
  }

  const columns = [
    {
      key: 'cliente',
      header: 'Cliente',
      render: (a) => (
        <div className="flex items-center gap-space-sm min-w-[180px]">
          <Avatar name={a.clientName} size="sm" />
          <div className="min-w-0">
            <p className="font-body-medium truncate">{a.clientName}</p>
            {a.clientPhone && <p className="text-[12px] text-on-surface-variant tabular-nums">{a.clientPhone}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha y hora',
      className: 'whitespace-nowrap',
      render: (a) => (
        <div>
          <p className="font-body-medium tabular-nums">{dayLabel(a.start)}, {formatTime(a.start)}</p>
          <p className="text-[12px] text-on-surface-variant">{formatDate(a.start)}</p>
        </div>
      ),
    },
    { key: 'servicio', header: 'Servicio', className: 'text-on-surface-variant', render: (a) => a.serviceName },
    {
      key: 'barbero',
      header: 'Barbero',
      className: 'whitespace-nowrap',
      render: (a) => (
        <div className="flex items-center gap-space-xs">
          <Avatar name={a.barberName} size="sm" />
          <span className="text-on-surface-variant">{a.barberName}</span>
        </div>
      ),
    },
    { key: 'duracion', header: 'Duración', className: 'text-on-surface-variant tabular-nums whitespace-nowrap', render: (a) => formatDuration(a.duration) },
    { key: 'precio', header: 'Precio', align: 'right', className: 'tabular-nums whitespace-nowrap', render: (a) => formatMoneyMXN(a.price) },
    { key: 'estado', header: 'Estado', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'acciones',
      header: <span className="sr-only">Acciones</span>,
      align: 'right',
      render: (a) => (
        <AppointmentActions
          appointment={a}
          compact
          busy={busyId === a.id}
          onChangeStatus={changeStatus}
          onRequestCancel={(x) => setCancelTarget({ appointments: [x] })}
        />
      ),
    },
  ]

  const single = cancelTarget?.appointments.length === 1 ? cancelTarget.appointments[0] : null

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Encabezado */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-baseline gap-space-sm">
            <h1 className="font-headline-page-mobile text-headline-page-mobile md:font-headline-page md:text-headline-page">Citas</h1>
            {!data.loading && <span className="text-body-sm text-on-surface-variant tabular-nums">{data.counts.all} en total</span>}
          </div>
          <p className="text-body-default text-on-surface-variant">Consulta, filtra y da seguimiento a todas las citas.</p>
        </div>
        <div className="flex gap-space-sm self-start md:self-auto">
          <Button variant="secondary" icon={Download} loading={exporting} onClick={exportFiltered}>
            Exportar CSV
          </Button>
          <Button icon={Plus} onClick={() => setForm({ mode: 'create' })}>Nueva cita</Button>
        </div>
      </header>

      <Card padding={false} className="overflow-hidden">
        {/* Pestañas por estado */}
        <div className="px-5 pt-1">
          <Tabs
            value={filters.status}
            onChange={(v) => updateParams({ estado: v })}
            items={STATUS_TABS.map((t) => ({ value: t.value, label: t.label, count: data.loading ? null : data.counts[t.countKey] }))}
          />
        </div>

        {/* Filtros */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(200px,1.4fr)_repeat(4,minmax(0,1fr))_auto] gap-space-sm items-end border-b border-outline-variant">
          <Input
            label="Buscar"
            icon={Search}
            placeholder="Buscar cliente o teléfono"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Input label="Desde" type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => updateParams({ desde: e.target.value })} />
          <Input label="Hasta" type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => updateParams({ hasta: e.target.value })} />
          <Select label="Barbero" placeholder="Todos los barberos" options={options.barbers} value={filters.barberId} onChange={(e) => updateParams({ barbero: e.target.value })} />
          <Select label="Servicio" placeholder="Todos los servicios" options={options.services} value={filters.serviceId} onChange={(e) => updateParams({ servicio: e.target.value })} />
          <Button variant="ghost" icon={FilterX} disabled={!hasFilters} onClick={clearFilters}>
            Limpiar
          </Button>
        </div>

        {/* Barra de acciones en bloque */}
        {selected.size > 0 && (
          <div className="px-5 py-3 flex flex-wrap items-center gap-space-sm bg-primary-fixed/40 border-b border-outline-variant">
            <span className="font-body-medium text-body-sm text-on-surface mr-space-sm">
              {selected.size} {selected.size === 1 ? 'cita seleccionada' : 'citas seleccionadas'}
            </span>
            <Button size="sm" icon={Check} disabled={bulkBusy || bulk.confirm.length === 0} onClick={() => bulkChange(bulk.confirm, 'accepted', 'confirmadas')}>
              Confirmar{bulk.confirm.length ? ` (${bulk.confirm.length})` : ''}
            </Button>
            <Button size="sm" variant="secondary" icon={CheckCheck} disabled={bulkBusy || bulk.complete.length === 0} onClick={() => bulkChange(bulk.complete, 'completed', 'completadas')}>
              Completar{bulk.complete.length ? ` (${bulk.complete.length})` : ''}
            </Button>
            <Button size="sm" variant="secondary" disabled={bulkBusy || bulk.cancel.length === 0} onClick={() => setCancelTarget({ appointments: bulk.cancel })}>
              Cancelar{bulk.cancel.length ? ` (${bulk.cancel.length})` : ''}
            </Button>
            <Button size="sm" variant="secondary" icon={Download} disabled={bulkBusy} onClick={() => downloadAppointmentsCsv(selectedRows, 'citas-seleccionadas.csv')}>
              Exportar
            </Button>
            <Button size="sm" variant="ghost" icon={X} className="ml-auto" onClick={() => setSelected(new Set())}>
              Quitar selección
            </Button>
          </div>
        )}

        {data.error ? (
          <EmptyState
            icon={CircleAlert}
            title="No se pudieron cargar las citas"
            description={data.error.message}
            action={<Button variant="secondary" icon={RefreshCw} onClick={() => data.reload()}>Reintentar</Button>}
          />
        ) : (
          <Table
            columns={columns}
            rows={data.rows}
            loading={data.loading}
            skeletonRows={Math.min(pageSize, 8)}
            onRowClick={openDrawer}
            selection={{
              selected,
              onToggle: (id) =>
                setSelected((prev) => {
                  const next = new Set(prev)
                  next.has(id) ? next.delete(id) : next.add(id)
                  return next
                }),
              onToggleAll: (checked) => setSelected(checked ? new Set(data.rows.map((r) => r.id)) : new Set()),
            }}
            empty={
              <EmptyState
                icon={CalendarX}
                title={hasFilters || filters.status ? 'No hay citas con estos filtros' : 'Aún no hay citas'}
                description={hasFilters || filters.status ? 'Prueba con otras fechas o quita algún filtro.' : 'Cuando los clientes reserven, sus citas aparecerán aquí.'}
                action={hasFilters ? <Button variant="secondary" size="sm" icon={FilterX} onClick={clearFilters}>Limpiar filtros</Button> : null}
              />
            }
          />
        )}

        {!data.error && data.total > 0 && (
          <Pagination
            className="px-5 py-3 border-t border-outline-variant"
            page={page}
            pageSize={pageSize}
            total={data.total}
            noun="citas"
            onPageChange={(p) => updateParams({ pagina: p > 1 ? p : '' }, { resetPage: false })}
            onPageSizeChange={(s) => updateParams({ filas: s === DEFAULT_PAGE_SIZE ? '' : s })}
          />
        )}
      </Card>

      <AppointmentDrawer
        appointment={openAppointment}
        onClose={closeDrawer}
        busy={busyId === openAppointment?.id}
        onChangeStatus={changeStatus}
        onRequestCancel={(x) => setCancelTarget({ appointments: [x] })}
        onReschedule={(x) => setForm({ mode: 'reschedule', appointment: x })}
      />

      <AppointmentFormModal
        open={!!form}
        mode={form?.mode}
        appointment={form?.appointment}
        onClose={() => setForm(null)}
        onDone={async (r) => {
          setForm(null)
          toast({
            title: r.type === 'create' ? 'Cita agendada' : 'Cita reprogramada',
            description: `${formatDate(r.start)} ${formatTime(r.start)} h`,
          })
          await refreshAfterChange()
        }}
      />

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        size="sm"
        title={
          single
            ? single.status === 'pending' ? '¿Rechazar la cita?' : '¿Cancelar la cita?'
            : `¿Cancelar ${cancelTarget?.appointments.length ?? 0} citas?`
        }
        description={
          single
            ? `${single.clientName} · ${formatDate(single.start)} a las ${formatTime(single.start)}. El horario quedará libre para otros clientes.`
            : 'Los horarios quedarán libres para otros clientes.'
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>Volver</Button>
            <Button variant="danger" onClick={confirmCancel}>
              {single ? (single.status === 'pending' ? 'Rechazar cita' : 'Cancelar cita') : 'Cancelar citas'}
            </Button>
          </>
        }
      />
    </div>
  )
}
