import { createContext, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { ChevronRight, Menu } from 'lucide-react'
import Logo from './Logo'
import { findNavItem } from './navigation'

// Contenedor donde cada página coloca sus botones de la barra superior
const TopbarSlotContext = createContext(null)

export function TopbarSlotProvider({ children }) {
  const [slot, setSlot] = useState(null)
  return <TopbarSlotContext.Provider value={{ slot, setSlot }}>{children}</TopbarSlotContext.Provider>
}

/**
 * Botones de la página en la barra superior (por ejemplo "+ Nueva cita").
 * Uso dentro de una página: <TopbarActions><Button>…</Button></TopbarActions>
 */
export function TopbarActions({ children }) {
  const ctx = useContext(TopbarSlotContext)
  if (!ctx?.slot) return null
  return createPortal(children, ctx.slot)
}

/** Barra superior del panel: logo, breadcrumb y acciones de la página. */
export default function Topbar({ onOpenMenu, title }) {
  const { pathname } = useLocation()
  const { setSlot } = useContext(TopbarSlotContext)
  const current = title ?? findNavItem(pathname)?.label

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between gap-space-md px-margin-mobile md:px-margin">
      <div className="flex items-center gap-space-md min-w-0">
        <button
          type="button"
          onClick={onOpenMenu}
          className="lg:hidden -ml-1.5 p-1.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
          aria-label="Abrir menú"
        >
          <Menu size={20} strokeWidth={1.75} aria-hidden />
        </button>
        <Logo />
        {current && (
          <nav
            aria-label="Ruta"
            className="hidden md:flex items-center gap-space-xs text-body-sm text-on-surface-variant pl-space-md border-l border-outline-variant min-w-0"
          >
            <span>Panel</span>
            <ChevronRight size={14} strokeWidth={1.75} aria-hidden />
            <span className="text-on-surface font-body-medium truncate">{current}</span>
          </nav>
        )}
      </div>

      <div ref={setSlot} className="flex items-center gap-space-sm shrink-0" />
    </header>
  )
}
