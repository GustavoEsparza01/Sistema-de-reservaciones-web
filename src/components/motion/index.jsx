// Piezas de movimiento del estilo premium (landing y portal público).
// Los estilos viven en src/index.css; con "reducir movimiento" activado todo queda estático.
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'

/** Avisa una sola vez cuando el elemento entra en pantalla. */
export function useInView({ threshold = 0.15, rootMargin = '0px 0px -60px 0px' } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    if (!('IntersectionObserver' in window)) return setInView(true)
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        io.disconnect()
      }
    }, { threshold, rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin, inView])
  return [ref, inView]
}

/**
 * Aparece al hacer scroll.
 * - from: up | left | right | scale
 * - delay: milisegundos, para escalonar elementos de una misma fila
 */
export function Reveal({ as: Comp = 'div', from = 'up', delay = 0, className, style, children, ...props }) {
  const [ref, inView] = useInView()
  return (
    <Comp
      ref={ref}
      data-from={from}
      className={cn('reveal', inView && 'is-visible', className)}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...props}
    >
      {children}
    </Comp>
  )
}

/** onMouseMove para las tarjetas .spotlight: mueve la luz dorada con el cursor. */
export function trackPointer(e) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/** Inclina su contenido en 3D siguiendo el cursor. */
export function Tilt({ max = 8, className, children }) {
  const ref = useRef(null)
  const move = (e) => {
    const el = ref.current
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(1000px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`
  }
  const leave = () => { ref.current.style.transform = '' }
  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      className={cn('transition-transform duration-300 ease-out will-change-transform', className)}
    >
      {children}
    </div>
  )
}

/** Cuenta de 0 al valor cuando entra en pantalla. */
export function CountUp({ to, duration = 1400, prefix = '', suffix = '', className }) {
  const [ref, inView] = useInView({ threshold: 0.5 })
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setValue(to)
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  return <span ref={ref} className={cn('tabular-nums', className)}>{prefix}{value}{suffix}</span>
}

/** Cinta que se desplaza sin fin; se pausa al pasar el cursor. */
export function Marquee({ duration = 40, className, children }) {
  return (
    <div className={cn('marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]', className)}>
      <div className="marquee-track" style={{ '--marquee-duration': `${duration}s` }}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>{children}</div>
      </div>
    </div>
  )
}

/** Progreso de lectura de la página (0 a 1) y si ya se hizo scroll. */
export function useScrollState(offset = 24) {
  const [state, setState] = useState({ scrolled: false, progress: 0 })
  useEffect(() => {
    let raf
    const update = () => {
      raf = null
      const max = document.documentElement.scrollHeight - window.innerHeight
      setState({ scrolled: window.scrollY > offset, progress: max > 0 ? window.scrollY / max : 0 })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [offset])
  return state
}

/** Barra de progreso de scroll con franjas de poste de barbería. */
export function ScrollProgress({ className }) {
  const { progress } = useScrollState()
  return (
    <div className={cn('fixed top-0 inset-x-0 z-50 h-[3px] pointer-events-none', className)} aria-hidden>
      <div className="barber-pole h-full origin-left" style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}
