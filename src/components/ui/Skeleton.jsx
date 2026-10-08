import { cn } from '../../lib/cn'

/** Bloque gris animado para estados de carga. Se le da tamaño con className. */
export default function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded bg-surface-container-high', className)} aria-hidden />
}
