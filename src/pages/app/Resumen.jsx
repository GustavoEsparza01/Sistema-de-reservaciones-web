// Pantalla Resumen del administrador (design/stitch/01-resumen).
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { isSameDay } from 'date-fns'
import { Banknote, CalendarCheck, CalendarX, CircleAlert, CircleX, Clock, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useResumenData } from '../../hooks/useResumenData'
import { updateAppointmentStatus } from '../../lib/appointments'
import {
  formatDate, formatDayMonth, formatDuration, formatMoney, formatPercent, formatTime, greeting,
} from '../../lib/format'
import { PERIODS, cancellationStats, periodStats, teamOccupancy } from '../../lib/resumenStats'
import {
  Avatar, Button, Card, CardHeader, EmptyState, KpiCard, Modal, Select, StatusBadge, Table, useToast,
} from '../../components/ui'
import AppointmentActions from '../../components/app/appointments/AppointmentActions'
import AppointmentDrawer from '../../components/app/appointments/AppointmentDrawer'
import PendingList from '../../components/app/resumen/PendingList'
import RevenueChart from '../../components/app/resumen/RevenueChart'
import TeamOccupancy from '../../components/app/resumen/TeamOccupancy'

const TABLE_LIMIT = 8

const SUCCESS = {
  accepted: 'Cita confirmada',
  completed: 'Cita completada',
}

export default function Resumen() {
  const { profile } = useAuth()
  const toast = useToast()
  const data = useResumenData()
  const [period, setPeriod] = useState('hoy')
  const [selectedId, setSelectedId] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const now = new Date()
  const firstName = profile?.full_name?.split(' ')[0]

  const stats = useMemo(() => periodStats(data.appointments, period), [data.appointments, period])
  const cancel = useMemo(() => cancellationStats(data.appointments), [data.appointments])
  const team = useMemo(() => teamOccupancy(data.barbers, data.appointments), [data.barbers, data.appointments])

  // La cita del panel lateral se busca en los datos actuales para reflejar cambios de estado
  const selected = useMemo(
    () => (selectedId ? data.appointments.find((a) => a.id === selectedId) ?? data.pending.find((a) => a.id === selectedId) : null),
    [selectedId, data.appointments, data.pending]
  )

  async function changeStatus(appointment, status) {
    setBusyId(appointment.id)
    try {
      await updateAppointmentStatus(appointment.id, status)
      const title =
        status === 'cancelled' ? (appointment.status === 'pending' ? 'Cita rechazada' : 'Cita cancelada') : SUCCESS[status]
      toast({ title, description: `${appointment.clientName} · ${formatTime(appointment.start)} h` })
      await data.reload({ silent: true })
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo actualizar la cita', description: err.message })
    } finally {
      setBusyId(null)
    }
  }

  async function confirmCancel() {
    const target = cancelTarget
    setCancelTarget(null)
    if (target) await changeStatus(target, 'cancelled')
  }

  const periodLabel = PERIODS.find((p) => p.value === period).label.toLowerCase()
  const multiDay = period === 'semana' || period === 'mes'
  const tableRows = stats.list.slice(0, TABLE_LIMIT)

  const columns = [
    {
      key: 'hora',
      header: multiDay ? 'Fecha' : 'Hora',
      width: multiDay ? 120 : 72,
      className: 'font-body-semibold tabular-nums whitespace-nowrap',
      render: (a) => (multiDay ? `${formatDayMonth(a.start)} · ${formatTime(a.start)}` : formatTime(a.start)),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      render: (a) => (
        <div className="flex items-center gap-space-sm min-w-[160px]">
          <Avatar name={a.clientName} size="sm" />
          <div className="min-w-0">
            <p className="font-body-medium truncate">{a.clientName}</p>
            {a.clientPhone && <p className="text-[12px] text-on-surface-variant tabular-nums">{a.clientPhone}</p>}
          </div>
        </div>
      ),
    },
    { key: 'servicio', header: 'Servicio', className: 'text-on-surface-variant', render: (a) => a.serviceName },
    { key: 'barbero', header: 'Barbero', className: 'text-on-surface-variant whitespace-nowrap', render: (a) => a.barberName },
    { key: 'duracion', header: 'Duración', className: 'text-on-surface-variant tabular-nums whitespace-nowrap', render: (a) => formatDuration(a.duration) },
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
          onRequestCancel={setCancelTarget}
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-space-xl">
      {/* Encabezado */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <h1 className="font-headline-page-mobile text-headline-page-mobile md:font-headline-page md:text-headline-page text-on-surface">
            {greeting(now)}{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-body-default text-on-surface-variant">{formatDate(now)}</p>
        </div>
        <Select
          aria-label="Periodo"
          className="md:w-48"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={PERIODS}
        />
      </header>

      {data.error ? (
        <Card>
          <EmptyState
            icon={CircleAlert}
            title="No se pudieron cargar los datos"
            description={data.error.message}
            action={<Button variant="secondary" icon={RefreshCw} onClick={() => data.reload()}>Reintentar</Button>}
          />
        </Card>
      ) : (
        <>
          {/* Indicadores */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter" aria-label="Indicadores">
            <KpiCard
              label={period === 'hoy' ? 'Citas de hoy' : `Citas · ${periodLabel}`}
              value={stats.count}
              unit={stats.count === 1 ? 'cita' : 'citas'}
              icon={CalendarCheck}
              loading={data.loading}
              change={stats.hasPrevCount ? stats.countDiff : undefined}
              changeText={`${stats.countDiff > 0 ? '+' : ''}${stats.countDiff} ${Math.abs(stats.countDiff) === 1 ? 'cita' : 'citas'}`}
              changeLabel={stats.compareLabel}
            >
              {!data.loading && (
                <p className="text-body-sm text-on-surface-variant tabular-nums">
                  {stats.byStatus.accepted} confirmadas · {stats.byStatus.pending} pend. · {stats.byStatus.completed} compl.
                </p>
              )}
            </KpiCard>

            <KpiCard
              label={period === 'hoy' ? 'Ingresos de hoy' : `Ingresos · ${periodLabel}`}
              value={formatMoney(stats.revenue)}
              unit="MXN"
              icon={Banknote}
              loading={data.loading}
              change={stats.revenueChange ?? undefined}
              changeLabel={stats.compareLabel}
            >
              {!data.loading && <p className="text-body-sm text-on-surface-variant">De citas completadas</p>}
            </KpiCard>

            <KpiCard
              label="Pendientes por confirmar"
              value={data.pendingCount}
              unit={data.pendingCount === 1 ? 'cita' : 'citas'}
              icon={Clock}
              loading={data.loading}
            >
              {!data.loading && data.pending[0] && (
                <p className="text-body-sm text-on-surface-variant">
                  Próxima: {isSameDay(data.pending[0].start, now) ? 'hoy' : formatDayMonth(data.pending[0].start)} a las {formatTime(data.pending[0].start)}
                </p>
              )}
            </KpiCard>

            <KpiCard
              label="Cancelación del mes"
              value={cancel.rate == null ? '—' : formatPercent(cancel.rate)}
              icon={CircleX}
              loading={data.loading}
              lowerIsBetter
              change={cancel.diffPoints ?? undefined}
              changeText={cancel.diffPoints != null ? `${cancel.diffPoints > 0 ? '+' : ''}${cancel.diffPoints.toFixed(1)} pts` : undefined}
              changeLabel="vs. mes anterior"
            >
              {!data.loading && cancel.total > 0 && (
                <p className="text-body-sm text-on-surface-variant tabular-nums">
                  {cancel.cancelled} de {cancel.total} citas del mes
                </p>
              )}
            </KpiCard>
          </section>

          {/* Citas del periodo + pendientes */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter items-start">
            <Card padding={false} className="xl:col-span-2 overflow-hidden">
              <div className="p-5">
                <CardHeader
                  title={stats.tableTitle}
                  description={data.loading ? ' ' : `${stats.list.length} ${stats.list.length === 1 ? 'cita programada' : 'citas programadas'}`}
                />
              </div>
              <Table
                columns={columns}
                rows={tableRows}
                loading={data.loading}
                onRowClick={(a) => setSelectedId(a.id)}
                empty={
                  <EmptyState
                    icon={CalendarX}
                    title="No hay citas en este periodo"
                    description="Cuando los clientes reserven, sus citas aparecerán aquí."
                  />
                }
              />
              {!data.loading && stats.list.length > TABLE_LIMIT && (
                <div className="px-5 py-3 border-t border-outline-variant flex flex-wrap items-center justify-between gap-space-sm text-body-sm text-on-surface-variant">
                  <span>Mostrando {TABLE_LIMIT} de {stats.list.length} citas</span>
                  <Link to="/app/citas" className="font-body-medium text-primary hover:underline">
                    Ver todas las citas
                  </Link>
                </div>
              )}
            </Card>

            <PendingList
              items={data.pending}
              total={data.pendingCount}
              loading={data.loading}
              busyId={busyId}
              onOpen={(a) => setSelectedId(a.id)}
              onChangeStatus={changeStatus}
              onRequestCancel={setCancelTarget}
            />
          </div>

          {/* Equipo + ingresos */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-gutter items-start">
            <TeamOccupancy rows={team} loading={data.loading} />
            <div className="xl:col-span-2">
              <RevenueChart appointments={data.appointments} loading={data.loading} />
            </div>
          </div>
        </>
      )}

      <AppointmentDrawer
        appointment={selected}
        onClose={() => setSelectedId(null)}
        busy={busyId === selected?.id}
        onChangeStatus={changeStatus}
        onRequestCancel={setCancelTarget}
      />

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        size="sm"
        title={cancelTarget?.status === 'pending' ? '¿Rechazar la cita?' : '¿Cancelar la cita?'}
        description={
          cancelTarget
            ? `${cancelTarget.clientName} · ${formatDate(cancelTarget.start)} a las ${formatTime(cancelTarget.start)}. El horario quedará libre para otros clientes.`
            : ''
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>Volver</Button>
            <Button variant="danger" onClick={confirmCancel}>
              {cancelTarget?.status === 'pending' ? 'Rechazar cita' : 'Cancelar cita'}
            </Button>
          </>
        }
      />
    </div>
  )
}
