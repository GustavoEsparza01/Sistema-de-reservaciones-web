import { useEffect, useRef } from 'react'

/**
 * Comportamiento común de Modal y Drawer mientras están abiertos:
 * cerrar con Escape, bloquear el scroll de la página y mover el foco al
 * panel (y devolverlo al elemento anterior al cerrar).
 */
export function useDialog(open, onClose) {
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    const previous = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Si un campo con autoFocus ya tomó el foco dentro del panel, se respeta
    if (!panelRef.current?.contains(document.activeElement)) panelRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.()
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [open])

  return panelRef
}
