import { cn } from '../../lib/cn'

const TONES = {
  default: {
    list: 'border-outline-variant',
    focus: 'focus-visible:ring-primary',
    active: 'border-primary text-primary',
    idle: 'border-transparent text-on-surface-variant hover:text-on-surface',
    countActive: 'bg-primary-fixed text-on-primary-fixed-variant',
    countIdle: 'bg-surface-container text-on-surface-variant',
  },
  // Portal público: subrayado carbón (el dorado sobre crema no llega a 3:1)
  premium: {
    list: 'border-ink/10',
    focus: 'focus-visible:ring-ink',
    active: 'border-ink text-ink',
    idle: 'border-transparent text-ink/70 hover:text-ink',
    countActive: 'bg-ink text-gold-light',
    countIdle: 'bg-ink/5 text-ink/70',
  },
}

/**
 * Pestañas subrayadas.
 * items: [{ value, label, count }]
 * tone: default | premium (portal público)
 */
export default function Tabs({ items, value, onChange, tone = 'default', className }) {
  const t = TONES[tone] ?? TONES.default
  return (
    <div role="tablist" className={cn('flex gap-space-md border-b overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', t.list, className)}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex items-center gap-space-xs py-3 px-0.5 -mb-px border-b-2 text-body-medium font-body-medium whitespace-nowrap transition-colors',
              'rounded-t-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
              t.focus,
              active ? t.active : t.idle
            )}
          >
            {item.label}
            {item.count != null && (
              <span className={cn('min-w-5 px-1.5 rounded-full text-[11px] leading-5 text-center tabular-nums', active ? t.countActive : t.countIdle)}>
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
