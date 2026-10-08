import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/app/Sidebar'
import Topbar, { TopbarSlotProvider } from '../components/app/Topbar'

/**
 * Estructura del panel (/app/*): barra lateral de 240 px, barra superior de
 * 64 px y contenido con ancho máximo de 1280 px.
 */
export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // En móvil, cerrar el menú al cambiar de página
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <TopbarSlotProvider>
      <div className="min-h-screen bg-background font-sans text-on-surface">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="lg:pl-60 flex flex-col min-h-screen">
          <Topbar onOpenMenu={() => setMenuOpen(true)} />
          <main className="flex-1">
            <div className="w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin py-space-lg md:py-space-xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TopbarSlotProvider>
  )
}
