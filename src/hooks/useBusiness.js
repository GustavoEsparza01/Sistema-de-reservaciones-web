// Negocio actual. Hasta la Fase 5 (varios negocios) siempre es Peludos;
// después se leerá de la tabla businesses según el slug de la URL.
const PELUDOS = {
  slug: 'peludos',
  name: 'Peludos Barber Shop',
  type: 'Barbería',
}

export function useBusiness() {
  return PELUDOS
}
