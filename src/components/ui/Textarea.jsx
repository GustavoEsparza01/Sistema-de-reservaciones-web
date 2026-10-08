import { forwardRef, useId } from 'react'
import { cn } from '../../lib/cn'
import Field, { controlClasses } from './Field'

/** Texto largo con etiqueta, ayuda, error y contador opcional (maxLength). */
const Textarea = forwardRef(function Textarea(
  { id, label, hint, error, required, maxLength, value, rows = 3, className, ...props },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const length = typeof value === 'string' ? value.length : 0

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          value={value}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${inputId}-msg` : undefined}
          className={cn(controlClasses(error), 'h-auto px-3 py-2 resize-y', maxLength && 'pb-6')}
          {...props}
        />
        {maxLength && (
          <span
            className={cn(
              'absolute right-3 bottom-1.5 text-[11px] tabular-nums pointer-events-none',
              length > maxLength ? 'text-error' : 'text-outline'
            )}
          >
            {length}/{maxLength}
          </span>
        )}
      </div>
    </Field>
  )
})

export default Textarea
