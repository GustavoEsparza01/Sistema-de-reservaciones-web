import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CalendarPlus, ChevronDown, LogIn, LogOut, MapPin, Menu, Scissors, User, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBusiness } from '../hooks/useBusiness'
import { cn } from '../lib/cn'
import { Avatar, Button } from '../components/ui'
import Logo from '../components/app/Logo'
import { ScrollProgress, useScrollState } from '../components/motion'

/** Menú de la cuenta del cliente (o botón para iniciar sesión). */
function AccountMenu() {
  const { session, profile, signOut } = useAuth()
  const business = useBusiness()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const trigger = useRef(null)

  // Abierto: el foco entra a la primera opción; se cierra al tocar fuera (mouse o dedo)
  useEffect(() => {
    if (!open) return
    ref.current?.querySelector('[role="menuitem"]')?.focus()
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  // Teclado dentro del menú: flechas, Inicio y Fin recorren las opciones; Escape cierra y regresa al botón
  function onMenuKeyDown(e) {
    const items = [...e.currentTarget.querySelectorAll('[role="menuitem"]')]
    const i = items.indexOf(document.activeElement)
    const go = { ArrowDown: (i + 1) % items.length, ArrowUp: (i - 1 + items.length) % items.length, Home: 0, End: items.length - 1 }[e.key]
    if (go != null) { e.preventDefault(); items[go].focus() }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); trigger.current?.focus() }
    if (e.key === 'Tab') setOpen(false)
  }

  if (!session) {
    const volver = encodeURIComponent(location.pathname + location.search)
    return (
      <Link to={`/login?volver=${volver}`} className="inline-flex items-center gap-space-xs h-11 px-space-sm text-body-medium text-ink-muted hover:text-white transition-colors">
        <LogIn size={18} strokeWidth={1.75} aria-hidden /> Iniciar sesión
      </Link>
    )
  }

  const name = profile?.full_name || 'Mi cuenta'
  return (
    <div className="relative" ref={ref}>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Mi cuenta: ${name}`}
        className="flex items-center gap-space-xs h-11 rounded-full pl-1 pr-2 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <span aria-hidden className="contents">
          <Avatar name={name} size="sm" />
          <span className="hidden sm:inline text-body-sm font-body-medium max-w-[140px] truncate">{name.split(' ')[0]}</span>
        </span>
        <ChevronDown size={16} strokeWidth={1.75} aria-hidden />
      </button>
      {open && (
        <div role="menu" aria-label="Mi cuenta" onKeyDown={onMenuKeyDown} className="absolute right-0 mt-2 w-48 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface shadow-xl py-1 z-50">
          <Link role="menuitem" to={`/${business.slug}/mis-citas`} onClick={() => setOpen(false)} className="flex items-center gap-space-sm px-3 py-3 text-body-sm hover:bg-surface-container-low focus:bg-surface-container-low focus:outline-none">
            <CalendarPlus size={16} strokeWidth={1.75} aria-hidden /> Mis citas
          </Link>
          <Link role="menuitem" to={`/${business.slug}/perfil`} onClick={() => setOpen(false)} className="flex items-center gap-space-sm px-3 py-3 text-body-sm hover:bg-surface-container-low focus:bg-surface-container-low focus:outline-none">
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
            className="w-full flex items-center gap-space-sm px-3 py-3 text-body-sm text-left hover:bg-surface-container-low focus:bg-surface-container-low focus:outline-none"
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
  const { scrolled } = useScrollState()

  useEffect(() => setMenuOpen(false), [pathname])

  // Barra del navegador del celular en carbón, igual que el encabezado del portal
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return
    const previous = meta.content
    meta.content = '#0F0F10'
    return () => { meta.content = previous }
  }, [])

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
    <div className="min-h-[100dvh] flex flex-col bg-cream font-sans text-on-surface">
      <ScrollProgress />
      <header className={cn('sticky top-0 z-40 pt-[env(safe-area-inset-top)] backdrop-blur border-b text-white transition-all duration-300', scrolled ? 'bg-ink/95 border-ink-line shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]' : 'bg-ink border-ink-line')}>
        <div className={`max-w-[1200px] mx-auto px-margin-mobile md:px-margin flex items-center gap-space-md transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>
          <Link to={base} className="flex items-center gap-space-sm min-w-0">
            <span className="w-9 h-9 rounded-full border border-gold/50 bg-gold/10 text-gold flex items-center justify-center shrink-0">
              <Scissors size={18} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-[18px] font-semibold leading-tight truncate">{business.name}</span>
              <span className="hidden sm:flex items-center gap-1 text-[12px] text-ink-muted">
                <MapPin size={12} strokeWidth={1.75} aria-hidden /> {business.city}
              </span>
            </span>
          </Link>

          <nav aria-label="Secciones" className="hidden md:flex items-center gap-space-md ml-space-lg">
            {links.map((l) => (
              <NavLink key={l.label} to={l.to} className="text-body-sm font-body-medium text-ink-muted hover:text-gold transition-colors">
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-space-sm">
            {!pathname.endsWith('/reservar') && (
              <Button as={Link} to={`${base}/reservar`} variant="gold" icon={CalendarPlus} className="hidden sm:inline-flex">
                Agendar cita
              </Button>
            )}
            <AccountMenu />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              className="md:hidden -mr-2 w-11 h-11 flex items-center justify-center rounded text-white hover:bg-white/10"
            >
              {menuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav aria-label="Secciones" className="md:hidden border-t border-ink-line px-margin-mobile py-space-sm flex flex-col">
            {links.map((l) => (
              <Link key={l.label} to={l.to} className="py-3 text-body-default text-white">{l.label}</Link>
            ))}
            <Button as={Link} to={`${base}/reservar`} variant="gold" icon={CalendarPlus} className="mt-space-sm justify-center">Agendar cita</Button>
          </nav>
        )}
      </header>

      {/* overflow-x-clip: lo que entra animado desde un costado no genera scroll horizontal en celular */}
      <main className="flex-1 overflow-x-clip">
        <Outlet />
      </main>

      <footer className="bg-ink text-ink-muted pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin py-[48px] grid gap-space-lg sm:grid-cols-3 text-body-sm">
          <div className="flex flex-col gap-1">
            <p className="font-display text-[20px] font-semibold text-white">{business.name}</p>
            <p>{business.city}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-gold mb-1">Horario</p>
            {business.hours.map((h) => (
              <p key={h.label} className="tabular-nums">{h.label}: {h.open} – {h.close}</p>
            ))}
          </div>
          <div className={cn('flex flex-col gap-1 sm:items-end')}>
            <p>Reservas con</p>
            <Logo tone="premium" />
          </div>
        </div>
      </footer>
    </div>
  )
}
