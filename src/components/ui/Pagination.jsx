import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '../../lib/cn'
import Button from './Button'

const PAGE_SIZES = [10, 25, 50, 100]

/**
 * Paginación: "Mostrando 1–10 de 148", filas por página y navegación.
 * page empieza en 1.
 */
export default function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange, noun = 'resultados', className }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-space-md text-body-sm text-on-surface-variant', className)}>
      <span className="tabular-nums">
        Mostrando {from}–{to} de {total} {noun}
      </span>

      <div className="flex items-center gap-space-md">
        {onPageSizeChange && (
          <label className="hidden sm:flex items-center gap-space-xs">
            Filas por página
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-outline-variant bg-surface-container-lowest px-2 text-body-sm text-on-surface focus:outline-none focus:border-primary"
            >
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        )}

        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" icon={ChevronsLeft} aria-label="Primera página" disabled={page <= 1} onClick={() => onPageChange(1)} />
          <Button variant="ghost" size="icon-sm" icon={ChevronLeft} aria-label="Página anterior" disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
          <span className="px-2 tabular-nums text-on-surface">
            {page} / {pages}
          </span>
          <Button variant="ghost" size="icon-sm" icon={ChevronRight} aria-label="Página siguiente" disabled={page >= pages} onClick={() => onPageChange(page + 1)} />
          <Button variant="ghost" size="icon-sm" icon={ChevronsRight} aria-label="Última página" disabled={page >= pages} onClick={() => onPageChange(pages)} />
        </div>
      </div>
    </div>
  )
}
