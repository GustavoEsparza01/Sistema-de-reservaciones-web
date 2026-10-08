import { forwardRef } from 'react'
import { cn } from '../../lib/cn'
import Spinner from './Spinner'

const VARIANTS = {
  primary:   'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low hover:border-outline',
  ghost:     'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low',
  danger:    'bg-error text-on-error hover:bg-red-800',
}

const SIZES = {
  sm:   'h-8 px-2.5 gap-1.5 text-body-sm font-medium',
  md:   'h-9 px-space-md gap-space-xs text-body-medium',
  icon: 'h-9 w-9 justify-center',
  'icon-sm': 'h-8 w-8 justify-center',
}

/**
 * Botón estándar.
 * - variant: primary | secondary | ghost | danger
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
        'inline-flex items-center rounded-lg font-body-medium whitespace-nowrap transition-colors',
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
