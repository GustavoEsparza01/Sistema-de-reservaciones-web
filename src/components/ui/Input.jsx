import { forwardRef, useId } from 'react'
import { cn } from '../../lib/cn'
import Field, { controlClasses } from './Field'

/**
 * Campo de texto con etiqueta, ayuda, error e icono opcional (lucide-react).
 * tone="premium": colores del portal público.
 */
const Input = forwardRef(function Input(
  { id, label, hint, error, required, icon: Icon, suffix, tone, className, inputClassName, ...props },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            strokeWidth={1.75}
            aria-hidden
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${inputId}-msg` : undefined}
          className={cn(controlClasses(error, tone), Icon ? 'pl-9' : 'pl-3', suffix ? 'pr-14' : 'pr-3', inputClassName)}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-body-sm text-on-surface-variant pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  )
})

export default Input
