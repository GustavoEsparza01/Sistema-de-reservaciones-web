// Pantalla Configuración (design/stitch/08-configuracion).
// Versión inicial: perfil, seguridad, página de reservas y accesos. Los datos del
// negocio, horario general, notificaciones y suscripción llegan con la Fase 5.
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Bell, Check, Copy, CreditCard, ExternalLink, Globe, KeyRound, Lock, Store, Clock, User, Users,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useBusiness } from '../../hooks/useBusiness'
import { cn } from '../../lib/cn'
import { Button, Card, CardHeader, EmptyState, Input, useToast } from '../../components/ui'
import { PasswordForm, ProfileForm } from '../../components/account/AccountForms'

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
          {current.value === 'perfil' && <ProfileForm />}
          {current.value === 'seguridad' && <PasswordForm />}
          {current.value === 'reservas' && <BookingSection />}
          {current.value === 'usuarios' && <UsersSection />}
          {current.soon && <ComingSoon section={current} />}
        </div>
      </div>
    </div>
  )
}
