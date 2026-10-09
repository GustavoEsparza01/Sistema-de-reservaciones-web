// Nuevo landing de Barber OS, dirección "producto primero" (rama landing-moderna).
// Vive en /barber-os/nuevo para compararlo con el actual; se construye por secciones.
// Solo describe funciones que el sistema ya tiene; lo que se muestra del producto es
// interfaz real con datos de ejemplo marcados como tales.
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, LogIn } from 'lucide-react'
import Logo from '../components/app/Logo'
import BookingDemo from '../components/landing/BookingDemo'
import { Button } from '../components/ui'
import { useBusiness } from '../hooks/useBusiness'

export default function LandingNueva() {
  const business = useBusiness()
  const demoUrl = `/${business.slug}`
  const enter = (ms) => ({ '--enter-delay': `${ms}ms` })

  useEffect(() => {
    const previous = document.title
    document.title = 'Barber OS · Reservas en línea para tu barbería'
    return () => { document.title = previous }
  }, [])

  return (
    <div className="min-h-[100dvh] bg-ink font-sans text-white overflow-x-clip">
      <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur border-b border-ink-line pt-[env(safe-area-inset-top)]">
        <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin h-16 flex items-center gap-space-md">
          <Link to="/barber-os/nuevo" aria-label="Barber OS, inicio"><Logo tone="premium" /></Link>
          <div className="ml-auto flex items-center gap-space-xs sm:gap-space-sm">
            <Link to="/login" className="inline-flex items-center gap-space-xs h-11 px-space-sm text-body-medium text-ink-muted hover:text-white transition-colors">
              <LogIn size={18} strokeWidth={1.75} aria-hidden /> <span>Entrar</span>
            </Link>
            <Button as={Link} to={demoUrl} variant="outline-light" className="hidden md:inline-flex">Ver demo</Button>
            <Button as={Link} to="/onboarding" variant="gold" className="hidden sm:inline-flex">Crear mi barbería</Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero: el mensaje a la izquierda y el producto real (una reserva que se puede probar) a la derecha */}
        <section className="relative">
          {/* Un solo resplandor dorado, quieto, detrás del teléfono */}
          <div className="pointer-events-none absolute right-0 top-10 w-[560px] h-[560px] max-w-full rounded-full bg-gold/10 blur-[110px]" aria-hidden />
          <div className="relative max-w-[1200px] mx-auto px-margin-mobile md:px-margin pt-[48px] pb-[64px] md:pt-[72px] md:pb-[96px] grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[48px] lg:gap-[64px] items-center">
            <div className="flex flex-col gap-space-lg max-w-[34rem]">
              <h1 className="animate-enter font-display text-[42px] sm:text-[52px] lg:text-[64px] leading-[1.04] font-semibold text-balance" style={enter(0)}>
                Que tus clientes reserven solos.
              </h1>
              <p className="animate-enter text-[17px] md:text-[18px] leading-8 text-ink-muted max-w-[44ch]" style={enter(120)}>
                Eligen servicio, barbero y hora desde el celular. Tú ves la agenda de todo tu equipo en un solo lugar.
              </p>
              <div className="animate-enter flex flex-col sm:flex-row gap-space-sm" style={enter(220)}>
                <Button as={Link} to="/onboarding" variant="gold" size="xl" iconRight={ArrowRight} className="justify-center">Crear mi barbería</Button>
                <Button as={Link} to={demoUrl} variant="outline-light" size="xl" className="justify-center">Ver demo</Button>
              </div>
            </div>

            <BookingDemo className="animate-enter" style={enter(320)} />
          </div>
        </section>
      </main>
    </div>
  )
}
