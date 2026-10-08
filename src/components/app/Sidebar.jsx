import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowUpRight, LogOut, Scissors, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useBusiness } from '../../hooks/useBusiness'
import { cn } from '../../lib/cn'
import Avatar from '../ui/Avatar'
import { FOOTER_NAV, LEGACY_LINKS, MAIN_NAV, visibleFor } from './navigation'

const itemBase =
  'flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-body-medium font-body-medium transition-colors'

function NavItem({ item }) {
  const Icon = item.icon

  if (!item.ready) {
    return (
      <span
        className={cn(itemBase, 'text-outline cursor-not-allowed')}
        aria-disabled="true"
        title="Disponible próximamente"
      >
        <Icon size={18} strokeWidth={1.75} aria-hidden />
        <span className="flex-1">{item.label}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-surface-container-low text-outline">
          Pronto
        </span>
      </span>
    )
  }

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          itemBase,
          isActive
            ? 'bg-primary-fixed text-on-primary-fixed-variant font-body-semibold'
            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
        )
      }
    >
      <Icon size={18} strokeWidth={1.75} aria-hidden />
      <span>{item.label}</span>
    </NavLink>
  )
}

const ROLE_LABEL = (auth) => (auth.isAdmin ? 'Dueño / Admin' : auth.isBarber ? 'Barbero' : 'Usuario')

/**
 * Barra lateral del panel. En pantallas grandes está fija; en móvil se abre
 * como panel con fondo oscuro (open / onClose).
 */
export default function Sidebar({ open, onClose }) {
  const auth = useAuth()
  const business = useBusiness()
  const navigate = useNavigate()
  const name = auth.profile?.full_name || 'Usuario'

  async function handleSignOut() {
    await auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-inverse-surface/40 lg:hidden" onClick={onClose} aria-hidden />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 bg-surface-container-lowest border-r border-outline-variant flex flex-col select-none',
          'transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        )}
        aria-label="Menú del panel"
      >
        {/* Negocio */}
        <div className="h-16 px-space-md border-b border-outline-variant flex items-center gap-space-sm shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
            <Scissors size={18} strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0 flex-1 flex flex-col">
            <span className="font-body-semibold text-body-semibold text-on-surface truncate">{business.name}</span>
            <span className="font-badge-label text-badge-label text-on-surface-variant truncate">{business.type}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
            aria-label="Cerrar menú"
          >
            <X size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 min-h-0 overflow-y-auto px-space-sm py-space-md flex flex-col gap-space-xs">
          {visibleFor(MAIN_NAV, auth).map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>

        {/* Pie: configuración, pantallas anteriores y usuario */}
        <div className="p-space-sm border-t border-outline-variant flex flex-col gap-space-xs shrink-0">
          {visibleFor(FOOTER_NAV, auth).map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
          {visibleFor(LEGACY_LINKS, auth).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={cn(itemBase, 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface')}
            >
              <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden />
              <span>{link.label}</span>
            </NavLink>
          ))}

          <div className="flex items-center justify-between gap-space-sm p-space-sm mt-space-xs rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-space-sm min-w-0">
              <Avatar name={name} size="sm" />
              <div className="min-w-0 flex flex-col">
                <span className="font-body-semibold text-body-sm text-on-surface truncate">{name}</span>
                <span className="font-badge-label text-badge-label text-on-surface-variant truncate">{ROLE_LABEL(auth)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={18} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
