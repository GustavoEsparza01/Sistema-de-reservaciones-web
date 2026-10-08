import { useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import Button from './Button'
import { useDialog } from './useDialog'

/**
 * Panel lateral derecho para ver detalles sin salir de la página.
 * Se cierra con Escape, clic fuera o el botón X.
 */
export default function Drawer({ open, onClose, title, subtitle, footer, children }) {
  const panelRef = useDialog(open, onClose)
  const titleId = useId()
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-inverse-surface/30" onClick={onClose} aria-hidden />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full sm:w-[400px] h-full bg-surface-container-lowest shadow-xl outline-none flex flex-col"
      >
        <header className="flex items-start justify-between gap-space-md px-space-lg h-16 py-3 border-b border-outline-variant shrink-0">
          <div className="min-w-0 self-center">
            <h2 id={titleId} className="font-headline-section text-headline-section text-on-surface truncate">{title}</h2>
            {subtitle && <p className="text-body-sm text-on-surface-variant truncate">{subtitle}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" icon={X} onClick={onClose} aria-label="Cerrar" className="self-center -mr-2" />
        </header>
        <div className="flex-1 overflow-y-auto p-space-lg">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-space-sm px-space-lg py-space-md border-t border-outline-variant shrink-0">
            {footer}
          </footer>
        )}
      </aside>
    </div>,
    document.body
  )
}
