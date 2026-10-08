import { useEffect, useState } from 'react'
import { differenceInYears, parseISO } from 'date-fns'
import { Ban, CalendarPlus, Cake, MessageCircle, NotebookPen, Pencil, Phone, Scissors, StickyNote, User, UserCheck } from 'lucide-react'
import { Avatar, Badge, Button, Drawer, Skeleton, StatusBadge } from '../../ui'
import { fetchClientHistory, favorites } from '../../../lib/clients'
import { splitNotes, telLink, whatsappLink } from '../../../lib/appointments'
import { formatDate, formatMoneyMXN, formatTime } from '../../../lib/format'

/** Expediente del cliente: datos, estadísticas, preferencias e historial de citas. */
export default function ClientDrawer({ client: c, onClose, onEdit, onToggleBlock, onNewAppointment, onOpenAppointment }) {
  const [history, setHistory] = useState(null)

  useEffect(() => {
    if (!c) return
    let alive = true
    setHistory(null)
    fetchClientHistory(c.id).then((h) => alive && setHistory(h)).catch(() => alive && setHistory([]))
    return () => { alive = false }
  }, [c?.id])

  if (!c) return <Drawer open={false} onClose={onClose} title="" />

  const tel = telLink(c.phone)
  const wa = whatsappLink(c.phone)
  const fav = history ? favorites(history) : null
  const age = c.birthdate ? differenceInYears(new Date(), parseISO(c.birthdate)) : null

  return (
    <Drawer
      open={!!c}
      onClose={onClose}
      title="Expediente del cliente"
      subtitle={c.name}
      footer={
        <>
          <Button variant="ghost" icon={c.blocked ? UserCheck : Ban} onClick={() => onToggleBlock(c)} className="mr-auto">
            {c.blocked ? 'Desbloquear' : 'Bloquear'}
          </Button>
          <Button variant="secondary" icon={Pencil} onClick={() => onEdit(c)}>Editar</Button>
          {!c.blocked && <Button icon={CalendarPlus} onClick={() => onNewAppointment(c)}>Nueva cita</Button>}
        </>
      }
    >
      <div className="flex flex-col gap-space-lg">
        <div className="flex items-center gap-space-md">
          <Avatar name={c.name} size="lg" />
          <div className="min-w-0">
            <p className="font-body-semibold truncate">{c.name}</p>
            <div className="flex flex-wrap items-center gap-space-xs mt-1">
              {c.blocked ? <Badge tone="danger" dot>Bloqueado</Badge> : <Badge tone="success" dot>Activo</Badge>}
              {c.visits >= 5 && <Badge tone="primary">Cliente frecuente</Badge>}
            </div>
          </div>
        </div>

        {(tel || wa) && (
          <div className="flex gap-space-sm">
            {tel && <Button as="a" href={tel} variant="secondary" size="sm" icon={Phone} className="flex-1 justify-center">Llamar</Button>}
            {wa && <Button as="a" href={wa} target="_blank" rel="noreferrer" variant="secondary" size="sm" icon={MessageCircle} className="flex-1 justify-center">WhatsApp</Button>}
          </div>
        )}

        <dl className="grid grid-cols-3 gap-space-sm text-center">
          {[
            ['Visitas', c.visits],
            ['Gasto total', formatMoneyMXN(c.spent)],
            ['Ticket prom.', c.visits ? formatMoneyMXN(Math.round(c.spent / c.visits)) : '—'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-surface-container-low px-2 py-3">
              <dt className="text-[11px] uppercase tracking-wide text-on-surface-variant">{k}</dt>
              <dd className="font-body-semibold tabular-nums mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>

        <dl className="flex flex-col gap-space-sm text-body-sm">
          <div className="flex gap-space-sm"><Phone size={16} className="mt-0.5 text-on-surface-variant" aria-hidden />
            <div><dt className="text-on-surface-variant">Teléfono</dt><dd className="tabular-nums">{c.phone ?? 'Sin teléfono'}</dd></div></div>
          {c.birthdate && (
            <div className="flex gap-space-sm"><Cake size={16} className="mt-0.5 text-on-surface-variant" aria-hidden />
              <div><dt className="text-on-surface-variant">Cumpleaños</dt><dd>{formatDate(parseISO(c.birthdate))} ({age} años)</dd></div></div>
          )}
          {fav?.barber && (
            <div className="flex gap-space-sm"><User size={16} className="mt-0.5 text-on-surface-variant" aria-hidden />
              <div><dt className="text-on-surface-variant">Barbero habitual</dt><dd>{fav.barber.name} ({fav.barber.times} de {c.visits} visitas)</dd></div></div>
          )}
          {fav?.service && (
            <div className="flex gap-space-sm"><Scissors size={16} className="mt-0.5 text-on-surface-variant" aria-hidden />
              <div><dt className="text-on-surface-variant">Servicio habitual</dt><dd>{fav.service.name}</dd></div></div>
          )}
        </dl>

        <section className="flex flex-col gap-space-sm">
          <h3 className="font-body-semibold">Historial de citas</h3>
          {history == null ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : history.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">Aún no tiene citas.</p>
          ) : (
            <ul className="flex flex-col gap-space-sm">
              {history.map((a) => {
                const notes = splitNotes(a.notes)
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => onOpenAppointment(a)}
                      className="w-full text-left rounded-lg border border-outline-variant p-3 hover:bg-surface-container-low transition-colors flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-space-sm">
                        <span className="text-body-sm font-body-medium tabular-nums first-letter:uppercase">{formatDate(a.start)} · {formatTime(a.start)} h</span>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-body-sm text-on-surface-variant">{a.serviceName} · {formatMoneyMXN(a.price)} · {a.barberName}</p>
                      {notes.client && <p className="flex gap-1 text-[12px] text-on-surface-variant"><StickyNote size={12} className="mt-0.5 shrink-0" aria-hidden />{notes.client}</p>}
                      {notes.barber && <p className="flex gap-1 text-[12px] text-on-surface-variant"><NotebookPen size={12} className="mt-0.5 shrink-0" aria-hidden />{notes.barber}</p>}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </Drawer>
  )
}
