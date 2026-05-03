# 📋 Peludos Barber Shop — Lista de Tareas de Mejora

> Generado el: Mayo 2026  
> Prioridad: 🔴 Crítico · 🟠 Importante · 🟡 Mejora rápida · 🔵 Nice to have

---

## 🔴 CRÍTICO — Rompen la experiencia o el negocio

- [ ] **Slots disponibles reales en BookAppointment**  
  Actualmente se muestran todos los time slots fijos (09:00–19:00) sin verificar si ya están ocupados.  
  _Fix:_ Al seleccionar barbero + fecha, consultar las citas existentes y marcar como deshabilitados los slots ya tomados.  
  _Archivo:_ `src/pages/BookAppointment.jsx`

- [ ] **Filtros en ManageAppointments**  
  La tabla de citas carga TODOS los registros de toda la historia sin paginación ni filtros.  
  _Fix:_ Agregar filtros por: fecha (hoy / esta semana / este mes / rango personalizado), barbero, estado (pending / accepted / completed / cancelled), y buscador por nombre de cliente.  
  _Archivo:_ `src/pages/admin/ManageAppointments.jsx`

- [ ] **Notificaciones por correo**  
  El proyecto requiere este módulo pero no está implementado.  
  _Fix:_ Usar Supabase Edge Functions + Resend (o similar) para enviar:  
  - Confirmación al agendar  
  - Recordatorio 24h antes de la cita  
  - Notificación al cancelar  
  _Archivos nuevos:_ `supabase/functions/send-confirmation/`, `supabase/functions/send-reminder/`

- [ ] **Página de Registro funcional**  
  `Register.jsx` tiene solo 301 bytes — el formulario de registro no está construido en el frontend.  
  _Fix:_ Construir el formulario con campos: nombre completo, teléfono, correo, contraseña. Manejar errores de validación.  
  _Archivo:_ `src/pages/Register.jsx`

- [ ] **Página de Perfil funcional**  
  `Profile.jsx` tiene solo 247 bytes — el cliente no puede editar su información.  
  _Fix:_ Formulario para editar nombre, teléfono y contraseña. Usar `supabase.auth.updateUser()` para contraseña y update en `profiles` para los demás campos.  
  _Archivo:_ `src/pages/Profile.jsx`

---

## 🟠 IMPORTANTE — Afectan la funcionalidad real del sistema

- [ ] **Botón "Aceptar/Confirmar" cita en el panel admin**  
  El estado `accepted` existe en la BD pero no hay botón para transicionarlo desde el admin. Solo están ✓ (completar) y ✕ (cancelar).  
  _Fix:_ Agregar botón "Confirmar" que cambie `pending → accepted`. Notificar al cliente por correo.  
  _Archivo:_ `src/pages/admin/ManageAppointments.jsx`

- [ ] **Horarios de trabajo por barbero**  
  No existe configuración de días/horas disponibles por barbero. Se puede agendar en cualquier día y hora.  
  _Fix:_ Crear tabla `barber_schedules` con días de semana y horarios. Validar contra este horario al reservar.  
  _Archivos:_ Migración en Supabase + `src/pages/admin/ManageBarbers.jsx` + `src/pages/BookAppointment.jsx`

- [ ] **Historial de citas por cliente desde el admin**  
  ManageClients muestra nombre y teléfono pero no el historial de servicios del cliente.  
  _Fix:_ Agregar botón "Ver historial" que abra un modal o nueva vista con todas las citas del cliente: fecha, servicio, precio, barbero, estado.  
  _Archivo:_ `src/pages/admin/ManageClients.jsx`

- [ ] **Duración real del servicio al calcular ends_at**  
  `BookAppointment` asume siempre 60 minutos. La tabla `services` ya tiene el campo `duration_min`.  
  _Fix:_ Leer `duration_min` del servicio seleccionado y usarlo para calcular `ends_at` correctamente.  
  _Archivo:_ `src/pages/BookAppointment.jsx`

- [ ] **Campo duration_min en ManageServices**  
  Al agregar un servicio solo se piden nombre y precio. La duración no se captura.  
  _Fix:_ Agregar campo "Duración (minutos)" en el formulario de nuevo servicio y en la edición.  
  _Archivo:_ `src/pages/admin/ManageServices.jsx`

- [ ] **Gráficas en Reportes**  
  `Reports.jsx` muestra solo cajas con números. `ReportChart.jsx` está en 0 bytes.  
  _Fix:_ Integrar `recharts` para mostrar: ingresos por día (línea), citas por barbero (barras), servicios más populares (pastel).  
  _Archivos:_ `src/components/admin/ReportChart.jsx`, `src/pages/admin/Reports.jsx`

---

## 🟡 MEJORAS RÁPIDAS — Poco esfuerzo, alto impacto

- [ ] **Buscador en tiempo real en ManageClients**  
  Filtrar la lista de clientes por nombre o teléfono sin hacer nueva query a Supabase.  
  _Archivo:_ `src/pages/admin/ManageClients.jsx`

- [ ] **Mostrar precio en MyAppointments**  
  El cliente solo ve el nombre del servicio y el barbero, no el precio.  
  _Fix:_ Incluir `price` en el select de la query y mostrarlo en la tarjeta.  
  _Archivo:_ `src/pages/MyAppointments.jsx`

- [ ] **Notas opcionales al reservar**  
  El cliente no puede comunicar preferencias al barbero antes de llegar.  
  _Fix:_ Agregar campo textarea "Notas para el barbero (opcional)" en BookAppointment. Guardar en columna `notes` de `appointments`.  
  _Archivo:_ `src/pages/BookAppointment.jsx`

- [ ] **Validar horario de atención en el selector de fecha/hora**  
  No se restringen los días fuera de horario ni los domingos después de las 16:00.  
  _Fix:_ Agregar lógica al selector de fecha para deshabilitar días no laborables. Filtrar time slots según el día seleccionado (L-S: 09:00–19:00, D: 10:00–15:00).  
  _Archivo:_ `src/pages/BookAppointment.jsx`

- [ ] **Validación de overlap en frontend antes de enviar**  
  `src/utils/overlapCheck.js` existe pero no se usa en BookAppointment. Si el error viene solo de Supabase, el mensaje es técnico.  
  _Fix:_ Llamar a `overlapCheck` antes de hacer el insert y mostrar un mensaje claro: "Este horario ya está ocupado, elige otro."  
  _Archivos:_ `src/utils/overlapCheck.js`, `src/pages/BookAppointment.jsx`

- [ ] **Paginación en todas las tablas del admin**  
  Todas las tablas cargan todos los registros en una sola query.  
  _Fix:_ Implementar paginación simple con `.range(from, to)` de Supabase. Mostrar botones Anterior / Siguiente y número de página.  
  _Archivos:_ `ManageAppointments.jsx`, `ManageClients.jsx`, `ManageBarbers.jsx`

- [ ] **Filtro de citas en MyAppointments**  
  El cliente ve todas sus citas mezcladas sin poder filtrar.  
  _Fix:_ Agregar tabs o selector: Todas · Próximas · Completadas · Canceladas.  
  _Archivo:_ `src/pages/MyAppointments.jsx`

- [ ] **Mensaje de error más claro en fallos de Supabase**  
  Muchos `catch` muestran el error crudo de Supabase al usuario.  
  _Fix:_ Mapear los errores más comunes a mensajes en español amigables.  
  _Archivos:_ `BookAppointment.jsx`, `AppointmentDetails.jsx`

---

## 🔵 NICE TO HAVE — Para una versión más completa

- [ ] **Foto de perfil para barberos**  
  `BarberCard.jsx` y `BarberSelector.jsx` están vacíos.  
  _Fix:_ Subir foto a Supabase Storage y mostrarla en el selector de barbero al reservar.  
  _Archivos:_ `src/components/barbers/BarberCard.jsx`, `src/components/barbers/BarberSelector.jsx`

- [ ] **Calificación / reseña al completar una cita**  
  El cliente no puede dejar feedback.  
  _Fix:_ Al marcar una cita como completada, mostrar un modal para que el cliente deje una calificación de 1–5 estrellas y un comentario.  
  _Tabla nueva:_ `reviews` (appointment_id, rating, comment, created_at)

- [ ] **Vista de calendario semanal para el admin**  
  `WeeklyCalendar.jsx` está en 0 bytes.  
  _Fix:_ Implementar una vista tipo calendario (por columnas de días y filas de horas) con las citas de todos los barberos de la semana.  
  _Archivo:_ `src/components/admin/WeeklyCalendar.jsx`

- [ ] **Tiempo de espera estimado en tiempo real**  
  El cliente no sabe cuánto tiempo tardará el barbero en estar disponible.  
  _Fix:_ Mostrar en la página de inicio o al elegir barbero: "Próxima disponibilidad: hoy a las 15:00".

- [ ] **Exportar lista de clientes en ManageClients**  
  El admin no puede exportar su base de clientes.  
  _Fix:_ Botón "Exportar CSV" similar al que ya existe en Reportes.  
  _Archivo:_ `src/pages/admin/ManageClients.jsx`

---

## ✨ EXPERIENCIA DEL CLIENTE — Flujo completo y agradable

### 🏠 Página de inicio y descubrimiento

- [ ] **Hero section con identidad de la barbería**  
  La página de inicio actual es básica. El cliente necesita sentir confianza antes de reservar.  
  _Fix:_ Agregar sección con nombre, slogan, foto del local o trabajos, horario visible y botón "Reservar ahora" prominente.  
  _Archivo:_ `src/pages/Home.jsx`

- [ ] **Sección "Nuestros barberos" en Home**  
  El cliente no sabe quiénes son los barberos antes de elegir uno.  
  _Fix:_ Mostrar tarjetas de cada barbero activo con foto, nombre, especialidad y calificación promedio. Cada tarjeta lleva directo a reservar con ese barbero.  
  _Archivos:_ `src/pages/Home.jsx`, `src/components/barbers/BarberCard.jsx`

- [ ] **Catálogo de servicios público en Home**  
  `Services.jsx` tiene 249 bytes — está vacío. El cliente no puede ver precios sin registrarse.  
  _Fix:_ Mostrar todos los servicios activos con nombre, precio y duración estimada. No requiere login.  
  _Archivos:_ `src/pages/Services.jsx`, `src/components/services/ServiceCard.jsx`

- [ ] **Próxima disponibilidad en tiempo real**  
  El cliente no sabe si puede ir hoy o cuándo es el siguiente slot libre.  
  _Fix:_ Mostrar en Home o en el selector de barbero: "Próximo horario disponible: hoy a las 15:00".  
  _Archivo:_ `src/pages/Home.jsx`

---

### 📅 Flujo de reservación mejorado

- [ ] **Slots ocupados visualmente diferenciados**  
  En lugar de ocultar los slots tomados, mostrarlos tachados o grises para que el cliente entienda la disponibilidad del día.  
  _Archivo:_ `src/pages/BookAppointment.jsx`

- [ ] **Selector de hora con botones grandes en lugar de dropdown**  
  En móvil, un `<select>` es difícil de usar. Botones tipo grid son más táctiles y visuales.  
  _Fix:_ Reemplazar el dropdown de hora por una cuadrícula de botones (disponible = dorado, ocupado = gris tachado).  
  _Archivos:_ `src/pages/BookAppointment.jsx`, `src/components/appointments/TimeSlotPicker.jsx`

- [ ] **Foto de referencia del corte al reservar**  
  El cliente quiere mostrarle al barbero exactamente qué quiere.  
  _Fix:_ Agregar opción de subir una imagen de referencia al reservar. Guardar URL en `appointments.reference_image_url`.  
  _Tabla:_ Agregar columna `reference_image_url` a `appointments`. Usar Supabase Storage.  
  _Archivo:_ `src/pages/BookAppointment.jsx`

- [ ] **Pantalla de resumen antes de confirmar**  
  Actualmente el cliente presiona "Confirmar Cita" y ya. No hay pantalla de revisión.  
  _Fix:_ Agregar paso final que muestre: barbero, servicio, fecha, hora, precio y notas. Botones "Editar" y "Confirmar".  
  _Archivo:_ `src/pages/BookAppointment.jsx`

- [ ] **Botón "Agregar al calendario" después de reservar**  
  El cliente confirma su cita pero no tiene recordatorio externo.  
  _Fix:_ Al confirmar, mostrar botón que genere un enlace `.ics` (iCal) o abra Google Calendar con los datos prellenados.  
  _Archivo:_ `src/pages/BookAppointment.jsx`

---

### 🔔 Notificaciones inteligentes

- [ ] **Recordatorio 24h antes con opción de confirmar o cancelar**  
  El correo de recordatorio debe incluir botones de acción directos, sin que el cliente tenga que entrar al sistema.  
  _Fix:_ Generar tokens temporales firmados para "Confirmar asistencia" y "Cancelar cita" desde el correo.  
  _Archivos nuevos:_ `supabase/functions/send-reminder/`

- [ ] **Alerta al cliente si el barbero cancela**  
  Si el admin cancela una cita, el cliente no recibe ningún aviso.  
  _Fix:_ Al cancelar desde el admin, disparar correo/WhatsApp automático al cliente con disculpa y opción de reagendar.  
  _Archivo:_ `src/pages/admin/ManageAppointments.jsx`

- [ ] **Recordatorio de "Ya es tiempo de tu próximo corte"**  
  Si un cliente no ha reservado en X semanas, enviarle un recordatorio amigable.  
  _Fix:_ Supabase Cron Job que revise clientes inactivos y envíe correo: "Han pasado 3 semanas desde tu último corte con Carlos".  
  _Archivo nuevo:_ `supabase/functions/retention-reminder/`

- [ ] **Notificación de cumpleaños con descuento**  
  Un detalle que fideliza clientes.  
  _Fix:_ Guardar fecha de nacimiento en `profiles`. Cron diario que detecte cumpleaños y envíe cupón de descuento.  
  _Tabla:_ Agregar columna `birthdate` a `profiles`.

- [ ] **Notificación por WhatsApp**  
  La mayoría de clientes preferirá WhatsApp sobre correo.  
  _Fix:_ Integrar Twilio o WhatsApp Business API para confirmaciones y recordatorios. Activar solo si el cliente dejó teléfono.  
  _Archivo nuevo:_ `supabase/functions/send-whatsapp/`

---

### ⭐ Calificaciones y fidelización

- [ ] **Sistema de reseñas después de cada cita**  
  Al completar una cita, el cliente recibe un correo con enlace a una vista de calificación rápida (1–5 estrellas + comentario opcional).  
  _Tabla nueva:_ `reviews` (id, appointment_id, client_id, barber_id, rating, comment, created_at)  
  _Archivos nuevos:_ `src/pages/LeaveReview.jsx`

- [ ] **Calificación promedio visible en el selector de barbero**  
  El cliente debe ver "⭐ 4.8 (23 reseñas)" al elegir barbero.  
  _Archivo:_ `src/pages/BookAppointment.jsx`

- [ ] **Sistema de puntos por fidelidad**  
  Cada cita completada suma puntos canjeables por descuentos.  
  _Fix:_ Agregar columna `loyalty_points` a `profiles`. Sumar puntos al completar cita. Crear vista "Mis puntos" en el perfil del cliente.  
  _Archivos:_ `src/pages/Profile.jsx`, `src/pages/admin/ManageClients.jsx`

- [ ] **Badge "Cliente frecuente"**  
  Mostrar una distinción al cliente que tiene más de X citas completadas en el mes.  
  _Archivo:_ `src/pages/MyAppointments.jsx`

---

### 💈 Panel del barbero — vista mejorada

- [ ] **Vista de agenda tipo calendario (no solo lista)**  
  La agenda actual es una lista vertical. Un calendario de día/semana es más intuitivo para el barbero.  
  _Fix:_ Implementar vista de día con columna de horas y bloques de citas. Usar `WeeklyCalendar.jsx`.  
  _Archivos:_ `src/pages/barber/BarberAgenda.jsx`, `src/components/admin/WeeklyCalendar.jsx`

- [ ] **"Siguiente cliente" destacado al inicio**  
  El barbero necesita saber de un vistazo quién es su próximo cliente y en cuánto tiempo llega.  
  _Fix:_ Card especial en la parte superior de BarberAgenda con: nombre del cliente, servicio, hora y cuenta regresiva.  
  _Archivo:_ `src/pages/barber/BarberAgenda.jsx`

- [ ] **Bloquear horas manualmente desde la agenda**  
  El barbero no puede marcar "estoy ocupado de 14:00 a 16:00 el martes".  
  _Fix:_ Botón "Bloquear horario" en la agenda. Guardar en tabla `blocked_slots` (barber_id, date, start_time, end_time, reason).  
  _Tabla nueva:_ `blocked_slots`  
  _Archivos:_ `src/pages/barber/BarberAgenda.jsx`, `src/pages/BookAppointment.jsx`

- [ ] **Estadísticas propias del barbero**  
  El barbero no sabe cuánto generó ni cuál es su servicio más popular.  
  _Fix:_ Agregar sección en BarberAgenda con: ingresos de esta semana, citas completadas, servicio más frecuente, calificación promedio.  
  _Archivo:_ `src/pages/barber/BarberAgenda.jsx`

- [ ] **Marcar "cliente en silla" / inicio de corte**  
  Para calcular tiempos reales y avisar al siguiente cliente.  
  _Fix:_ Botón "Iniciar corte" que registra `started_at` en la cita. Útil para métricas de duración real vs estimada.  
  _Tabla:_ Agregar columna `started_at` a `appointments`.  
  _Archivo:_ `src/pages/barber/BarberAgenda.jsx`

---

### 📱 Experiencia móvil

- [ ] **Layout de una sola columna en BookAppointment para móvil**  
  El grid de 2 columnas (fecha/hora) se rompe en pantallas pequeñas.  
  _Fix:_ Usar CSS media queries o clases responsive para apilar los campos en móvil.  
  _Archivo:_ `src/pages/BookAppointment.jsx`

- [ ] **Botón flotante "Reservar ahora" visible en todas las páginas**  
  El CTA principal debe estar siempre a la vista en móvil.  
  _Fix:_ Agregar FAB (Floating Action Button) fijo en la esquina inferior derecha visible para clientes logueados.  
  _Archivo:_ `src/components/layout/Navbar.jsx`

- [ ] **Instalar como PWA (Progressive Web App)**  
  El cliente puede "instalar" el sistema en su celular como si fuera una app nativa.  
  _Fix:_ Agregar `manifest.json` con ícono, nombre y colores. Registrar un Service Worker básico para caché offline.  
  _Archivos nuevos:_ `public/manifest.json`, `public/sw.js`

---

## 🚀 ROADMAP HACIA SaaS

- [ ] **Modelo multi-tenant**  
  Agregar tabla `shops` y campo `shop_id` a todas las tablas principales. Configurar RLS de Supabase por `shop_id`.

- [ ] **Registro de nueva barbería (onboarding)**  
  Flujo para que un nuevo negocio cree su cuenta, configure sus barberos y servicios sin tocar código.

- [ ] **Planes de suscripción con Stripe**  
  Básico (1 barbero) · Profesional (5 barberos) · Ilimitado. El plan controla límites del sistema.

- [ ] **Subdomain o slug por barbería**  
  `peludos.tuapp.com` o `tuapp.com/peludos`. Cada cliente accede al sistema de su barbería.

- [ ] **Personalización de marca por tenant**  
  Logo, colores primarios y nombre del negocio configurables. Las variables de color ya están centralizadas — solo hay que hacerlas dinámicas por tenant.

- [ ] **Dashboard de métricas por negocio**  
  Ticket promedio, servicio más popular, hora pico, tasa de cancelación por barbero, clientes nuevos por mes.

---

## 📁 Componentes vacíos por construir

| Archivo | Tamaño actual | Qué debe hacer |
|---|---|---|
| `src/pages/Register.jsx` | 301 bytes | Formulario de registro completo |
| `src/pages/Profile.jsx` | 247 bytes | Editar nombre, teléfono, contraseña |
| `src/pages/Services.jsx` | 249 bytes | Catálogo público de servicios con precios |
| `src/components/admin/ReportChart.jsx` | 0 bytes | Gráficas con recharts |
| `src/components/admin/WeeklyCalendar.jsx` | 0 bytes | Vista calendario semanal |
| `src/components/barbers/BarberCard.jsx` | 0 bytes | Tarjeta de barbero con foto y bio |
| `src/components/barbers/BarberSelector.jsx` | 0 bytes | Selector visual de barbero al reservar |
| `src/components/appointments/AppointmentCard.jsx` | 0 bytes | Tarjeta reutilizable de cita |
| `src/components/appointments/AppointmentForm.jsx` | 0 bytes | Formulario de cita reutilizable |
| `src/components/appointments/AppointmentList.jsx` | 0 bytes | Lista reutilizable de citas |
| `src/components/appointments/TimeSlotPicker.jsx` | 0 bytes | Selector de horario con slots disponibles |
| `src/components/services/ServiceCard.jsx` | 0 bytes | Tarjeta de servicio con precio y duración |
| `src/components/services/ServiceList.jsx` | 0 bytes | Lista de servicios para el catálogo |
| `src/hooks/useAppointments.js` | 0 bytes | Hook para lógica de citas |
| `src/hooks/useAuth.js` | 0 bytes | Hook para acceso al contexto de auth |
| `src/hooks/useBarbers.js` | 0 bytes | Hook para cargar barberos |
| `src/hooks/useServices.js` | 0 bytes | Hook para cargar servicios |

---

---

_Última actualización: Mayo 2026 — v2.0 con sección de experiencia del cliente._
