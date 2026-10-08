// Pantalla Configuración (design/stitch/08-configuracion).
// Versión inicial: perfil, seguridad, página de reservas y accesos. Los datos del
// negocio, horario general, notificaciones y suscripción llegan con la Fase 5.
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Bell, Check, Copy, CreditCard, ExternalLink, Globe, KeyRound, Lock, Store, Clock, User, Users,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useBusiness } from '../../hooks/useBusiness'
import { cn } from '../../lib/cn'
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Input, useToast } from '../../components/ui'

const SECTIONS = [
  { value: 'perfil', label: 'Mi perfil', icon: User },
  { value: 'seguridad', label: 'Seguridad', icon: Lock },
  { value: 'reservas', label: 'Página de reservas', icon: Globe },
  { value: 'usuarios', label: 'Usuarios y permisos', icon: Users },
  { value: 'negocio', label: 'Datos del negocio', icon: Store, soon: true },
  { value: 'horario', label: 'Horario del negocio', icon: Clock, soon: true },
  { value: 'notificaciones', label: 'Notificaciones', icon: Bell, soon: true },
  { value: 'suscripcion', label: 'Suscripción y facturación', icon: CreditCard, soon: true },
]

function ProfileSection() {
  const { session, profile, refreshProfile, isAdmin, isBarber } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({ full_name: profile?.full_name ?? '', phone: profile?.phone ?? '' })
  }, [profile])

  const dirty = form.full_name !== (profile?.full_name ?? '') || form.phone !== (profile?.phone ?? '')

  async function handleSubmit(e) {
    e.preventDefault()
    const found = {}
    const name = form.full_name.trim()
    const phone = form.phone.trim()
    if (!name) found.full_name = 'Escribe tu nombre.'
    if (phone && phone.replace(/\D/g, '').length < 10) found.phone = 'El teléfono debe tener al menos 10 dígitos.'
    setErrors(found)
    if (Object.keys(found).length) return

    setSaving(true)
    const { error } = await supabase.from('profiles').update({ full_name: name, phone: phone || null }).eq('id', session.user.id)
    setSaving(false)
    if (error) {
      toast({ tone: 'error', title: 'No se pudo guardar tu perfil', description: error.message })
      return
    }
    await refreshProfile()
    toast({ title: 'Perfil actualizado' })
  }

  return (
    <Card className="flex flex-col gap-space-lg">
      <CardHeader title="Mi perfil" description="Así te ven tu equipo y tus clientes." />
      <div className="flex items-center gap-space-md">
        <Avatar name={form.full_name || 'Usuario'} size="lg" />
        <div>
          <p className="font-body-semibold">{profile?.full_name || 'Sin nombre'}</p>
          <div className="flex gap-space-xs mt-1">
            {isAdmin && <Badge tone="primary">Administrador</Badge>}
            {isBarber && <Badge tone="success">Barbero</Badge>}
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <Input label="Nombre completo" required value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} error={errors.full_name} />
        <Input label="Teléfono" type="tel" inputMode="tel" placeholder="55 1234 5678" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} error={errors.phone} />
        <Input label="Correo" value={session?.user?.email ?? ''} disabled readOnly hint="El correo se usa para iniciar sesión y no se puede cambiar aquí." className="sm:col-span-2" />
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" loading={saving} disabled={!dirty}>Guardar cambios</Button>
        </div>
      </form>
    </Card>
  )
}

function SecuritySection() {
  const toast = useToast()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const found = {}
    if (form.password.length < 8) found.password = 'Usa al menos 8 caracteres.'
    if (form.confirm !== form.password) found.confirm = 'Las contraseñas no coinciden.'
    setErrors(found)
    if (Object.keys(found).length) return

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: form.password })
    setSaving(false)
    if (error) {
      toast({ tone: 'error', title: 'No se pudo cambiar la contraseña', description: error.message })
      return
    }
    setForm({ password: '', confirm: '' })
    toast({ title: 'Contraseña actualizada' })
  }

  return (
    <Card className="flex flex-col gap-space-lg">
      <CardHeader title="Seguridad" description="Cambia la contraseña con la que inicias sesión." />
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <Input label="Nueva contraseña" type="password" autoComplete="new-password" icon={KeyRound} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password} hint="Mínimo 8 caracteres." />
        <Input label="Confirmar contraseña" type="password" autoComplete="new-password" icon={KeyRound} value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} error={errors.confirm} />
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" loading={saving} disabled={!form.password}>Cambiar contraseña</Button>
        </div>
      </form>
    </Card>
  )
}

function BookingSection() {
  const business = useBusiness()
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  // Hasta la Fase 4 la reserva pública vive en la raíz del sitio; después será /{slug}
  const url = `${window.location.origin}/`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ tone: 'error', title: 'No se pudo copiar', description: 'Selecciona el enlace y cópialo manualmente.' })
    }
  }

  return (
    <Card className="flex flex-col gap-space-lg">
      <CardHeader title="Página de reservas" description={`Comparte este enlace para que los clientes de ${business.name} reserven en línea.`} />
      <div className="flex flex-col sm:flex-row gap-space-sm">
        <Input aria-label="Enlace de reservas" value={url} readOnly onFocus={(e) => e.target.select()} className="flex-1" />
        <Button variant="secondary" icon={copied ? Check : Copy} onClick={copy}>{copied ? 'Copiado' : 'Copiar enlace'}</Button>
        <Button as="a" href={url} target="_blank" rel="noreferrer" variant="secondary" icon={ExternalLink}>Abrir</Button>
      </div>
      <p className="text-body-sm text-on-surface-variant">
        Cuando Barber OS admita varios negocios, cada uno tendrá su propia dirección, por ejemplo <span className="font-body-medium text-on-surface">…/{business.slug}</span>.
      </p>
    </Card>
  )
}

function UsersSection() {
  return (
    <Card className="flex flex-col gap-space-md">
      <CardHeader title="Usuarios y permisos" description="Quién trabaja en tu negocio y qué puede hacer." />
      <ul className="flex flex-col gap-space-sm text-body-sm text-on-surface-variant list-disc pl-5">
        <li><span className="text-on-surface font-body-medium">Administrador:</span> ve todo el panel, el equipo, los servicios y los reportes.</li>
        <li><span className="text-on-surface font-body-medium">Barbero:</span> ve y atiende su propia agenda.</li>
        <li><span className="text-on-surface font-body-medium">Cliente:</span> reserva y consulta sus citas.</li>
      </ul>
      <div>
        <Button as={Link} to="/app/equipo" variant="secondary" icon={Users}>Administrar equipo</Button>
      </div>
    </Card>
  )
}

function ComingSoon({ section }) {
  const texts = {
    negocio: 'Nombre, logotipo, dirección y teléfono del negocio. Hoy se muestran los datos de Peludos Barber Shop.',
    horario: 'Días y horas de apertura del local. Mientras tanto, la disponibilidad depende del horario de cada barbero en Equipo.',
    notificaciones: 'Avisos y recordatorios automáticos por correo o WhatsApp para ti y tus clientes.',
    suscripcion: 'Plan de Barber OS, métodos de pago y facturas. Aún no hay cobro de suscripción.',
  }
  return (
    <Card>
      <EmptyState
        icon={section.icon}
        title={`${section.label} · próximamente`}
        description={`${texts[section.value]} Esta sección llegará con la versión para varios negocios.`}
      />
    </Card>
  )
}

export default function Configuracion() {
  const [params, setParams] = useSearchParams()
  const current = SECTIONS.find((s) => s.value === params.get('seccion')) ?? SECTIONS[0]

  return (
    <div className="flex flex-col gap-space-lg">
      <header className="flex flex-col gap-space-xs">
        <h1 className="font-headline-page-mobile text-headline-page-mobile md:font-headline-page md:text-headline-page">Configuración</h1>
        <p className="text-body-default text-on-surface-variant">Tu perfil, seguridad y la información de tu negocio.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-gutter items-start">
        <nav aria-label="Secciones de configuración" className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-1 px-1 pb-1 lg:pb-0">
          {SECTIONS.map((s) => {
            const Icon = s.icon
            const active = s.value === current.value
            return (
              <button
                key={s.value}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => setParams(s.value === 'perfil' ? {} : { seccion: s.value }, { replace: true })}
                className={cn(
                  'flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-body-medium font-body-medium whitespace-nowrap text-left transition-colors',
                  active ? 'bg-primary-fixed text-on-primary-fixed-variant font-body-semibold' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                )}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden />
                <span className="flex-1">{s.label}</span>
                {s.soon && <span className="text-[10px] font-semibold uppercase tracking-wide text-outline">Pronto</span>}
              </button>
            )
          })}
        </nav>

        <div className="min-w-0">
          {current.value === 'perfil' && <ProfileSection />}
          {current.value === 'seguridad' && <SecuritySection />}
          {current.value === 'reservas' && <BookingSection />}
          {current.value === 'usuarios' && <UsersSection />}
          {current.soon && <ComingSoon section={current} />}
        </div>
      </div>
    </div>
  )
}
