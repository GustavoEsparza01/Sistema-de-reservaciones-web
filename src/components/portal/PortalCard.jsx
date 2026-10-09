import { cn } from '../../lib/cn'

/**
 * Superficie del portal público: blanca sobre el fondo crema, borde carbón tenue
 * y el mismo radio en todo el portal. Es la versión premium de <Card> del panel.
 * tone="ink": superficie carbón (resumen de la reserva, avisos destacados).
 */
export default function PortalCard({ as: Comp = 'section', tone = 'light', padding = true, className, children, ...props }) {
  return (
    <Comp
      className={cn(
        'rounded-xl min-w-0',
        tone === 'ink' ? 'bg-ink text-white' : 'bg-white border border-ink/10 text-ink',
        padding && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}
