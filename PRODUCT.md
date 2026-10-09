# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Clientes de Peludos Barber Shop** (Ciudad del Carmen, Campeche). La mayoría reserva desde el celular, a menudo con una mano y con prisa. Su trabajo: elegir servicio, barbero, día y hora, y salir con la cita apartada sin llamar.
- **Administrador (dueño de la barbería).** Revisa y confirma las citas pendientes, gestiona agenda, clientes, equipo, servicios, reportes y configuración. Uso diario, de trabajo.
- **Barberos.** Consultan "Mi agenda" del día con sus citas y notas del cliente.

## Product Purpose

Barber OS es una plataforma web de reservaciones para barberías; Peludos Barber Shop es el primer negocio que la usa. Existe para que el cliente reserve en minutos desde el celular y para que la barbería lleve su agenda sin libreta ni llamadas. Éxito: reservas completadas desde el portal público y citas confirmadas sin fricción para el negocio.

Hoy es un proyecto universitario sin producción real; la intención es convertirlo en un producto para vender a otras barberías después de Peludos.

## Positioning

Hecho específicamente para barberías (servicio, barbero, horario y notas del corte), no un calendario genérico de citas. Cada negocio tiene su propio portal público con su marca (`/:slug`), y la plataforma se presenta aparte como Barber OS.

## Operating Context

- Flujo del cliente: página del negocio (`/peludos`) → reserva en 4 pasos (servicio → barbero → fecha y hora → confirmar) → "Mis citas" y perfil. Confirmar pide cuenta; la selección se conserva en la URL al iniciar sesión.
- La cita se crea como **pendiente**; la barbería la revisa y la confirma. **El cliente se entera por WhatsApp o llamada de la barbería** (además del estado en "Mis citas"). El número de contacto aún no está definido.
- El pago es en el local al terminar; no se cobra nada al reservar.
- Horario del local: lunes a sábado 09:00 a 20:00, domingo 10:00 a 16:00 (fijo en `src/hooks/useBusiness.js`).
- Panel `/app/*` para administrador y barbero; landing de la plataforma en `/barber-os` y alta de negocio en `/onboarding` (solo frontend por ahora).

## Capabilities and Constraints

- React 18 + Vite + Tailwind 3 + Supabase (auth y base de datos). JavaScript, sin TypeScript. Publicado en Vercel desde `master`.
- Un solo negocio fijo en código hasta la Fase 5 (tabla `businesses`, varios negocios); no asumir que existe.
- Disponibilidad calculada en el navegador (`src/lib/availability.js`): turno del barbero, duración del servicio, sin encimarse y nunca en el pasado.
- En el navegador solo la clave anon de Supabase. Los cambios de base de datos son migraciones que el dueño del proyecto ejecuta a mano.
- **Decisiones pendientes:** número de WhatsApp o teléfono del negocio, dirección exacta, política de cancelación y tolerancia de retraso. No inventarlas en la interfaz.

## Brand Commitments

- Nombres: **Barber OS** (plataforma) y **Peludos Barber Shop** (negocio).
- Todo en español de México: interfaz, mensajes y textos.
- Restricción visual dada por el dueño: respetar `tailwind.config.js` y `design/stitch/DESIGN.md`; no cambiar paleta ni fuentes. El portal público usa el estilo premium carbón y dorado; el panel se queda sobrio en azul.

## Evidence on Hand

- **No hay material real del negocio todavía:** ni fotos del local o de cortes, ni fotos o nombres reales de barberos (en la base todos se llaman "Barbero"), ni dirección exacta, teléfono o redes.
- `public/portal-hero-*.jpg` (derivada de `public/hero-bg.png`) es una foto ilustrativa que **no es de Peludos**; debe reemplazarse cuando haya fotos reales.
- No inventar reseñas, testimonios, número de clientes, años de experiencia ni datos de contacto.

## Product Principles

1. **Reservar primero.** En el portal, cada pantalla acerca al cliente a una cita apartada; lo demás es secundario.
2. **El celular manda.** Se diseña y se prueba primero a 360–430 px, con la acción principal al alcance del pulgar.
3. **Honestidad sobre el estado de la cita.** Decir con claridad que la cita queda pendiente hasta que la barbería la confirma y que se paga en el local.
4. **Datos reales o nada.** Si falta un dato del negocio, se omite o se marca como ejemplo; nunca se finge.
5. **Panel para trabajar, portal para vender.** El panel prioriza claridad y rapidez de uso; la expresión de marca vive en el portal.

## Accessibility & Inclusion

- Respetar `prefers-reduced-motion` en todo el movimiento.
- Contraste WCAG AA en textos, incluido el dorado sobre crema y blanco, y flujo de reserva usable con teclado y lector de pantalla.
