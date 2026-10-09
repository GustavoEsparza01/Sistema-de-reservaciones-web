import { useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import Button from './Button'
import { useDialog } from './useDialog'

/**
 * Modal centrado. Se cierra con Escape, clic fuera o el botón X.
 * footer: botones de acción (por ejemplo Cancelar + Confirmar).
 */
export default function Modal({ open, onClose, title, description, footer, size = 'md', children }) {
  const panelRef = useDialog(open, onClose)
  const titleId = useId()
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md">
      <div className="absolute inset-0 bg-inverse-surface/40" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative w-full bg-surface-container-lowest rounded-xl shadow-xl outline-none flex flex-col max-h-[90dvh]',
          size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-md'
        )}
      >
        <div className="flex items-start justify-between gap-space-md p-space-lg pb-space-md">
          <div>
            <h2 id={titleId} className="font-headline-section text-headline-section text-on-surface">{title}</h2>
            {description && <p className="text-body-sm text-on-surface-variant mt-1">{description}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" icon={X} onClick={onClose} aria-label="Cerrar" className="-mr-2 -mt-1" />
        </div>
        {children && <div className="px-space-lg pb-space-md overflow-y-auto">{children}</div>}
        {footer && (
          <div className="flex justify-end gap-space-sm px-space-lg py-space-md border-t border-outline-variant">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
