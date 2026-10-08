// Roles y página de inicio de cada uno.
// El cliente sigue en la página actual hasta que exista el portal /:slug (Fase 4).
const HOME = {
  admin: '/app/resumen',
  barber: '/app/mi-agenda',
  client: '/peludos',
}

/** ¿El usuario tiene alguno de los roles pedidos? El admin que es barbero cumple 'barber'. */
export function hasRole({ isAdmin, isBarber }, roles) {
  if (!roles || roles.length === 0) return true
  return roles.some((r) => (r === 'admin' && isAdmin) || (r === 'barber' && isBarber) || r === 'client')
}

/** Ruta de inicio según el rol principal del usuario. */
export function homePathFor({ isAdmin, isBarber }) {
  if (isAdmin) return HOME.admin
  if (isBarber) return HOME.barber
  return HOME.client
}

/**
 * Valida el parámetro ?volver= para no redirigir a otro sitio:
 * solo rutas internas que empiezan con una sola "/".
 */
export function safeReturnPath(value) {
  if (typeof value !== 'string') return null
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null
  if (value.startsWith('/login')) return null
  return value
}
