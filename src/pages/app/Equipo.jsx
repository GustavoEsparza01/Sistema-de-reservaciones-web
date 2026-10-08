// Pantalla Equipo del administrador (design/stitch/05-equipo).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarClock, CircleAlert, Clock, Gauge, RefreshCw, Search, UserPlus, Users } from 'lucide-react'
import { addBarber, fetchTeam, setBarberActive, updateBarber, weeklyMinutes, WEEK_DAYS } from '../../lib/team'
import { teamOccupancy } from '../../lib/resumenStats'
import { formatDuration } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Avatar, Badge, Button, Card, EmptyState, Input, KpiCard, Modal, Table, Tabs, useToast } from '../../components/ui'
import ScheduleDrawer from '../../components/app/equipo/ScheduleDrawer'
import AddBarberModal from '../../components/app/equipo/AddBarberModal'

const roleLabel = (m) => (m.isAdmin && m.isBarber ? 'Admin y barbero' : m.isAdmin ? 'Administrador' : 'Barbero')

function WorkDays({ schedule }) {
  if (!schedule) return <span className="text-body-sm text-outline">Sin agenda</span>
  return (
    <div className="flex gap-1" aria-label="Días laborales">
      {WEEK_DAYS.map(({ key, short, name }) => {
        const on = schedule[key]?.isWorking
        return (
          <span
            key={key}
            title={on ? `${name}: ${schedule[key].start} – ${schedule[key].end}` : `${name}: descanso`}
            className={cn(
              'w-6 h-6 rounded text-[11px] font-semibold flex items-center justify-center',
              on ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-low text-outline'
            )}
          >
            {short}
          </span>
        )
      })}
    </div>
  )
}

export default function Equipo() {
  const toast = useToast()
  const [state, setState] = useState({ members: [], todayAppointments: [], loading: true, error: null })
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [savingSchedule, setSavingSchedule] = useState(false)
  const [adding, setAdding] = useState(false)
  const [savingAdd, setSavingAdd] = useState(false)
  const [deactivating, setDeactivating] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await fetchTeam()
      setState({ ...data, loading: false, error: null })
    } catch (error) {
      console.error('Equipo:', error)
      setState((s) => ({ ...s, loading: false, error }))
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const { members, todayAppointments, loading, error } = state
  const activeBarbers = members.filter((m) => m.isBarber && m.active)

  // Indicadores de hoy
  const occupancy = useMemo(
    () => teamOccupancy(activeBarbers.map((m) => ({ id: m.barberId, name: m.name, schedule: m.schedule })), todayAppointments),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members, todayAppointments]
  )
  const working = occupancy.filter((o) => o.working)
  const avgOccupancy = working.length ? working.reduce((s, o) => s + o.ratio, 0) / working.length : null
  const teamWeekly = activeBarbers.reduce((s, m) => s + weeklyMinutes(m.schedule), 0)

  const counts = {
    all: members.length,
    barbers: members.filter((m) => m.isBarber && m.active).length,
    admins: members.filter((m) => m.isAdmin).length,
    inactive: members.filter((m) => !m.active).length,
  }

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return members
      .filter((m) =>
        tab === 'barbers' ? m.isBarber && m.active : tab === 'admins' ? m.isAdmin : tab === 'inactive' ? !m.active : true
      )
      .filter((m) => !q || m.name.toLowerCase().includes(q) || m.phone?.includes(q))
  }, [members, tab, search])

  async function saveSchedule(values) {
    setSavingSchedule(true)
    try {
      await updateBarber(editing.barberId, values)
      toast({ title: 'Horario guardado', description: editing.name })
      setEditing(null)
      await load({ silent: true })
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo guardar el horario', description: err.message })
    } finally {
      setSavingSchedule(false)
    }
  }

  async function handleAdd(person) {
    setSavingAdd(true)
    try {
      await addBarber(person.id)
      toast({ title: 'Barbero agregado', description: `${person.full_name} ya puede recibir citas. Revisa su horario.` })
      setAdding(false)
      await load({ silent: true })
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo agregar al barbero', description: err.message })
    } finally {
      setSavingAdd(false)
    }
  }

  async function toggleActive(member, active) {
    setDeactivating(null)
    setTogglingId(member.key)
    try {
      await setBarberActive(member.barberId, active)
      toast({
        title: active ? 'Barbero activado' : 'Barbero desactivado',
        description: active ? `${member.name} vuelve a recibir citas.` : `${member.name} ya no recibe citas nuevas.`,
      })
      await load({ silent: true })
    } catch (err) {
      toast({ tone: 'error', title: 'No se pudo cambiar el estado', description: err.message })
    } finally {
      setTogglingId(null)
    }
  }

  const columns = [
    {
      key: 'miembro',
      header: 'Miembro',
      render: (m) => (
        <div className="flex items-center gap-space-sm min-w-[180px]">
          <Avatar name={m.name} size="sm" />
          <span className="font-body-medium truncate">{m.name}</span>
        </div>
      ),
    },
    { key: 'rol', header: 'Rol', className: 'whitespace-nowrap text-on-surface-variant', render: roleLabel },
    { key: 'telefono', header: 'Teléfono', className: 'tabular-nums whitespace-nowrap text-on-surface-variant', render: (m) => m.phone ?? '—' },
    { key: 'dias', header: 'Días laborales', render: (m) => <WorkDays schedule={m.isBarber ? m.schedule : null} /> },
    {
      key: 'estado',
      header: 'Estado',
      render: (m) => (m.active ? <Badge tone="success" dot>Activo</Badge> : <Badge dot>Inactivo</Badge>),
    },
    {
      key: 'acciones',
      header: <span className="sr-only">Acciones</span>,
      align: 'right',
      render: (m) => (
        <div className="flex items-center justify-end gap-space-xs" onClick={(e) => e.stopPropagation()}>
          {m.isBarber ? (
            <>
              <Button size="sm" variant="secondary" icon={CalendarClock} onClick={() => setEditing(m)}>Horario</Button>
              <Button
                size="sm"
                variant="ghost"
                loading={togglingId === m.key}
                onClick={() => (m.active ? setDeactivating(m) : toggleActive(m, true))}
                className="w-[96px] justify-center"
              >
                {m.active ? 'Desactivar' : 'Activar'}
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" icon={UserPlus} loading={savingAdd} onClick={() => handleAdd({ id: m.profileId, full_name: m.name })}>
              También atiende
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-space-lg">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-baseline gap-space-sm">
            <h1 className="font-headline-page-mobile text-headline-page-mobile md:font-headline-page md:text-headline-page">Equipo</h1>
            {!loading && <span className="text-body-sm text-on-surface-variant">{counts.barbers} barberos activos</span>}
          </div>
          <p className="text-body-default text-on-surface-variant">Barberos, horarios semanales y disponibilidad para recibir citas.</p>
        </div>
        <Button icon={UserPlus} onClick={() => setAdding(true)} className="self-start md:self-auto">Agregar barbero</Button>
      </header>

      {error ? (
        <Card>
          <EmptyState
            icon={CircleAlert}
            title="No se pudo cargar el equipo"
            description={error.message}
            action={<Button variant="secondary" icon={RefreshCw} onClick={() => load()}>Reintentar</Button>}
          />
        </Card>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-gutter" aria-label="Indicadores">
            <KpiCard label="En turno hoy" value={working.length} unit={`de ${activeBarbers.length}`} icon={Users} loading={loading} />
            <KpiCard
              label="Ocupación media hoy"
              value={avgOccupancy == null ? '—' : `${Math.round(avgOccupancy * 100)}%`}
              icon={Gauge}
              loading={loading}
            >
              {!loading && <p className="text-body-sm text-on-surface-variant">Horas reservadas contra horario</p>}
            </KpiCard>
            <KpiCard label="Horas por semana" value={formatDuration(teamWeekly)} icon={Clock} loading={loading}>
              {!loading && <p className="text-body-sm text-on-surface-variant">Suma de los horarios activos</p>}
            </KpiCard>
          </section>

          <Card padding={false} className="overflow-hidden">
            <div className="px-5 pt-1">
              <Tabs
                value={tab}
                onChange={setTab}
                items={[
                  { value: 'all', label: 'Todos', count: loading ? null : counts.all },
                  { value: 'barbers', label: 'Barberos', count: loading ? null : counts.barbers },
                  { value: 'admins', label: 'Administradores', count: loading ? null : counts.admins },
                  { value: 'inactive', label: 'Inactivos', count: loading ? null : counts.inactive },
                ]}
              />
            </div>
            <div className="p-5 border-b border-outline-variant">
              <Input
                aria-label="Buscar miembro"
                icon={Search}
                placeholder="Buscar por nombre o teléfono"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:max-w-xs"
              />
            </div>
            <Table
              columns={columns}
              rows={rows}
              rowKey="key"
              loading={loading}
              skeletonRows={4}
              onRowClick={(m) => m.isBarber && setEditing(m)}
              empty={
                <EmptyState
                  icon={Users}
                  title={members.length === 0 ? 'Aún no hay equipo' : 'Sin resultados'}
                  description={members.length === 0 ? 'Agrega a tu primer barbero para recibir citas.' : 'Nadie coincide con este filtro.'}
                />
              }
            />
          </Card>
        </>
      )}

      <ScheduleDrawer member={editing} saving={savingSchedule} onClose={() => !savingSchedule && setEditing(null)} onSave={saveSchedule} />
      <AddBarberModal open={adding} saving={savingAdd} onClose={() => !savingAdd && setAdding(false)} onAdd={handleAdd} />

      <Modal
        open={!!deactivating}
        onClose={() => setDeactivating(null)}
        size="sm"
        title={`¿Desactivar a ${deactivating?.name.split(' ')[0] ?? ''}?`}
        description="Dejará de aparecer al reservar y no recibirá citas nuevas. Sus citas ya agendadas no cambian: revísalas en Citas por si hay que reasignarlas."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeactivating(null)}>Volver</Button>
            <Button variant="danger" onClick={() => toggleActive(deactivating, false)}>Desactivar</Button>
          </>
        }
      />
    </div>
  )
}
