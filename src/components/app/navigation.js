import {
  CalendarDays, Calendar, ChartColumn, ClipboardList, IdCard, LayoutDashboard, Scissors, Settings, Users,
} from 'lucide-react'

/**
 * Menú del panel.
 * - roles: quién ve la opción ('admin' | 'barber')
 * - ready: false mientras la pantalla no exista; se muestra deshabilitada con "Pronto"
 * Al terminar cada pantalla solo hay que cambiar ready a true.
 */
export const MAIN_NAV = [
  { to: '/app/resumen',   label: 'Resumen',   icon: LayoutDashboard, roles: ['admin'],  ready: true  },
  { to: '/app/agenda',    label: 'Agenda',    icon: Calendar,        roles: ['admin'],  ready: false },
  { to: '/app/citas',     label: 'Citas',     icon: ClipboardList,   roles: ['admin'],  ready: true  },
  { to: '/app/clientes',  label: 'Clientes',  icon: Users,           roles: ['admin'],  ready: false },
  { to: '/app/equipo',    label: 'Equipo',    icon: IdCard,          roles: ['admin'],  ready: false },
  { to: '/app/servicios', label: 'Servicios', icon: Scissors,        roles: ['admin'],  ready: true  },
  { to: '/app/reportes',  label: 'Reportes',  icon: ChartColumn,     roles: ['admin'],  ready: false },
  { to: '/app/mi-agenda', label: 'Mi agenda', icon: CalendarDays,    roles: ['barber'], ready: false },
]

export const FOOTER_NAV = [
  { to: '/app/configuracion', label: 'Configuración', icon: Settings, roles: ['admin'], ready: false },
]

// Mientras dura la migración: acceso a las pantallas anteriores
export const LEGACY_LINKS = [
  { to: '/anterior/admin', label: 'Panel anterior',  roles: ['admin'] },
  { to: '/barber-agenda', label: 'Agenda anterior', roles: ['barber'] },
]

/** Filtra una lista por los roles del usuario (el admin que es barbero ve ambas). */
export function visibleFor(items, { isAdmin, isBarber }) {
  return items.filter((i) => i.roles.some((r) => (r === 'admin' && isAdmin) || (r === 'barber' && isBarber)))
}

/** Busca la opción del menú que corresponde a la ruta actual (para el breadcrumb). */
export function findNavItem(pathname) {
  return [...MAIN_NAV, ...FOOTER_NAV].find((i) => pathname === i.to || pathname.startsWith(`${i.to}/`))
}
