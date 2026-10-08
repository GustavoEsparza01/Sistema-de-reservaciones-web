import { cn } from '../../lib/cn'
import Skeleton from './Skeleton'

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' }

/**
 * Tabla de datos.
 * columns: [{ key, header, align, width, className, render(row) }]
 * rows: arreglo de objetos; rowKey: nombre de la propiedad única (por defecto 'id')
 * empty: nodo a mostrar si no hay filas (por ejemplo un <EmptyState />)
 */
export default function Table({
  columns,
  rows = [],
  rowKey = 'id',
  onRowClick,
  loading = false,
  skeletonRows = 5,
  empty,
  className,
}) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-body-default">
        <thead>
          <tr className="h-10 bg-surface-container-low text-on-surface-variant font-table-header text-table-header uppercase select-none">
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
                {columns.map((c) => (
                  <td key={c.key} className="px-space-md">
                    <Skeleton className="h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            rows.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'h-[52px] bg-surface-container-lowest border-b border-outline-variant last:border-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-surface-container-low'
                )}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-space-md text-on-surface', ALIGN[c.align ?? 'left'], c.className)}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}

          {!loading && rows.length === 0 && empty && (
            <tr>
              <td colSpan={columns.length}>{empty}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
