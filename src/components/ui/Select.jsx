import { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import Field, { controlClasses } from './Field'

/**
 * Select nativo con el estilo del sistema.
 * options: [{ value, label }] (o pasar <option> como children)
 */
const Select = forwardRef(function Select(
  { id, label, hint, error, required, options, placeholder, className, children, ...props },
  ref
) {
  const autoId = useId()
  const selectId = id ?? autoId

  return (
    <Field id={selectId} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${selectId}-msg` : undefined}
          className={cn(controlClasses(error), 'appearance-none pl-3 pr-9 cursor-pointer')}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options
            ? options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))
            : children}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
        />
      </div>
    </Field>
  )
})

export default Select
