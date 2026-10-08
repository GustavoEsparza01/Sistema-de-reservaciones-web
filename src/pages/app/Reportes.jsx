// Pantalla Reportes del administrador (design/stitch/07-reportes).
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseISO } from 'date-fns'
import { Banknote, CalendarCheck, CircleAlert, CircleX, Download, FileText, Receipt, RefreshCw } from 'lucide-react'
import { fetchAllAppointments, downloadAppointmentsCsv } from '../../lib/appointments'
import { datedFileName } from '../../lib/csv'
import { formatDate, formatMoney, formatMoneyMXN, formatPercent } from '../../lib/format'
import {
  REPORT_PERIODS, barberPerformance, presetRange, previousRange, reportKpis, statusBreakdown, topServices,
} from '../../lib/reportStats'
import { useFilterOptions } from '../../hooks/useCitasData'
import { useBusiness } from '../../hooks/useBusiness'
import { Avatar, Button, Card, CardHeader, EmptyState, Input, KpiCard, Select, Table, useToast } from '../../components/ui'
import { RevenueChart, StatusBreakdown, TopServices } from '../../components/app/reportes/ReportCharts'

export default function Reportes() {
  const toast = useToast()
  const business = useBusiness()
  const options = useFilterOptions()
  const [params, setParams] = useSearchParams()

  const period = params.get('periodo') ?? 'mes'
  const range = period === 'custom'
    ? { from: params.get('desde') ?? presetRange('mes').from, to: params.get('hasta') ?? presetRange('mes').to }
    : presetRange(period)
  const barberId = params.get('barbero') ?? ''
  const serviceId = params.get('servicio') ?? ''
  const previous = previousRange(range)

  const [state, setState] = useState({ current: [], previous: [], loading: true, error: null })
  const [exporting, setExporting] = useState(false)
  const requestId = useRef(0)
  const key = JSON.stringify([range, barberId, serviceId])

  async function load() {
    const id = ++requestId.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const base = { barberId, serviceId }
      const [current, prev] = await Promise.all([
        fetchAllAppointments({ ...base, from: range.from, to: range.to }),
        fetchAllAppointments({ ...base, from: previous.from, to: previous.to }),
      ])
      if (id !== requestId.current) return
      setState({ current, previous: prev, loading: false, error: null })
    } catch (error) {
      if (id !== requestId.current) return
      console.error('Reportes:', error)
      setState((s) => ({ ...s, loading: false, error }))
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  function updateParams(changes) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(changes)) {
          if (v === '' || v == null) next.delete(k)
          else next.set(k, String(v))
        }
        return next
      },
      { replace: true }
    )
  }

  function changePeriod(value) {
    if (value === 'custom') updateParams({ periodo: 'custom', desde: range.from, hasta: range.to })
    else updateParams({ periodo: value === 'mes' ? '' : value, desde: '', hasta: '' })
  }

  const { current, loading, error } = state
  const kpis = useMemo(() => reportKpis(current, state.previous), [current, state.previous])
  const statuses = useMemo(() => statusBreakdown(current), [current])
  const services = useMemo(() => topServices(current), [current])
  const barbers = useMemo(() => barberPerformance(current), [current])

  const rangeLabel = range.from === range.to ? formatDate(parseISO(range.from)) : `${formatDate(parseISO(range.from))} – ${formatDate(parseISO(range.to))}`
  const filtersLabel = [
    barberId && options.barbers.find((b) => b.value === barberId)?.label,
    serviceId && options.services.find((s) => s.value === serviceId)?.label,
  ].filter(Boolean).join(' · ')

  async function exportPdf() {
    setExporting(true)
    try {
      const { downloadReportPdf } = await import('../../lib/reportPdf')
      await downloadReportPdf(
        { businessName: business.name, rangeLabel, filtersLabel, kpis, compareLabel: previous.label, services, barbers, appointments: current },
        `reporte-${range.from}_${range.to}.pdf`
      )
      toast({ title: 'Reporte PDF descargado' })
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo generar el PDF', description: err.message })
    } finally {
      setExporting(false)
    }
  }

  const changeText = (v) => (v == null ? undefined : `${v > 0 ? '+' : ''}${v.toFixed(1)}%`)

  const barberColumns = [
    {
      key: 'barbero',
      header: 'Barbero',
      render: (b) => (
        <div className="flex items-center gap-space-sm min-w-[160px]">
          <Avatar name={b.name} size="sm" />
          <span className="font-body-medium">{b.name}</span>
        </div>
      ),
    },
    { key: 'completadas', header: 'Completadas', align: 'right', className: 'tabular-nums', render: (b) => b.completed },
    { key: 'ingresos', header: 'Ingresos', align: 'right', className: 'tabular-nums font-body-medium whitespace-nowrap', render: (b) => formatMoneyMXN(b.revenue) },
    { key: 'ticket', header: 'Ticket prom.', align: 'right', className: 'tabular-nums whitespace-nowrap text-on-surface-variant', render: (b) => (b.avgTicket == null ? '—' : formatMoneyMXN(Math.round(b.avgTicket))) },
    {
      key: 'canceladas',
      header: 'Cancelaciones',
      align: 'right',
      className: 'tabular-nums whitespace-nowrap text-on-surface-variant',
      render: (b) => `${b.cancelled}${b.cancelRate != null && b.total ? ` (${formatPercent(b.cancelRate)})` : ''}`,
    },
  ]

  return (
    <div className="flex flex-col gap-space-lg">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <h1 className="font-headline-page-mobile text-headline-page-mobile md:font-headline-page md:text-headline-page">Reportes</h1>
          <p className="text-body-default text-on-surface-variant">Ingresos, citas y rendimiento del equipo · {rangeLabel}</p>
        </div>
        <div className="flex gap-space-sm self-start md:self-auto">
          <Button variant="secondary" icon={FileText} loading={exporting} disabled={loading || current.length === 0} onClick={exportPdf}>
            Exportar PDF
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            disabled={loading || current.length === 0}
            onClick={() => downloadAppointmentsCsv(current, datedFileName('reporte-citas'))}
          >
            Exportar CSV
          </Button>
        </div>
      </header>

      {/* Filtros */}
      <Card className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))] gap-space-sm items-end">
        <Select label="Periodo" value={period} onChange={(e) => changePeriod(e.target.value)} options={REPORT_PERIODS} />
        <Input
          label="Desde"
          type="date"
          value={range.from}
          max={range.to}
          onChange={(e) => e.target.value && updateParams({ periodo: 'custom', desde: e.target.value, hasta: range.to })}
        />
        <Input
          label="Hasta"
          type="date"
          value={range.to}
          min={range.from}
          onChange={(e) => e.target.value && updateParams({ periodo: 'custom', desde: range.from, hasta: e.target.value })}
        />
        <Select label="Barbero" placeholder="Todos los barberos" value={barberId} onChange={(e) => updateParams({ barbero: e.target.value })} options={options.barbers} />
        <Select label="Servicio" placeholder="Todos los servicios" value={serviceId} onChange={(e) => updateParams({ servicio: e.target.value })} options={options.services} />
      </Card>

      {error ? (
        <Card>
          <EmptyState
            icon={CircleAlert}
            title="No se pudo cargar el reporte"
            description={error.message}
            action={<Button variant="secondary" icon={RefreshCw} onClick={load}>Reintentar</Button>}
          />
        </Card>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-gutter" aria-label="Indicadores">
            <KpiCard label="Ingresos" value={formatMoney(kpis.revenue)} unit="MXN" icon={Banknote} loading={loading}
              change={kpis.revenueChange ?? undefined} changeText={changeText(kpis.revenueChange)} changeLabel={previous.label} />
            <KpiCard label="Citas completadas" value={kpis.completed} unit={kpis.completed === 1 ? 'cita' : 'citas'} icon={CalendarCheck} loading={loading}
              change={kpis.completedChange ?? undefined} changeText={changeText(kpis.completedChange)} changeLabel={previous.label} />
            <KpiCard label="Ticket promedio" value={kpis.avgTicket == null ? '—' : formatMoney(Math.round(kpis.avgTicket))} unit="MXN" icon={Receipt} loading={loading}
              change={kpis.avgTicketChange ?? undefined} changeText={changeText(kpis.avgTicketChange)} changeLabel={previous.label} />
            <KpiCard label="Tasa de cancelación" value={kpis.cancelRate == null ? '—' : formatPercent(kpis.cancelRate)} icon={CircleX} loading={loading} lowerIsBetter
              change={kpis.cancelDiffPoints ?? undefined}
              changeText={kpis.cancelDiffPoints == null ? undefined : `${kpis.cancelDiffPoints > 0 ? '+' : ''}${kpis.cancelDiffPoints.toFixed(1)} pts`}
              changeLabel={previous.label} />
          </section>

          <RevenueChart appointments={current} range={range} total={kpis.revenue} loading={loading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
            <StatusBreakdown rows={statuses} total={current.length} loading={loading} />
            <TopServices rows={services} loading={loading} />
          </div>

          <Card padding={false} className="overflow-hidden">
            <div className="p-5">
              <CardHeader title="Rendimiento por barbero" description="Ordenado por ingresos de citas completadas" />
            </div>
            <Table
              columns={barberColumns}
              rows={barbers.rows}
              loading={loading}
              skeletonRows={4}
              empty={<EmptyState title="Sin citas" description="No hay citas en este periodo con estos filtros." />}
            />
            {!loading && barbers.rows.length > 1 && (
              <div className="px-space-md py-3 border-t border-outline-variant bg-surface-container-low grid grid-cols-[1fr_auto] sm:flex sm:justify-end gap-x-space-xl gap-y-1 text-body-sm tabular-nums">
                <span className="font-body-semibold sm:mr-auto">Totales</span>
                <span>{barbers.totals.completed} completadas</span>
                <span className="font-body-semibold">{formatMoneyMXN(barbers.totals.revenue)}</span>
                <span className="text-on-surface-variant">
                  {barbers.totals.avgTicket == null ? '—' : `${formatMoneyMXN(Math.round(barbers.totals.avgTicket))} prom.`}
                </span>
                <span className="text-on-surface-variant">{barbers.totals.cancelled} cancelaciones</span>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
