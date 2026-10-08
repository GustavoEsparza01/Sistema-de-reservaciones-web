import { cn } from '../../lib/cn'

/** Logo de Barber OS: "barber" + insignia azul "OS". compact = solo la insignia. */
export default function Logo({ compact = false, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1 select-none', className)} aria-label="Barber OS">
      {!compact && <span className="font-semibold text-[17px] leading-none tracking-tight text-on-surface">barber</span>}
      <span className="inline-flex items-center justify-center rounded-md bg-primary text-on-primary text-[11px] font-bold leading-none px-1.5 py-1">
        OS
      </span>
    </span>
  )
}
