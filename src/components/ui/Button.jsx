import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import Spinner from './Spinner'

const VARIANTS = {
  primary:   'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low hover:border-outline',
  ghost:     'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low',
  danger:    'bg-error text-on-error hover:bg-red-800',
  // Estilo premium (landing y portal público)
  gold:      'btn-shine bg-gold text-ink hover:bg-gold-hover hover:shadow-[0_8px_24px_-6px_rgba(201,164,92,0.6)] font-body-semibold focus-visible:ring-gold',
  'outline-light': 'border border-white/25 text-white hover:bg-white/10 hover:border-white/40 focus-visible:ring-white focus-visible:ring-offset-ink',
  'outline-dark': 'border border-ink/20 bg-white text-ink hover:border-gold hover:text-gold-deep focus-visible:ring-gold',
}

const SIZES = {
  sm:   'h-8 px-2.5 gap-1.5 text-body-sm font-medium',
  md:   'h-9 px-space-md gap-space-xs text-body-medium',
  icon: 'h-9 w-9 justify-center',
  'icon-sm': 'h-8 w-8 justify-center',
}

/**
 * Botón estándar.
 * - variant: primary | secondary | ghost | danger | gold | outline-light | outline-dark
 * - size: sm | md | icon | icon-sm
 * - icon / iconRight: componente de lucide-react
 * - as: elemento o componente a renderizar (por ejemplo Link de react-router)
 */
const Button = forwardRef(function Button(
  {
    as: Comp = 'button',
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled,
    className,
    children,
    type,
    ...props
  },
  ref
) {
  const iconSize = size === 'sm' || size === 'icon-sm' ? 16 : 18
  const isDisabled = disabled || loading

  return (
    <Comp
      ref={ref}
      type={Comp === 'button' ? (type ?? 'button') : type}
      disabled={Comp === 'button' ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      className={cn(
        'inline-flex items-center rounded-lg font-body-medium whitespace-nowrap transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-150 ease-out-strong active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? <Spinner size={iconSize} /> : Icon && <Icon size={iconSize} strokeWidth={1.75} aria-hidden />}
      {children}
      {IconRight && !loading && <IconRight size={iconSize} strokeWidth={1.75} aria-hidden />}
    </Comp>
  )
})

export default Button
