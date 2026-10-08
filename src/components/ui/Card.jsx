import { cn } from '../../lib/cn'

/** Superficie blanca con borde. padding=false para tablas que llegan al borde. */
export default function Card({ as: Comp = 'section', padding = true, className, children, ...props }) {
  return (
    <Comp
      className={cn(
        'bg-surface-container-lowest border border-outline-variant rounded-lg',
        padding && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}

/** Encabezado de tarjeta: título, descripción y acción a la derecha. */
export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-space-sm', className)}>
      <div className="min-w-0">
        <h2 className="font-headline-section text-headline-section text-on-surface">{title}</h2>
        {description && <p className="text-body-sm text-on-surface-variant mt-0.5">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-space-xs shrink-0">{action}</div>}
    </div>
  )
}
