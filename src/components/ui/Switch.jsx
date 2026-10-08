import { useId } from 'react'
import { cn } from '../../lib/cn'

/** Interruptor de encendido/apagado con etiqueta y descripción opcional. */
export default function Switch({ checked, onChange, label, description, disabled, className }) {
  const id = useId()
  return (
    <div className={cn('flex items-start justify-between gap-space-md', className)}>
      {(label || description) && (
        <label htmlFor={id} className="min-w-0 cursor-pointer">
          {label && <span className="block font-body-medium text-body-sm text-on-surface">{label}</span>}
          {description && <span className="block text-body-sm text-on-surface-variant">{description}</span>}
        </label>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors mt-0.5',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          checked ? 'bg-primary' : 'bg-surface-container-highest'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
            checked && 'translate-x-4'
          )}
        />
      </button>
    </div>
  )
}
