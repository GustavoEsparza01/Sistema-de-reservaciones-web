import { useEffect, useState } from 'react'
import { Avatar, Button, Drawer, Select, Switch, Tabs, Textarea } from '../../ui'
import { cn } from '../../../lib/cn'
import { formatDuration } from '../../../lib/format'
import {
  BIO_MAX, SCHEDULE_TEMPLATES, WEEK_DAYS, scheduleErrors, toMinutes, weeklyMinutes,
} from '../../../lib/team'

const timeClasses =
  'h-9 w-[104px] rounded-lg border bg-surface-container-lowest px-2 text-body-default tabular-nums text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20'

/** Panel para editar el horario semanal y la biografía pública de un barbero. */
export default function ScheduleDrawer({ member, saving, onClose, onSave }) {
  const [tab, setTab] = useState('horario')
  const [schedule, setSchedule] = useState(null)
  const [bio, setBio] = useState('')
  const [template, setTemplate] = useState('')

  useEffect(() => {
    if (!member) return
    setSchedule(member.schedule)
    setBio(member.bio ?? '')
    setTab('horario')
    setTemplate('')
  }, [member])

  if (!member || !schedule) return <Drawer open={false} onClose={onClose} title="" />

  const errors = scheduleErrors(schedule)
  const invalid = Object.keys(errors).length > 0 || bio.length > BIO_MAX

  const setDay = (key, changes) => {
    setTemplate('')
    setSchedule((s) => ({ ...s, [key]: { ...s[key], ...changes } }))
  }

  // Aplica la plantilla a los días que trabaja
  function applyTemplate(value) {
    setTemplate(value)
    const t = SCHEDULE_TEMPLATES.find((x) => x.value === value)
    if (!t) return
    setSchedule((s) =>
      Object.fromEntries(Object.entries(s).map(([k, d]) => [k, d.isWorking ? { ...d, start: t.start, end: t.end } : d]))
    )
  }

  return (
    <Drawer
      open={!!member}
      onClose={onClose}
      title={`Horario de ${member.name.split(' ')[0]}`}
      subtitle={member.isAdmin ? 'Administrador y barbero' : 'Barbero'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button loading={saving} disabled={invalid} onClick={() => onSave({ schedule, bio })}>Guardar cambios</Button>
        </>
      }
    >
      <div className="flex flex-col gap-space-lg">
        <div className="flex items-center gap-space-md">
          <Avatar name={member.name} size="lg" />
          <div className="min-w-0">
            <p className="font-body-semibold text-on-surface truncate">{member.name}</p>
            {member.phone && <p className="text-body-sm text-on-surface-variant tabular-nums">{member.phone}</p>}
          </div>
        </div>

        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'horario', label: 'Horario semanal' },
            { value: 'perfil', label: 'Perfil público' },
          ]}
        />

        {tab === 'horario' ? (
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between gap-space-sm">
              <span className="font-body-semibold text-body-sm">Jornada semanal</span>
              <span className="text-body-sm text-on-surface-variant tabular-nums">{formatDuration(weeklyMinutes(schedule))} en total</span>
            </div>

            <Select
              label="Plantilla de horario"
              hint="Se aplica a los días que trabaja."
              placeholder="Personalizado"
              value={template}
              onChange={(e) => applyTemplate(e.target.value)}
              options={SCHEDULE_TEMPLATES}
            />

            <ul className="flex flex-col divide-y divide-outline-variant border-y border-outline-variant">
              {WEEK_DAYS.map(({ key, name }) => {
                const d = schedule[key]
                const minutes = toMinutes(d.end) - toMinutes(d.start)
                return (
                  <li key={key} className="py-3 flex flex-col gap-1.5">
                    <div className="flex items-center gap-space-sm">
                      <Switch checked={d.isWorking} onChange={(v) => setDay(key, { isWorking: v })} aria-label={`Trabaja el ${name.toLowerCase()}`} className="shrink-0" />
                      <span className={cn('w-24 font-body-medium text-body-sm', !d.isWorking && 'text-outline')}>{name}</span>
                      {d.isWorking ? (
                        <div className="flex items-center gap-1.5 ml-auto">
                          <input
                            type="time"
                            step="1800"
                            aria-label={`Entrada ${name}`}
                            value={d.start}
                            onChange={(e) => setDay(key, { start: e.target.value })}
                            className={cn(timeClasses, errors[key] ? 'border-error' : 'border-outline-variant')}
                          />
                          <span className="text-on-surface-variant">–</span>
                          <input
                            type="time"
                            step="1800"
                            aria-label={`Salida ${name}`}
                            value={d.end}
                            onChange={(e) => setDay(key, { end: e.target.value })}
                            className={cn(timeClasses, errors[key] ? 'border-error' : 'border-outline-variant')}
                          />
                        </div>
                      ) : (
                        <span className="ml-auto text-body-sm text-outline">Descanso</span>
                      )}
                    </div>
                    {d.isWorking && (
                      <p className={cn('text-[12px] text-right', errors[key] ? 'text-error' : 'text-on-surface-variant')}>
                        {errors[key] ?? formatDuration(minutes)}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
            <p className="text-body-sm text-on-surface-variant">
              Los cambios aplican a las reservas nuevas. Las citas ya agendadas no se mueven.
            </p>
          </div>
        ) : (
          <Textarea
            label="Biografía pública"
            hint="Los clientes la verán al elegir barbero."
            placeholder="Especialidades, experiencia, estilo de trabajo…"
            rows={6}
            maxLength={BIO_MAX}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            error={bio.length > BIO_MAX ? `Máximo ${BIO_MAX} caracteres.` : undefined}
          />
        )}
      </div>
    </Drawer>
  )
}
