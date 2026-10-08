import { cn } from '../../lib/cn'
import Checkbox from './Checkbox'
import Skeleton from './Skeleton'

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' }

/**
 * Tabla de datos.
 * columns: [{ key, header, align, width, className, render(row) }]
 * rows: arreglo de objetos; rowKey: nombre de la propiedad única (por defecto 'id')
 * empty: nodo a mostrar si no hay filas (por ejemplo un <EmptyState />)
 * selection (opcional): { selected: Set de claves, onToggle(key), onToggleAll(checked) }
 *   agrega una columna de casillas al inicio.
 */
export default function Table({
  columns,
  rows = [],
  rowKey = 'id',
  onRowClick,
  loading = false,
  skeletonRows = 5,
  empty,
  selection,
  className,
}) {
  const selectedOnPage = selection ? rows.filter((r) => selection.selected.has(r[rowKey])).length : 0
  const allSelected = rows.length > 0 && selectedOnPage === rows.length
  const colCount = columns.length + (selection ? 1 : 0)

  return (
    // relative: los textos ocultos (sr-only) se posicionan dentro de la tabla y no ensanchan la página
    <div className={cn('relative overflow-x-auto', className)}>
      <table className="w-full border-collapse text-body-default">
        <thead>
          <tr className="h-10 bg-surface-container-low text-on-surface-variant font-table-header text-table-header uppercase select-none">
            {selection && (
              <th scope="col" className="w-12 pl-space-md">
                <Checkbox
                  checked={allSelected}
                  indeterminate={selectedOnPage > 0}
                  onChange={(e) => selection.onToggleAll(e.target.checked)}
                  aria-label="Seleccionar todas las filas de esta página"
                  disabled={loading || rows.length === 0}
                />
              </th>
            )}
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                style={c.width ? { width: c.width } : undefined}
                className={cn('px-space-md font-semibold whitespace-nowrap', ALIGN[c.align ?? 'left'])}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={`sk-${i}`} className="h-[52px] border-b border-outline-variant last:border-0">
                {Array.from({ length: colCount }).map((__, j) => (
                  <td key={j} className="px-space-md">
                    <Skeleton className="h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            rows.map((row) => {
              const key = row[rowKey]
              const isSelected = selection?.selected.has(key)
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  aria-selected={selection ? isSelected : undefined}
                  className={cn(
                    'h-[52px] border-b border-outline-variant last:border-0 transition-colors',
                    isSelected ? 'bg-primary-fixed/40' : 'bg-surface-container-lowest',
                    onRowClick && 'cursor-pointer hover:bg-surface-container-low'
                  )}
                >
                  {selection && (
                    <td className="w-12 pl-space-md" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => selection.onToggle(key)}
                        aria-label="Seleccionar fila"
                      />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={cn('px-space-md text-on-surface', ALIGN[c.align ?? 'left'], c.className)}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              )
            })}

          {!loading && rows.length === 0 && empty && (
            <tr>
              <td colSpan={colCount}>{empty}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
