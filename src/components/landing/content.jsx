// Contenido del landing de Barber OS (textos, planes, preguntas y datos de ejemplo).
// Solo describe funciones que el sistema ya tiene.
import { addMinutes, startOfDay } from 'date-fns'
import { BarChart3, CalendarDays, Globe } from 'lucide-react'
import { Avatar } from '../ui'

// Precios: por definir. Cambia aquí los valores cuando estén decididos (null = "Por anunciar").
export const PLANS = [
  {
    name: 'Básico',
    price: null,
    description: 'Para barberías de un solo sillón.',
    features: ['1 barbero', 'Página de reservas en línea', 'Agenda y citas', 'Clientes con historial'],
  },
  {
    name: 'Profesional',
    price: null,
    highlight: true,
    description: 'Para equipos que crecen.',
    features: ['Barberos ilimitados', 'Todo lo del plan Básico', 'Reportes de ingresos y PDF', 'Agenda propia para cada barbero'],
  },
  {
    name: 'Empresa',
    price: null,
    description: 'Para varias sucursales.',
    features: ['Todo lo del plan Profesional', 'Varias sucursales (próximamente)', 'Acompañamiento en la configuración'],
  },
]

export const FAQS = [
  ['¿Necesito instalar algo?', 'No. Barber OS funciona en el navegador de tu computadora, tableta o celular.'],
  ['¿Mis clientes necesitan descargar una app?', 'No. Reservan desde el enlace de tu barbería, con su correo y contraseña, y ahí mismo consultan o cancelan sus citas.'],
  ['¿Qué pasa si dos clientes quieren el mismo horario?', 'El sistema solo ofrece horarios libres de cada barbero, que alcancen la duración del servicio antes del cierre. Un horario ocupado no se puede reservar dos veces.'],
  ['¿Cada barbero tiene su propio horario?', 'Sí. Defines los días y horas de cada barbero, y cada uno ve su agenda del día con las notas de sus clientes.'],
  ['¿Puedo sacar mis datos?', 'Sí. Citas, clientes y servicios se exportan a CSV (Excel), y los reportes a PDF.'],
  ['¿Cuánto cuesta?', 'Los precios se anunciarán pronto. Mientras tanto puedes ver el sistema funcionando con Peludos Barber Shop.'],
]

export const FEATURES = [
  { icon: Globe, title: 'Reservas en línea 24/7', text: 'Tu barbería tiene su propia página. Los clientes eligen servicio, barbero y horario libre sin llamarte.' },
  { icon: CalendarDays, title: 'Agenda por barbero', text: 'Vista por día o por semana, con turnos, descansos y citas por estado. Agenda o reprograma con un clic.' },
  { icon: BarChart3, title: 'Reportes de ingresos', text: 'Ingresos por día, ticket promedio, servicios más pedidos y rendimiento de cada barbero.' },
]

export const MARQUEE_ITEMS = ['Reservas en línea 24/7', 'Agenda por barbero', 'Clientes con historial', 'Reportes en PDF y CSV', 'Horarios y descansos', 'Sin apps que instalar', 'Cancelación desde la cuenta']

export const STATS = [
  { to: 4, label: 'pasos para reservar' },
  { to: 24, suffix: '/7', label: 'reservas en línea' },
  { to: 100, suffix: '%', label: 'en el navegador' },
  { to: 2, label: 'formatos para exportar: CSV y PDF' },
]

// Agenda de ejemplo para el componente real <TimeGrid> del panel
const today = startOfDay(new Date())
const at = (h, m = 0) => addMinutes(today, h * 60 + m)
const demo = (id, h, m, dur, status, client, service) => ({ id, start: at(h, m), end: at(h, m + dur), duration: dur, status, clientName: client, serviceName: service })
const DEMO_SCHEDULE = Object.fromEntries(['0', '1', '2', '3', '4', '5', '6'].map((k) => [k, { isWorking: true, start: '10:00', end: '15:00' }]))
export const DEMO_COLUMNS = [
  { key: 'a', name: 'Barbero A', appointments: [demo('1', 10, 0, 45, 'completed', 'Cliente 1', 'Corte clásico'), demo('2', 11, 0, 60, 'accepted', 'Cliente 2', 'Corte + barba'), demo('3', 13, 0, 30, 'pending', 'Cliente 3', 'Perfilado')] },
  { key: 'b', name: 'Barbero B', appointments: [demo('4', 10, 30, 60, 'accepted', 'Cliente 4', 'Fade'), demo('5', 12, 30, 45, 'accepted', 'Cliente 5', 'Corte clásico')] },
].map((c) => ({
  ...c,
  date: today,
  schedule: DEMO_SCHEDULE,
  header: (
    <div className="flex items-center gap-space-sm">
      <Avatar name={c.name} size="sm" />
      <span className="font-body-semibold text-body-sm">{c.name}</span>
    </div>
  ),
}))
