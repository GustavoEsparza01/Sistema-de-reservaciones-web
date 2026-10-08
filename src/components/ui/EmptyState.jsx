import { cn } from '../../lib/cn'

/** Estado vacío: icono, título, descripción y acción opcional. */
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center text-center gap-space-sm py-12 px-space-md', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
          <Icon size={24} strokeWidth={1.75} aria-hidden />
        </div>
      )}
      <h3 className="font-body-semibold text-body-semibold text-on-surface">{title}</h3>
      {description && <p className="text-body-sm text-on-surface-variant max-w-sm">{description}</p>}
      {action && <div className="mt-space-xs">{action}</div>}
    </div>
  )
}
