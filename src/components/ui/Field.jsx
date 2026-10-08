import { cn } from '../../lib/cn'

/**
 * Envoltura común de Input y Select: etiqueta arriba, ayuda o error abajo.
 */
export default function Field({ id, label, hint, error, required, className, children }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="font-body-semibold text-body-sm text-on-surface">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-msg`} className="text-body-sm text-error">{error}</p>
      ) : hint ? (
        <p id={`${id}-msg`} className="text-body-sm text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  )
}

export const controlClasses = (error) =>
  cn(
    'w-full h-9 rounded-lg bg-surface-container-lowest border text-body-default text-on-surface',
    'placeholder:text-outline transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary/20',
    'disabled:bg-surface-container-low disabled:text-outline disabled:cursor-not-allowed',
    error ? 'border-error focus:border-error' : 'border-outline-variant focus:border-primary'
  )
