import { cn } from '../../lib/cn'

/**
 * Logo de Barber OS: "barber" + insignia "OS". compact = solo la insignia.
 * tone="premium": texto blanco e insignia dorada, para fondos oscuros.
 */
export default function Logo({ compact = false, tone = 'default', className }) {
  const premium = tone === 'premium'
  return (
    <span className={cn('inline-flex items-center gap-1 select-none', className)} aria-label="Barber OS">
      {!compact && (
        <span className={cn('font-semibold text-[17px] leading-none tracking-tight', premium ? 'text-white' : 'text-on-surface')}>barber</span>
      )}
      <span className={cn('inline-flex items-center justify-center rounded-md text-[11px] font-bold leading-none px-1.5 py-1', premium ? 'bg-gold text-ink' : 'bg-primary text-on-primary')}>
        OS
      </span>
    </span>
  )
}
