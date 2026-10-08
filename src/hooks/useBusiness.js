// Negocio actual. Hasta la Fase 5 (varios negocios) siempre es Peludos;
// después se leerá de la tabla businesses según el slug de la URL.
// Los datos son los que mostraba la página de inicio anterior.
const PELUDOS = {
  slug: 'peludos',
  name: 'Peludos Barber Shop',
  type: 'Barbería',
  city: 'Ciudad del Carmen, Campeche',
  tagline: 'Barbería clásica con comodidades modernas en el corazón de Ciudad del Carmen.',
  // Horario del local (getDay(): 0 = domingo)
  hours: [
    { label: 'Lunes a sábado', days: [1, 2, 3, 4, 5, 6], open: '09:00', close: '20:00' },
    { label: 'Domingo', days: [0], open: '10:00', close: '16:00' },
  ],
}

export function useBusiness() {
  return PELUDOS
}

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** "Abierto · cierra a las 20:00" / "Cerrado · abre a las 09:00" */
export function openStatus(business, now = new Date()) {
  const today = business.hours.find((h) => h.days.includes(now.getDay()))
  const minutes = now.getHours() * 60 + now.getMinutes()
  if (today && minutes >= toMin(today.open) && minutes < toMin(today.close)) {
    return { open: true, text: `Abierto · cierra a las ${today.close}` }
  }
  if (today && minutes < toMin(today.open)) return { open: false, text: `Cerrado · abre hoy a las ${today.open}` }
  for (let i = 1; i <= 7; i++) {
    const d = (now.getDay() + i) % 7
    const next = business.hours.find((h) => h.days.includes(d))
    if (next) return { open: false, text: `Cerrado · abre ${i === 1 ? 'mañana' : 'el próximo día hábil'} a las ${next.open}` }
  }
  return { open: false, text: 'Cerrado' }
}
