// Pasos del alta del negocio (design/stitch/15-onboarding).
import { useRef, useState } from 'react'
import {
  Check, Clock, Copy, ImagePlus, MapPin, Phone, Plus, Scissors, Sparkles, Store, Trash2, Upload, UserPlus, Users,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { WEEK_DAYS } from '../../lib/team'
import { toMinutes } from '../../lib/availability'
import { formatDuration, formatMoneyMXN } from '../../lib/format'
import {
  BUSINESS_TYPES, DURATIONS, SERVICE_SUGGESTIONS, SLUG_BASE, newId, slugify, slugProblem,
} from '../../lib/onboarding'
import { Avatar, Badge, Button, Input, Select, Switch } from '../ui'

const timeClasses =
  'h-9 w-[132px] rounded-lg border bg-surface-container-lowest px-2 text-body-default tabular-nums text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20'

const MAX_LOGO = 5 * 1024 * 1024

export function StepTitle({ title, text }) {
  return (
    <div className="flex flex-col gap-space-xs">
      <h1 className="font-headline-page-mobile text-headline-page-mobile md:font-headline-page md:text-headline-page">{title}</h1>
      {text && <p className="text-body-default text-on-surface-variant">{text}</p>}
    </div>
  )
}

// ── Paso 1: el negocio ──────────────────────────────────────────

function LogoUpload({ value, onChange }) {
  const inputRef = useRef(null)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)

  function read(file) {
    setError(null)
    if (!file) return
    if (!/^image\/(png|jpe?g|svg\+xml|webp)$/.test(file.type)) return setError('Usa una imagen PNG, JPG, SVG o WebP.')
    if (file.size > MAX_LOGO) return setError('La imagen pesa más de 5 MB.')
    const reader = new FileReader()
    reader.onload = () => onChange({ dataUrl: reader.result, name: file.name, size: file.size })
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-body-semibold text-body-sm">Logotipo <span className="font-normal text-on-surface-variant">(opcional)</span></span>
      {value ? (
        <div className="flex items-center gap-space-md p-3 rounded-lg border border-outline-variant">
          <img src={value.dataUrl} alt="Logotipo" className="w-14 h-14 rounded-lg object-contain bg-surface-container-low" />
          <div className="min-w-0 flex-1">
            <p className="font-body-medium text-body-sm truncate">{value.name}</p>
            <p className="text-[12px] text-on-surface-variant">{Math.round(value.size / 1024)} KB</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>Cambiar</Button>
          <Button variant="ghost" size="icon-sm" icon={Trash2} aria-label="Quitar logotipo" onClick={() => onChange(null)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); read(e.dataTransfer.files?.[0]) }}
          className={cn(
            'flex flex-col items-center gap-1.5 rounded-lg border-2 border-dashed px-space-md py-space-lg text-center transition-colors',
            dragging ? 'border-primary bg-primary-fixed/30' : 'border-outline-variant hover:border-primary'
          )}
        >
          <Upload size={22} className="text-on-surface-variant" aria-hidden />
          <span className="text-body-sm"><span className="font-body-medium text-primary">Elige una imagen</span> o arrástrala aquí</span>
          <span className="text-[12px] text-on-surface-variant">PNG, JPG, SVG o WebP · máx. 5 MB · de preferencia cuadrada</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={(e) => { read(e.target.files?.[0]); e.target.value = '' }} />
      {error && <p className="text-body-sm text-error">{error}</p>}
    </div>
  )
}

export function StepNegocio({ draft, update, errors }) {
  const b = draft.business
  const set = (changes) => update((d) => ({ ...d, business: { ...d.business, ...changes } }))
  const slugError = errors.slug ?? (b.slug ? slugProblem(b.slug) : null)
  const [copied, setCopied] = useState(false)

  return (
    <div className="flex flex-col gap-space-lg">
      <StepTitle title="Comencemos con los datos de tu negocio" text="Así aparecerá en tu página de reservas." />

      <Input
        label="Nombre del negocio"
        required
        icon={Store}
        placeholder="Ej. Barbería El Güero"
        value={b.name}
        onChange={(e) => set({ name: e.target.value, ...(b.slugEdited ? {} : { slug: slugify(e.target.value) }) })}
        error={errors.name}
        autoFocus
      />

      <div className="flex flex-col gap-1.5">
        <span className="font-body-semibold text-body-sm">Tipo de negocio</span>
        <div className="grid grid-cols-3 gap-space-sm" role="radiogroup" aria-label="Tipo de negocio">
          {BUSINESS_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={b.type === t.value}
              onClick={() => set({ type: t.value })}
              className={cn(
                'h-11 rounded-lg border text-body-sm font-body-medium flex items-center justify-center gap-1.5 transition-colors',
                b.type === t.value ? 'border-primary bg-primary-fixed/40 text-on-primary-fixed-variant ring-1 ring-primary' : 'border-outline-variant hover:border-primary'
              )}
            >
              {b.type === t.value && <Check size={16} aria-hidden />} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-space-md">
        <Input label="Teléfono / WhatsApp" required type="tel" inputMode="tel" icon={Phone} placeholder="938 123 4567" value={b.phone} onChange={(e) => set({ phone: e.target.value })} error={errors.phone} hint="Para que tus clientes te contacten." />
        <Input label="Dirección" icon={MapPin} placeholder="Calle, número y colonia" value={b.address} onChange={(e) => set({ address: e.target.value })} hint="Opcional. Se muestra con un enlace a Google Maps." />
      </div>

      <LogoUpload value={b.logo} onChange={(logo) => set({ logo })} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="slug" className="font-body-semibold text-body-sm">Dirección de tu página de reservas</label>
        <div className={cn('flex items-center h-9 rounded-lg border bg-surface-container-lowest overflow-hidden focus-within:ring-2 focus-within:ring-primary/20', slugError ? 'border-error' : 'border-outline-variant focus-within:border-primary')}>
          <span className="pl-3 pr-1 text-body-default text-on-surface-variant whitespace-nowrap">{SLUG_BASE}</span>
          <input
            id="slug"
            value={b.slug}
            onChange={(e) => set({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-'), slugEdited: true })}
            placeholder="tu-barberia"
            aria-invalid={slugError ? true : undefined}
            className="flex-1 min-w-0 h-full pr-3 bg-transparent text-body-default text-on-surface focus:outline-none"
          />
          {b.slug && !slugError && <span className="pr-3 text-emerald-600 inline-flex items-center gap-1 text-body-sm"><Check size={16} aria-hidden /> Disponible</span>}
        </div>
        {slugError ? (
          <p className="text-body-sm text-error">{slugError}</p>
        ) : (
          <div className="flex items-center justify-between gap-space-sm text-body-sm text-on-surface-variant">
            <span>Tus clientes reservarán desde este enlace.</span>
            {b.slug && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(`https://${SLUG_BASE}${b.slug}`)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  } catch {
                    // sin portapapeles disponible: no pasa nada
                  }
                }}
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <Copy size={14} aria-hidden /> {copied ? 'Copiado' : 'Copiar'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Paso 2: horario ─────────────────────────────────────────────

const HOUR_TEMPLATES = [
  { label: 'Lun–Sáb 9:00–20:00', apply: (k) => ({ isOpen: k !== '0', open: '09:00', close: '20:00' }) },
  { label: 'Lun–Vie 10:00–19:00', apply: (k) => ({ isOpen: !['0', '6'].includes(k), open: '10:00', close: '19:00' }) },
  { label: 'Todos los días 10:00–21:00', apply: () => ({ isOpen: true, open: '10:00', close: '21:00' }) },
]

export function StepHorario({ draft, update, errors }) {
  const setDay = (key, changes) => update((d) => ({ ...d, hours: { ...d.hours, [key]: { ...d.hours[key], ...changes } } }))
  const apply = (fn) => update((d) => ({ ...d, hours: Object.fromEntries(WEEK_DAYS.map(({ key }) => [key, fn(key, d.hours[key])])) }))
  const weekly = WEEK_DAYS.reduce((s, { key }) => {
    const h = draft.hours[key]
    return h.isOpen ? s + Math.max(0, toMinutes(h.close) - toMinutes(h.open)) : s
  }, 0)

  return (
    <div className="flex flex-col gap-space-lg">
      <StepTitle title="¿Qué días y a qué hora abres?" text="Es el horario del local. Después podrás ajustar el turno de cada barbero en Equipo." />

      <div className="flex flex-wrap gap-space-xs">
        {HOUR_TEMPLATES.map((t) => (
          <Button key={t.label} size="sm" variant="secondary" icon={Sparkles} onClick={() => apply((k) => t.apply(k))}>{t.label}</Button>
        ))}
        <Button size="sm" variant="ghost" icon={Copy} onClick={() => apply((k, h) => (k === '0' ? h : { ...draft.hours[1], isOpen: h.isOpen }))}>
          Copiar horario del lunes
        </Button>
      </div>

      <ul className="flex flex-col divide-y divide-outline-variant border-y border-outline-variant">
        {WEEK_DAYS.map(({ key, name }) => {
          const h = draft.hours[key]
          const err = errors[`day${key}`]
          return (
            <li key={key} className="py-3 flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-space-sm">
                <Switch checked={h.isOpen} onChange={(v) => setDay(key, { isOpen: v })} aria-label={`Abre el ${name.toLowerCase()}`} />
                <span className={cn('w-24 font-body-medium text-body-sm', !h.isOpen && 'text-outline')}>{name}</span>
                {h.isOpen ? (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <input type="time" step="1800" aria-label={`Apertura ${name}`} value={h.open} onChange={(e) => setDay(key, { open: e.target.value })} className={cn(timeClasses, err ? 'border-error' : 'border-outline-variant')} />
                    <span className="text-on-surface-variant">–</span>
                    <input type="time" step="1800" aria-label={`Cierre ${name}`} value={h.close} onChange={(e) => setDay(key, { close: e.target.value })} className={cn(timeClasses, err ? 'border-error' : 'border-outline-variant')} />
                  </div>
                ) : (
                  <span className="ml-auto text-body-sm text-outline">Cerrado</span>
                )}
              </div>
              {err && <p className="text-[12px] text-error text-right">{err}</p>}
            </li>
          )
        })}
      </ul>
      <div className="flex items-center justify-between text-body-sm">
        {errors.hours ? <p className="text-error">{errors.hours}</p> : <span />}
        <span className="text-on-surface-variant inline-flex items-center gap-1"><Clock size={14} aria-hidden /> {formatDuration(weekly)} a la semana</span>
      </div>
    </div>
  )
}

// ── Paso 3: servicios ───────────────────────────────────────────

export function StepServicios({ draft, update, errors }) {
  const services = draft.services
  const setServices = (fn) => update((d) => ({ ...d, services: fn(d.services) }))
  const setOne = (id, changes) => setServices((list) => list.map((s) => (s.id === id ? { ...s, ...changes } : s)))
  const used = new Set(services.map((s) => s.name.trim().toLowerCase()))

  return (
    <div className="flex flex-col gap-space-lg">
      <StepTitle title="¿Qué servicios ofreces?" text="Tus clientes los elegirán al reservar. Puedes cambiarlos cuando quieras." />

      <div className="flex flex-col gap-space-xs">
        <span className="text-body-sm text-on-surface-variant">Agrega rápido:</span>
        <div className="flex flex-wrap gap-space-xs">
          {SERVICE_SUGGESTIONS.filter((s) => !used.has(s.name.toLowerCase())).map((s) => (
            <Button key={s.name} size="sm" variant="secondary" icon={Plus} onClick={() => setServices((list) => [...list, { id: newId(), ...s }])}>
              {s.name}
            </Button>
          ))}
        </div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant p-space-lg text-center text-body-sm text-on-surface-variant">
          <Scissors size={22} className="mx-auto mb-1" aria-hidden />
          Aún no hay servicios. Usa una sugerencia o agrega uno propio.
        </div>
      ) : (
        <ul className="flex flex-col gap-space-sm">
          {services.map((s) => (
            <li key={s.id} className="rounded-lg border border-outline-variant p-3 grid grid-cols-1 sm:grid-cols-[1fr_120px_130px_auto] gap-space-sm items-start">
              <Input aria-label="Nombre del servicio" placeholder="Nombre del servicio" value={s.name} onChange={(e) => setOne(s.id, { name: e.target.value })} error={errors[`name-${s.id}`]} />
              <Input aria-label="Precio" type="number" min="0" step="10" suffix="MXN" value={s.price} onChange={(e) => setOne(s.id, { price: e.target.value })} error={errors[`price-${s.id}`]} />
              <Select aria-label="Duración" value={String(s.duration)} onChange={(e) => setOne(s.id, { duration: Number(e.target.value) })} options={DURATIONS.map((d) => ({ value: String(d), label: formatDuration(d) }))} />
              <Button variant="ghost" size="icon" icon={Trash2} aria-label={`Quitar ${s.name || 'servicio'}`} onClick={() => setServices((list) => list.filter((x) => x.id !== s.id))} />
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-space-sm">
        <Button variant="ghost" icon={Plus} onClick={() => setServices((list) => [...list, { id: newId(), name: '', price: '', duration: 30 }])}>
          Agregar servicio propio
        </Button>
        {errors.services && <p className="text-body-sm text-error">{errors.services}</p>}
      </div>
    </div>
  )
}

// ── Paso 4: equipo ──────────────────────────────────────────────

export function StepEquipo({ draft, update, errors }) {
  const t = draft.team
  const setTeam = (changes) => update((d) => ({ ...d, team: { ...d.team, ...(typeof changes === 'function' ? changes(d.team) : changes) } }))
  const setBarber = (id, changes) => setTeam((tm) => ({ barbers: tm.barbers.map((b) => (b.id === id ? { ...b, ...changes } : b)) }))

  return (
    <div className="flex flex-col gap-space-lg">
      <StepTitle title="¿Quiénes atienden?" text="Cada barbero tendrá su propia agenda. Podrás agregar o quitar personas después." />

      <div className="rounded-lg border border-outline-variant p-space-md flex flex-col gap-space-md">
        <Switch checked={t.ownerWorks} onChange={(v) => setTeam({ ownerWorks: v })} label="Yo también atiendo clientes" description="Aparecerás como barbero al reservar." />
        {t.ownerWorks && (
          <Input label="Tu nombre" required placeholder="Como te verán tus clientes" value={t.ownerName} onChange={(e) => setTeam({ ownerName: e.target.value })} error={errors.ownerName} />
        )}
      </div>

      {t.barbers.length > 0 && (
        <ul className="flex flex-col gap-space-sm">
          {t.barbers.map((b) => (
            <li key={b.id} className="rounded-lg border border-outline-variant p-3 grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr_auto] gap-space-sm items-start">
              <Avatar name={b.name || '?'} className="hidden sm:inline-flex mt-0.5" />
              <Input aria-label="Nombre del barbero" placeholder="Nombre" value={b.name} onChange={(e) => setBarber(b.id, { name: e.target.value })} error={errors[`barber-${b.id}`]} />
              <Input aria-label="Teléfono del barbero" type="tel" placeholder="Teléfono (opcional)" value={b.phone} onChange={(e) => setBarber(b.id, { phone: e.target.value })} />
              <Button variant="ghost" size="icon" icon={Trash2} aria-label={`Quitar ${b.name || 'barbero'}`} onClick={() => setTeam((tm) => ({ barbers: tm.barbers.filter((x) => x.id !== b.id) }))} />
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-space-sm">
        <Button variant="secondary" icon={UserPlus} onClick={() => setTeam((tm) => ({ barbers: [...tm.barbers, { id: newId(), name: '', phone: '' }] }))}>
          Agregar barbero
        </Button>
        {errors.team && <p className="text-body-sm text-error">{errors.team}</p>}
      </div>
      <p className="text-body-sm text-on-surface-variant">
        Cada barbero entrará con su propia cuenta para ver su agenda. Las invitaciones se enviarán cuando se active el guardado del negocio.
      </p>
    </div>
  )
}

// ── Paso 5: vista previa ────────────────────────────────────────

export function StepVista({ draft }) {
  const b = draft.business
  const team = [...(draft.team.ownerWorks ? [{ id: 'owner', name: draft.team.ownerName }] : []), ...draft.team.barbers]
  const openDays = WEEK_DAYS.filter(({ key }) => draft.hours[key].isOpen)
  const type = BUSINESS_TYPES.find((t) => t.value === b.type)?.label

  return (
    <div className="flex flex-col gap-space-lg">
      <StepTitle title="Así se verá tu página de reservas" text="Revisa que todo esté bien. Puedes volver a cualquier paso para corregir." />

      <div className="rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="h-8 flex items-center gap-1.5 px-3 border-b border-outline-variant bg-surface-container-low">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-300" /><span className="w-2.5 h-2.5 rounded-full bg-amber-300" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          <span className="ml-2 text-[11px] text-on-surface-variant truncate">{SLUG_BASE}{b.slug}</span>
        </div>
        <div className="bg-background p-space-md flex flex-col gap-space-md">
          <div className="rounded-lg bg-inverse-surface text-inverse-on-surface p-space-md flex items-center gap-space-md">
            {b.logo ? (
              <img src={b.logo.dataUrl} alt="" className="w-14 h-14 rounded-lg object-contain bg-white shrink-0" />
            ) : (
              <span className="w-14 h-14 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0"><Scissors size={24} aria-hidden /></span>
            )}
            <div className="min-w-0">
              <p className="text-[20px] font-semibold text-white truncate">{b.name}</p>
              <p className="text-body-sm text-slate-300">{type}{b.address ? ` · ${b.address}` : ''}</p>
              <p className="text-body-sm text-slate-300 tabular-nums">{b.phone}</p>
            </div>
          </div>

          <div>
            <p className="font-body-semibold text-body-sm mb-space-xs">Servicios</p>
            <div className="grid sm:grid-cols-2 gap-space-xs">
              {draft.services.map((s) => (
                <div key={s.id} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 flex items-center justify-between gap-space-sm text-body-sm">
                  <span className="truncate">{s.name} <span className="text-on-surface-variant">· {formatDuration(s.duration)}</span></span>
                  <span className="font-body-medium tabular-nums">{formatMoneyMXN(Number(s.price))}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-space-md">
            <div>
              <p className="font-body-semibold text-body-sm mb-space-xs">Equipo</p>
              <div className="flex flex-wrap gap-space-xs">
                {team.map((m) => (
                  <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest pl-0.5 pr-2.5 py-0.5 text-body-sm">
                    <Avatar name={m.name} size="sm" className="!w-6 !h-6 !text-[10px]" /> {m.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-body-semibold text-body-sm mb-space-xs">Horario</p>
              <ul className="text-body-sm text-on-surface-variant tabular-nums">
                {openDays.map(({ key, name }) => (
                  <li key={key} className="flex justify-between"><span>{name}</span><span>{draft.hours[key].open} – {draft.hours[key].close}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-space-sm text-center">
        {[
          [Scissors, draft.services.length, draft.services.length === 1 ? 'servicio' : 'servicios'],
          [Users, team.length, team.length === 1 ? 'barbero' : 'barberos'],
          [Clock, openDays.length, openDays.length === 1 ? 'día abierto' : 'días abiertos'],
        ].map(([Icon, n, label]) => (
          <div key={label} className="rounded-lg bg-surface-container-low py-3">
            <Icon size={18} className="mx-auto text-primary" aria-hidden />
            <p className="font-body-semibold tabular-nums mt-1">{n}</p>
            <p className="text-[12px] text-on-surface-variant">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-amber-50 text-amber-900 px-space-md py-3 text-body-sm flex gap-space-sm">
        <ImagePlus size={18} className="shrink-0 mt-0.5" aria-hidden />
        <p>
          <span className="font-body-semibold">Versión de demostración.</span> Tus datos se guardan solo en este navegador. Crear la barbería en Barber OS se activará cuando conectemos la base de datos.
        </p>
      </div>
      <Badge tone="neutral" className="self-start">Borrador guardado en este navegador</Badge>
    </div>
  )
}
