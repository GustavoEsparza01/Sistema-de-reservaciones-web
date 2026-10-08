import { cn } from '../../lib/cn'

const COLORS = [
  'bg-primary-fixed text-on-primary-fixed',
  'bg-secondary-fixed text-on-secondary-fixed',
  'bg-tertiary-fixed text-on-tertiary-fixed',
  'bg-emerald-100 text-emerald-900',
]

const SIZES = {
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-body-sm',
  lg: 'w-12 h-12 text-[18px]',
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

// El mismo nombre siempre obtiene el mismo color
function colorFor(name = '') {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return COLORS[h % COLORS.length]
}

/** Avatar con iniciales (o imagen si se pasa src). */
export default function Avatar({ name, src, size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full shrink-0 font-semibold overflow-hidden',
        SIZES[size],
        !src && colorFor(name),
        className
      )}
      title={name}
    >
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials(name)}
    </span>
  )
}
