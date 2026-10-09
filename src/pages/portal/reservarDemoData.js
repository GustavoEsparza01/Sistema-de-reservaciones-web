// Datos de prueba para estresar la reserva (solo desarrollo: ?datos=peor|vacio|uno|sinlugar).
// Mismo formato que fetchPublicServices / fetchPublicBarbers. No tocan Supabase.
// Límites reales: descripción de servicio 160 (lib/services.js), bio 400 (lib/team.js);
// nombre de servicio, nombre de barbero y precio no tienen límite.

const week = (start, end, off = []) =>
  Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((d) => [String(d), { isWorking: !off.includes(d), start, end }]))

const descripcion160 =
  'Corte con tijera y máquina, degradado alto, diseño de líneas, perfilado de barba con navaja, toalla caliente, mascarilla y peinado con cera mate para terminar bien.'

const bio400 =
  'Barbero desde 2009, formado en Monterrey y Ciudad de México. Especialista en degradados, diseños con navaja y barba clásica. Ha trabajado en concursos regionales y da clases los domingos a nuevos barberos de Ciudad del Carmen. Le gusta platicar de fútbol y de música norteña mientras corta, pero si prefieres silencio solo dilo. Atiende niños desde los 3 años con paciencia y sin prisas por favor.'

const services = [
  { id: 'demo-s1', name: 'Corte Clásico con Degradado Alto, Diseño de Líneas y Perfilado de Barba con Navaja', description: descripcion160, price: 4850.5, duration: 150 },
  { id: 'demo-s2', name: '💈 Corte + Barba', description: '', price: 0, duration: 45 },
  { id: 'demo-s3', name: 'X', description: 'Una sola letra como nombre.', price: 12500, duration: 30 },
  { id: 'demo-s4', name: 'Paquete Día del Novio: corte, barba, facial, manicura y fotografía', description: 'Incluye una bebida.', price: 3450, duration: 240 },
]

const barbers = [
  { id: 'demo-b1', name: 'José Guadalupe Hernández de la Cruz Villanueva', bio: bio400, schedule: week('09:00', '20:00', [0]), photo: null },
  { id: 'demo-b2', name: 'J', bio: '', schedule: week('10:00', '14:00', [0, 6]), photo: null },
  { id: 'demo-b3', name: '🦊 Lalo', bio: 'Barba y bigote.', schedule: week('12:00', '18:00'), photo: 'https://example.invalid/foto-rota.jpg' },
  // Turno de 20 h: el horario no tiene límite en el panel; con un servicio de 30 min da 40 horarios
  { id: 'demo-b4', name: 'Konstantin Oberhauser-Wettstein', bio: 'Turno extendido de 03:00 a 23:00.', schedule: week('03:00', '23:00'), photo: null },
  { id: 'demo-b5', name: 'Jo', bio: 'Solo los domingos.', schedule: week('10:00', '16:00', [1, 2, 3, 4, 5, 6]), photo: null },
]

export const DEMO_DATA = {
  // Todo lo difícil a la vez
  peor: { services, barbers },
  // Negocio recién creado: sin servicios ni barberos
  vacio: { services: [], barbers: [] },
  // Un servicio y un barbero
  uno: { services: [services[2]], barbers: [barbers[1]] },
  // Barberos que nunca trabajan: 0 horarios en todos los días
  sinlugar: { services: services.slice(1, 2), barbers: barbers.slice(0, 2).map((b) => ({ ...b, schedule: week('09:00', '20:00', [0, 1, 2, 3, 4, 5, 6]) })) },
}

