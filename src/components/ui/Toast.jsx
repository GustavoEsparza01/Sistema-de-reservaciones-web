import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { cn } from '../../lib/cn'

const ToastContext = createContext(null)

const TONES = {
  success: { icon: CircleCheck, box: 'bg-emerald-500/20 text-emerald-400' },
  error:   { icon: CircleAlert, box: 'bg-rose-500/20 text-rose-300' },
  info:    { icon: Info,        box: 'bg-blue-500/20 text-blue-300' },
  // Portal público: éxito en dorado, sin verde
  gold:    { icon: CircleCheck, box: 'bg-gold/20 text-gold-light' },
}

const DURATION = 4000

/**
 * Envuelve la app. Uso: const toast = useToast(); toast({ title, description, tone })
 * tone: success (por defecto) | error | info | gold (portal público)
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((options) => {
    const id = ++nextId.current
    setToasts((list) => [...list.slice(-2), { id, tone: 'success', ...options }])
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="fixed bottom-0 right-0 z-[60] flex flex-col items-end gap-space-sm p-space-md sm:p-space-lg pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pointer-events-none"
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const { icon: Icon, box } = TONES[toast.tone] ?? TONES.success

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration ?? DURATION)
    return () => clearTimeout(timer)
  }, [onDismiss, toast.id, toast.duration])

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className="toast-item pointer-events-auto flex items-center gap-space-md bg-inverse-surface text-inverse-on-surface px-space-md py-3 rounded-lg shadow-xl w-full max-w-sm"
    >
      <span className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0', box)}>
        <Icon size={16} strokeWidth={2} aria-hidden />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-body-medium text-body-sm text-white">{toast.title}</p>
        {toast.description && <p className="text-body-sm text-slate-300">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar aviso"
        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X size={16} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
