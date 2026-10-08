import { cn } from '../../lib/cn'

/**
 * Pestañas subrayadas.
 * items: [{ value, label, count }]
 */
export default function Tabs({ items, value, onChange, className }) {
  return (
    <div role="tablist" className={cn('flex gap-space-md border-b border-outline-variant overflow-x-auto overflow-y-hidden', className)}>
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
              'focus-visible:outline-none focus-visible:text-on-surface',
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            )}
          >
            {item.label}
            {item.count != null && (
              <span
                className={cn(
                  'min-w-5 px-1.5 rounded-full text-[11px] leading-5 text-center tabular-nums',
                  active ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container text-on-surface-variant'
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
