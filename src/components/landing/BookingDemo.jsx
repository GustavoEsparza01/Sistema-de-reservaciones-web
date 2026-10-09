// Mini reserva interactiva para el landing de Barber OS: el visitante elige día y hora
// y "solicita" como lo haría un cliente. Es la misma interfaz del portal (carbón, dorado,
// barra de abajo) con datos de ejemplo: no consulta ni guarda nada.
import { useMemo, useState } from 'react'
import { addDays, format, isToday, isTomorrow, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarCheck, RotateCcw, Sun, Sunset } from 'lucide-react'
import { cn } from '../../lib/cn'

const SERVICE = { name: 'Corte clásico', duration: '45 min', price: '$200' }
// Igual que en el portal: antes de las 12:00 es "Por la mañana"
const GROUPS = [
  ['Por la mañana', Sun, ['10:00', '10:45', '11:30']],
  ['Por la tarde', Sunset, ['12:15', '13:00', '16:00', '16:45', '17:30', '18:15']],
]
const STEPS = ['Servicio', 'Barbero', 'Fecha y hora', 'Solicitar']

// Algunos horarios ocupados por día (siempre los mismos). Como en el portal, no se muestran
const taken = (dayIndex, i) => (dayIndex * 3 + i * 5) % 7 === 0

const dayLabel = (d) => (isToday(d) ? 'Hoy' : isTomorrow(d) ? 'Mañana' : format(d, 'EEE', { locale: es }).replace('.', ''))

export default function BookingDemo({ className, style }) {
  const days = useMemo(() => Array.from({ length: 5 }, (_, i) => addDays(startOfDay(new Date()), i + 1)), [])
  const [day, setDay] = useState(0)
  const [time, setTime] = useState(null)
  const [sent, setSent] = useState(false)

  const reset = () => { setSent(false); setTime(null); setDay(0) }

  return (
    <figure className={cn('flex flex-col items-center gap-space-md', className)} style={style}>
      {/* Marco de teléfono */}
      <div className="w-[280px] sm:w-[300px] rounded-[2.4rem] bg-ink-raised p-2 ring-1 ring-white/10 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
        <div className="relative h-[560px] sm:h-[600px] rounded-[2rem] bg-cream text-ink overflow-hidden flex flex-col">
          {/* Barra superior del portal */}
          <div className="bg-ink text-white px-4 pt-5 pb-3">
            <p className="font-display text-[15px] font-semibold">Tu barbería</p>
            <p className="text-[11px] text-ink-muted">Datos de ejemplo</p>
          </div>

          {sent ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-space-md px-5">
              <span className="confirm-badge w-14 h-14 rounded-full bg-ink text-gold ring-1 ring-gold/40 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path className="confirm-check" pathLength="1" d="M5.5 12.5l4.25 4.25L18.5 7.5" />
                </svg>
              </span>
              <div className="confirm-item" style={{ '--i': 0 }}>
                <p className="font-display text-[22px] leading-tight font-semibold">¡Enviamos tu solicitud!</p>
                <p className="text-[13px] text-ink/70 mt-1">
                  {SERVICE.name}, {format(days[day], "EEEE d 'de' MMMM", { locale: es })} a las {time} h.
                </p>
              </div>
              <p className="confirm-item text-[12px] text-ink/70 max-w-[22ch]" style={{ '--i': 1 }}>
                La barbería la confirma y te avisa.
              </p>
              <button
                type="button"
                onClick={reset}
                className="confirm-item inline-flex items-center gap-1.5 h-11 px-4 rounded-lg border border-ink/20 bg-white text-[13px] font-body-medium transition-[transform,border-color] duration-150 ease-out-strong active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                style={{ '--i': 2 }}
              >
                <RotateCcw size={16} strokeWidth={1.75} aria-hidden /> Probar otra vez
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-3 px-4 pt-3 min-h-0">
              {/* Stepper: el demo empieza en "Fecha y hora" */}
              <ol className="grid grid-cols-4 gap-1" aria-label="Pasos de la reserva">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex flex-col gap-1" aria-current={i === 2 ? 'step' : undefined}>
                    <span className={cn('h-0.5 rounded-full', i <= 2 ? 'bg-gold' : 'bg-ink/10')} />
                    <span className={cn('text-[9px]', i === 2 ? 'text-gold-deep font-body-semibold' : 'text-ink/60')}>{s}</span>
                  </li>
                ))}
              </ol>

              <p className="font-display text-[19px] font-semibold">Elige día y hora</p>

              <div className="grid grid-cols-5 gap-1" role="radiogroup" aria-label="Día">
                {days.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={day === i}
                    aria-label={format(d, "EEEE d 'de' MMMM", { locale: es })}
                    onClick={() => { setDay(i); setTime(null) }}
                    className={cn(
                      'rounded-lg border py-1.5 flex flex-col items-center transition-[transform,background-color,border-color] duration-150 ease-out-strong active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                      day === i ? 'bg-ink border-ink text-white' : 'bg-white border-ink/10'
                    )}
                  >
                    <span className={cn('text-[9px] uppercase font-semibold', day === i ? 'text-gold-light' : 'text-ink/70')}>{dayLabel(d)}</span>
                    <span className="text-[14px] font-body-semibold tabular-nums">{format(d, 'd')}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2" role="radiogroup" aria-label="Hora">
                {GROUPS.map(([label, Icon, times], g) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <p className="flex items-center gap-1 text-[11px] font-body-semibold text-ink/70"><Icon size={13} strokeWidth={1.75} aria-hidden /> {label}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {times.filter((_, i) => !taken(day, g * 3 + i)).map((t) => {
                        return (
                          <button
                            key={t}
                            type="button"
                            role="radio"
                            aria-checked={time === t}
                            onClick={() => setTime(t)}
                            className={cn(
                              'h-11 rounded-lg border text-[13px] font-body-medium tabular-nums transition-[transform,background-color,border-color,color] duration-150 ease-out-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
                              'active:scale-[0.96]',
                              (time === t ? 'bg-ink border-ink text-gold-light' : 'bg-white border-ink/10')
                            )}
                          >
                            {t}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-ink/70">Solo ves horarios libres: lo ocupado no aparece.</p>
            </div>
          )}

          {/* Barra de abajo, igual que en el portal */}
          {!sent && (
            <div className="bg-ink text-white px-4 pt-3 pb-5 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-ink-muted truncate">{SERVICE.name} · {SERVICE.duration}</p>
                <p className="font-display text-[18px] font-semibold text-gold leading-tight">{SERVICE.price} <span className="font-sans text-[11px] text-ink-muted">MXN</span></p>
              </div>
              <button
                type="button"
                disabled={!time}
                onClick={() => setSent(true)}
                className="inline-flex items-center gap-1.5 h-11 px-4 rounded-lg bg-gold text-ink text-[13px] font-body-semibold transition-[transform,opacity] duration-150 ease-out-strong active:scale-[0.97] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                <CalendarCheck size={16} strokeWidth={1.75} aria-hidden /> Solicitar
              </button>
            </div>
          )}
        </div>
      </div>
      <figcaption className="text-[13px] text-ink-muted text-center max-w-[30ch]">
        Pruébalo: así reserva tu cliente desde su celular. Datos de ejemplo.
      </figcaption>
    </figure>
  )
}
