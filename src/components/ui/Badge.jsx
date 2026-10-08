import { cn } from '../../lib/cn'
import { getStatus } from '../../lib/appointmentStatus'

const TONES = {
  neutral: { box: 'bg-surface-container-low text-on-surface-variant', dot: 'bg-outline' },
  primary: { box: 'bg-blue-50 text-blue-700',       dot: 'bg-blue-600' },
  success: { box: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-600' },
  warning: { box: 'bg-amber-50 text-amber-700',     dot: 'bg-amber-500' },
  danger:  { box: 'bg-slate-100 text-rose-600',     dot: 'bg-rose-500' },
}

/**
 * Insignia. tone: neutral | primary | success | warning | danger
 */
export default function Badge({ tone = 'neutral', dot = false, className, children }) {
  const t = TONES[tone] ?? TONES.neutral
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-badge-label text-badge-label whitespace-nowrap',
        t.box,
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', t.dot)} aria-hidden />}
      {children}
    </span>
  )
}

/** Insignia de estado de cita a partir del valor de la base de datos. */
export function StatusBadge({ status, className }) {
  const { label, tone } = getStatus(status)
  return <Badge tone={tone} dot className={className}>{label}</Badge>
}
