import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CalendarPlus, ChevronDown, LogIn, LogOut, MapPin, Menu, Scissors, User, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../hooks/useBusiness'
import { cn } from '../lib/cn'
import { Avatar, Button } from '../components/ui'
import Logo from '../components/app/Logo'

/** Menú de la cuenta del cliente (o botón para iniciar sesión). */
function AccountMenu() {
  const { session, profile, signOut } = useAuth()
  const business = useBusiness()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  if (!session) {
    const volver = encodeURIComponent(location.pathname + location.search)
    return (
      <Button as={Link} to={`/login?volver=${volver}`} variant="ghost" icon={LogIn}>
        Iniciar sesión
      </Button>
    )
  }

  const name = profile?.full_name || 'Mi cuenta'
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-space-xs rounded-full pl-0.5 pr-2 py-0.5 hover:bg-surface-container-low"
      >
        <Avatar name={name} size="sm" />
        <span className="hidden sm:inline text-body-sm font-body-medium max-w-[140px] truncate">{name.split(' ')[0]}</span>
        <ChevronDown size={16} strokeWidth={1.75} aria-hidden />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-48 rounded-lg border border-outline-variant bg-surface-container-lowest shadow-xl py-1 z-50">
          <Link role="menuitem" to={`/${business.slug}/mis-citas`} onClick={() => setOpen(false)} className="flex items-center gap-space-sm px-3 py-2 text-body-sm hover:bg-surface-container-low">
            <CalendarPlus size={16} strokeWidth={1.75} aria-hidden /> Mis citas
          </Link>
          <Link role="menuitem" to={`/${business.slug}/perfil`} onClick={() => setOpen(false)} className="flex items-center gap-space-sm px-3 py-2 text-body-sm hover:bg-surface-container-low">
            <User size={16} strokeWidth={1.75} aria-hidden /> Mi perfil
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={async () => {
              setOpen(false)
              await signOut()
              navigate('.', { replace: true })
            }}
            className="w-full flex items-center gap-space-sm px-3 py-2 text-body-sm text-left hover:bg-surface-container-low"
          >
            <LogOut size={16} strokeWidth={1.75} aria-hidden /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Estructura del portal del negocio (/:slug/*): encabezado con el negocio,
 * navegación, acceso a la cuenta y pie con horario.
 */
export default function PortalLayout() {
  const { slug } = useParams()
  const business = useBusiness()
  const { session } = useAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [pathname])

  // Hasta la Fase 5 solo existe un negocio
  if (slug !== business.slug) return <Navigate to={`/${business.slug}`} replace />

  const base = `/${business.slug}`
  const links = [
    { to: `${base}#servicios`, label: 'Servicios' },
    { to: `${base}#equipo`, label: 'Barberos' },
    { to: `${base}#horarios`, label: 'Horarios' },
    ...(session ? [{ to: `${base}/mis-citas`, label: 'Mis citas' }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-on-surface">
      <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur border-b border-outline-variant">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin h-16 flex items-center gap-space-md">
          <Link to={base} className="flex items-center gap-space-sm min-w-0">
            <span className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0">
              <Scissors size={18} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-body-semibold leading-tight truncate">{business.name}</span>
              <span className="hidden sm:flex items-center gap-1 text-[12px] text-on-surface-variant">
                <MapPin size={12} strokeWidth={1.75} aria-hidden /> {business.city}
              </span>
            </span>
          </Link>

          <nav aria-label="Secciones" className="hidden md:flex items-center gap-space-md ml-space-lg">
            {links.map((l) => (
              <NavLink key={l.label} to={l.to} className="text-body-sm font-body-medium text-on-surface-variant hover:text-on-surface">
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-space-sm">
            {!pathname.endsWith('/reservar') && (
              <Button as={Link} to={`${base}/reservar`} icon={CalendarPlus} className="hidden sm:inline-flex">
                Agendar cita
              </Button>
            )}
            <AccountMenu />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              className="md:hidden p-1.5 rounded text-on-surface-variant hover:bg-surface-container-low"
            >
              {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav aria-label="Secciones" className="md:hidden border-t border-outline-variant px-margin-mobile py-space-sm flex flex-col">
            {links.map((l) => (
              <Link key={l.label} to={l.to} className="py-2 text-body-default text-on-surface">{l.label}</Link>
            ))}
            <Button as={Link} to={`${base}/reservar`} icon={CalendarPlus} className="mt-space-sm justify-center">Agendar cita</Button>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-outline-variant bg-surface-container-lowest">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-space-xl grid gap-space-lg sm:grid-cols-3 text-body-sm">
          <div className="flex flex-col gap-1">
            <p className="font-body-semibold text-on-surface">{business.name}</p>
            <p className="text-on-surface-variant">{business.city}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-body-semibold text-on-surface">Horario</p>
            {business.hours.map((h) => (
              <p key={h.label} className="text-on-surface-variant tabular-nums">{h.label}: {h.open} – {h.close}</p>
            ))}
          </div>
          <div className={cn('flex flex-col gap-1 sm:items-end')}>
            <p className="text-on-surface-variant">Reservas con</p>
            <Logo />
          </div>
        </div>
      </footer>
    </div>
  )
}
