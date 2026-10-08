import { useEffect, useRef } from 'react'
import { cn } from '../../lib/cn'

/** Casilla de verificación. indeterminate = selección parcial. */
export default function Checkbox({ checked, indeterminate = false, onChange, className, ...props }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked
  }, [indeterminate, checked])

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={!!checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'w-4 h-4 rounded border-outline text-primary accent-primary cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        className
      )}
      {...props}
    />
  )
}
