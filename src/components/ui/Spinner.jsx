import { LoaderCircle } from 'lucide-react'
import { cn } from '../../lib/cn'

export default function Spinner({ size = 18, className, label = 'Cargando' }) {
  return (
    <LoaderCircle
      size={size}
      strokeWidth={2}
      className={cn('animate-spin', className)}
      role="status"
      aria-label={label}
    />
  )
}
