import clsx from 'clsx'

// Une clases de Tailwind de forma condicional: cn('a', cond && 'b')
export function cn(...args) {
  return clsx(...args)
}
