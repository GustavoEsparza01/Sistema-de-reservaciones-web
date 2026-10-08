# Prompts para Google Stitch — Rediseño SaaS

> Basado en el análisis del proyecto actual (React + Supabase): roles `client`, `barber`, `admin`; entidades `profiles`, `barbers` (con horario semanal), `services` (precio + duración), `appointments` (estados `pending`, `accepted`, `completed`, `cancelled`, notas del cliente y notas del barbero).
>
> Nombre del producto: **Barber OS** (se lee "barber o-es" y, junto, forma "barberos"). "Peludos Barber Shop" pasa a ser **un cliente (negocio) dentro de la plataforma**, no la marca del producto.

## Cómo usarlos en Stitch

1. Crea un proyecto en modo **Web** (usa el modo de mayor calidad si está disponible).
2. Pega primero el **Prompt 0 (sistema de diseño)** y genera una pantalla (el Dashboard). Esa pantalla fija el estilo.
3. Genera el resto **una pantalla por prompt**, dentro del mismo proyecto. Cada prompt ya repite el resumen de estilo para mantener la consistencia.
4. Para ajustar, pide **un cambio concreto a la vez** ("haz la barra lateral más angosta", "cambia la tabla a 8 filas"). Cambios grandes en un solo mensaje hacen que Stitch ignore parte de las instrucciones.
5. Cuando todas las pantallas estén listas, exporta a Figma o a código para pasarlas a React.

---

## Prompt 0 — Sistema de diseño (pegar primero)

```
Diseña la interfaz de Barber OS, un software SaaS B2B de gestión de citas para barberías y estéticas. Lo usan tres tipos de usuario: el dueño/administrador del negocio, los barberos (empleados) y los clientes finales que reservan citas. Toda la interfaz en español (México), moneda MXN ($), formato de fecha "lun 12 oct 2026" y hora en formato 24 h.

Estilo: profesional, sobrio y confiable, al nivel de Linear, Stripe Dashboard o Calendly. Nada decorativo: sin degradados llamativos, sin texturas, sin fotos de fondo, sin emojis, sin tipografías serif. Prioriza la legibilidad, la densidad de información moderada y la jerarquía clara.

Marca: el producto se llama "Barber OS" y su eslogan es "El sistema operativo de tu barbería". Logo: la palabra "barber" en Inter semibold color #0F172A seguida de "OS" dentro de un pequeño recuadro redondeado azul #2563EB con texto blanco, como una insignia. Para espacios reducidos (favicon, barra lateral colapsada) se usa solo el recuadro azul con "OS".

Sistema visual:
- Tema claro por defecto. Fondo de la app #F8FAFC, superficies (tarjetas, tablas) #FFFFFF, bordes #E2E8F0 de 1px.
- Texto principal #0F172A, secundario #475569, deshabilitado #94A3B8.
- Color primario único: azul #2563EB (botones principales, enlaces, elemento activo del menú). Hover #1D4ED8.
- Colores de estado de cita, siempre como insignias (badges) con fondo suave y texto oscuro:
  Pendiente = ámbar, Confirmada = azul, Completada = verde, Cancelada = gris con texto rojo.
- Tipografía Inter. Títulos de página 24px semibold, títulos de sección 16px semibold, texto 14px, etiquetas y encabezados de tabla 12px en mayúsculas con espaciado.
- Radio de esquinas 8px, sombras muy sutiles solo en menús flotantes y modales.
- Iconos lineales tipo Lucide, 18px, mismo grosor en toda la app.
- Espaciado en múltiplos de 8px.

Estructura del panel (para admin y barbero):
- Barra lateral izquierda fija de 240px, fondo blanco: arriba el logo de Barber OS y un selector del negocio actual ("Peludos Barber Shop" con flecha); en medio la navegación con icono + texto; abajo "Configuración" y la tarjeta del usuario (avatar con iniciales, nombre, rol).
- Barra superior de 64px: título/breadcrumb de la página a la izquierda; a la derecha buscador global (Ctrl+K), campana de notificaciones y botón primario contextual.
- Contenido con ancho máximo de 1280px y padding de 32px.

Componentes estándar a reutilizar: botones (primario, secundario con borde, fantasma, destructivo rojo), inputs con etiqueta arriba y texto de ayuda abajo, selects, tablas con encabezado fijo, filas de 52px, paginación y acciones en menú de tres puntos, tarjetas KPI (etiqueta, valor grande, variación vs. periodo anterior en verde/rojo), pestañas subrayadas, paneles laterales (drawer) para ver detalles sin salir de la página, modales de confirmación, estados vacíos con icono y acción, skeletons de carga y notificaciones tipo toast (nunca alertas del navegador).

Genera primero la pantalla "Resumen" del administrador descrita a continuación usando este sistema.
```

---

## Panel del administrador (dueño del negocio)

Navegación lateral del admin: **Resumen · Agenda · Citas · Clientes · Equipo · Servicios · Reportes** y abajo **Configuración**.

### 1. Resumen (Dashboard)

```
Pantalla "Resumen" del panel del administrador de Barber OS. Usa el sistema de diseño definido (Inter, fondo #F8FAFC, tarjetas blancas con borde #E2E8F0, primario #2563EB, barra lateral de 240px con "Resumen" activo).

Contenido:
- Encabezado: "Buenos días, Gustavo" y la fecha de hoy; a la derecha botón primario "+ Nueva cita".
- Fila de 4 tarjetas KPI: "Citas de hoy" (12), "Ingresos de hoy" ($2,850 MXN), "Pendientes por confirmar" (3, con enlace "Revisar"), "Tasa de cancelación del mes" (6%). Cada una con variación vs. periodo anterior.
- Bloque principal a dos columnas (2/3 y 1/3):
  - Izquierda: "Citas de hoy" como lista cronológica: hora, nombre del cliente, servicio, barbero (avatar pequeño), duración e insignia de estado; botones rápidos "Confirmar" y "Completar" según el estado.
  - Derecha: "Pendientes por confirmar" (lista corta con acciones Confirmar/Rechazar) y debajo "Ocupación del equipo hoy" con una barra de progreso por barbero (citas agendadas vs. horas disponibles).
- Abajo: gráfica de líneas "Ingresos últimos 30 días" a todo el ancho, con selector 7 / 30 / 90 días.
```

### 2. Agenda (calendario semanal)

```
Pantalla "Agenda" del panel del administrador de Barber OS, mismo sistema de diseño (Inter, primario #2563EB, barra lateral con "Agenda" activo).

Es un calendario de recursos estilo Google Calendar / Fresha:
- Barra de herramientas: botones "Hoy", flechas anterior/siguiente, rango de fechas "12 – 18 oct 2026", selector de vista Día / Semana, filtro multiselección de barberos y botón primario "+ Nueva cita".
- Vista Día: una columna por barbero (avatar y nombre en el encabezado), filas cada 30 minutos de 09:00 a 21:00. Las citas son bloques cuyo alto corresponde a su duración, con hora, cliente y servicio; borde izquierdo de color según estado (ámbar pendiente, azul confirmada, verde completada, gris cancelada).
- Las horas fuera del horario laboral del barbero se muestran rayadas en gris claro y no son seleccionables.
- Línea roja horizontal indicando la hora actual.
- Al hacer clic en una cita se abre un panel lateral derecho (drawer) con el detalle: cliente y teléfono, servicio, precio, duración, notas del cliente y acciones Confirmar / Completar / Reprogramar / Cancelar.
Muestra la vista Día con 4 barberos y unas 14 citas distribuidas.
```

### 3. Citas (listado)

```
Pantalla "Citas" del panel del administrador de Barber OS, mismo sistema de diseño (barra lateral con "Citas" activo).

- Encabezado "Citas" con botón secundario "Exportar" y primario "+ Nueva cita".
- Pestañas con contador: Todas (148) · Pendientes (3) · Confirmadas (21) · Completadas (112) · Canceladas (12).
- Barra de filtros: buscador "Buscar por cliente o teléfono", rango de fechas, selector de barbero y selector de servicio, enlace "Limpiar filtros".
- Tabla con columnas: Cliente (nombre + teléfono debajo en gris), Fecha y hora, Servicio, Barbero (avatar + nombre), Duración, Precio, Estado (badge), Acciones (botón contextual "Confirmar" o "Completar" + menú de tres puntos con Ver detalle, Reprogramar, Cancelar).
- Casillas de selección por fila con barra de acciones masivas al seleccionar.
- Paginación abajo: "Mostrando 1–10 de 148" y selector de filas por página.
- Incluye el panel lateral (drawer) abierto mostrando el detalle de una cita con su historial de cambios de estado.
```

### 4. Clientes

```
Pantalla "Clientes" del panel del administrador de Barber OS, mismo sistema de diseño (barra lateral con "Clientes" activo).

- Encabezado "Clientes" con contador total y botón primario "+ Agregar cliente".
- Buscador por nombre o teléfono y filtro de estado (Activo / Bloqueado).
- Tabla: Nombre completo (avatar con iniciales), Teléfono, Correo, Total de visitas, Última visita, Gasto acumulado (MXN), Estado (badge), menú de acciones (Editar, Ver historial, Bloquear).
- Panel lateral derecho abierto con el perfil de un cliente: datos de contacto, fecha de nacimiento, 3 métricas (visitas, gasto total, ticket promedio), barbero preferido y una línea de tiempo "Historial de citas" con fecha, servicio, barbero, estado y las notas que dejó el barbero en cada corte.
```

### 5. Equipo (barberos y horarios)

```
Pantalla "Equipo" del panel del administrador de Barber OS, mismo sistema de diseño (barra lateral con "Equipo" activo).

- Encabezado "Equipo" con botón primario "+ Invitar barbero" (invitación por correo).
- Tabla de miembros: Nombre (avatar), Rol (Administrador / Barbero), Teléfono, Días laborales en formato compacto "L M M J V S", Estado (Activo / Inactivo con interruptor), Acciones (Editar horario, Editar perfil, Desactivar).
- Panel lateral abierto "Horario de Carlos Ramírez":
  - Lista de lunes a domingo; cada día con un interruptor "Trabaja" y, si está activo, hora de entrada y hora de salida (selectores 09:00 – 20:00). Domingo desactivado.
  - Sección "Bloqueos y ausencias": lista de horas o días bloqueados con motivo (ej. "Cita médica, 15 oct 12:00–14:00") y botón "+ Agregar bloqueo".
  - Campo "Biografía pública" (textarea) que verán los clientes.
  - Botones al pie: "Cancelar" y "Guardar cambios".
```

### 6. Servicios (catálogo)

```
Pantalla "Servicios" del panel del administrador de Barber OS, mismo sistema de diseño (barra lateral con "Servicios" activo).

- Encabezado "Servicios" con botón primario "+ Nuevo servicio".
- Tabla: Servicio (nombre + descripción corta en gris), Precio (MXN), Duración (min), Visible al público (interruptor), Estado (Activo / Inactivo), menú de acciones (Editar, Duplicar, Desactivar).
- Datos de ejemplo: Corte Clásico $150 · 30 min; Corte + Barba $250 · 50 min; Arreglo de Barba $120 · 25 min; Desvanecido $180 · 40 min; Diseño / Grecas $80 · 15 min.
- Modal abierto "Nuevo servicio" con campos: Nombre, Descripción, Precio (con prefijo $ y sufijo MXN), Duración en minutos (selector de 15 en 15), Barberos que lo ofrecen (multiselección) y Activo (interruptor). Botones "Cancelar" y "Crear servicio".
```

### 7. Reportes

```
Pantalla "Reportes" del panel del administrador de Barber OS, mismo sistema de diseño (barra lateral con "Reportes" activo).

- Barra superior de filtros: periodo (Hoy / Últimos 7 días / Este mes / Rango personalizado), barbero y servicio. A la derecha botones "Exportar PDF" y "Exportar CSV".
- 4 tarjetas KPI: Ingresos totales, Citas completadas, Ticket promedio, Tasa de cancelación; cada una con variación vs. periodo anterior.
- Gráfica de líneas "Ingresos por día" a todo el ancho.
- Fila de dos tarjetas: gráfica de dona "Citas por estado" (Completadas, Confirmadas, Pendientes, Canceladas con leyenda y porcentajes) y gráfica de barras horizontales "Servicios más solicitados".
- Tabla "Rendimiento por barbero": Barbero, Citas completadas, Ingresos generados, Ticket promedio, Cancelaciones.
Las gráficas usan solo tonos de azul y gris, salvo la dona que usa los colores de estado.
```

### 8. Configuración del negocio y suscripción

```
Pantalla "Configuración" de Barber OS, mismo sistema de diseño. Menú secundario vertical a la izquierda del contenido con: General, Horario del negocio, Página de reservas, Notificaciones, Usuarios y permisos, Suscripción y facturación.

Muestra la sección "Suscripción y facturación":
- Tarjeta del plan actual: "Plan Profesional — $499 MXN / mes", próxima fecha de cobro, botones "Cambiar plan" y "Cancelar suscripción".
- Medidores de uso: barberos activos (4 de 10), citas este mes (312 de ilimitadas), recordatorios por WhatsApp (180 de 500).
- Método de pago con tarjeta enmascarada "Visa •••• 4242" y botón "Actualizar".
- Tabla "Historial de facturas": Fecha, Concepto, Monto, Estado (Pagada), botón para descargar PDF/XML (CFDI).
```

---

## Panel del barbero

Navegación lateral del barbero: **Mi agenda · Mis clientes · Mi perfil**.

### 9. Mi agenda del día

```
Pantalla "Mi agenda" del panel de barbero de Barber OS, mismo sistema de diseño (Inter, primario #2563EB, barra lateral simplificada con "Mi agenda" activo). Debe funcionar muy bien en tablet porque el barbero la usa en el local.

- Encabezado "Mi agenda" con selector de fecha (flechas + "Hoy, lun 12 oct").
- 3 tarjetas KPI: Citas restantes hoy, Completadas hoy, Ingresos generados hoy.
- Línea de tiempo vertical del día: cada cita es una tarjeta con hora de inicio y fin, nombre y teléfono del cliente, servicio, duración, insignia de estado y las notas del cliente destacadas en un recuadro gris ("Solo tijera a los lados").
- La cita en curso aparece resaltada con borde azul y la etiqueta "En curso".
- Acciones grandes y claras por tarjeta: "Aceptar" (si está pendiente), "Marcar como completada" y "No se presentó".
- Muestra abierto el modal "Completar cita" con un textarea "Notas del corte (visibles en el historial del cliente)", ejemplo "Desvanecido medio, navaja 1.5", y botones "Cancelar" / "Completar".
```

---

## Experiencia del cliente final (página pública de reservas del negocio)

Esta es la página que cada negocio comparte con sus clientes (ej. `barberos.app/peludos`). Lleva el logo y nombre del negocio, con un pie discreto "Reservas con Barber OS". Sin barra lateral: encabezado simple con logo del negocio, "Mis citas" y avatar o "Iniciar sesión".

### 10. Página pública del negocio

```
Página pública de reservas de la barbería "Peludos Barber Shop", dentro de Barber OS. Mismo sistema de diseño (Inter, fondo #F8FAFC, tarjetas blancas, primario #2563EB), estilo limpio tipo Calendly/Fresha, sin fotos de fondo ni degradados.

- Encabezado del negocio: logo, nombre, dirección, teléfono, horario de hoy ("Abierto · cierra a las 20:00") y botón primario "Reservar cita".
- Sección "Servicios": lista en tarjetas con nombre, descripción corta, duración y precio, y un botón "Reservar" en cada una.
- Sección "Nuestro equipo": tarjetas de barberos con foto o iniciales, nombre, especialidad (biografía corta) y botón "Reservar con él".
- Pie de página discreto: "Reservas con Barber OS".
Diseño responsivo; genera la versión de escritorio.
```

### 11. Flujo de reserva (paso a paso)

```
Flujo de reserva de cita para el cliente final en Barber OS, negocio "Peludos Barber Shop". Mismo sistema de diseño. Layout a dos columnas: a la izquierda el paso actual, a la derecha una tarjeta fija "Resumen de tu cita" (servicio, barbero, fecha, hora, duración y total) que se va llenando.

Indicador de progreso arriba con 4 pasos: 1 Servicio · 2 Barbero · 3 Fecha y hora · 4 Confirmar.

Muestra el paso 3 "Fecha y hora":
- Calendario mensual donde los días pasados y los días sin disponibilidad aparecen deshabilitados.
- Al elegir un día, cuadrícula de horarios disponibles agrupados en Mañana / Tarde / Noche como botones (09:00, 09:30, 10:00…); los ocupados no aparecen. El seleccionado queda en azul sólido.
- Texto de ayuda: "La cita dura 50 min y termina a las 11:20".
- Botones al pie: "Atrás" (secundario) y "Continuar" (primario).
```

```
Paso 4 "Confirmar" del mismo flujo de reserva: muestra el resumen completo de la cita, un campo opcional "Notas para tu barbero" con placeholder "Ej: Solo tijera a los lados, llego 5 minutos tarde", aviso de política de cancelación ("Puedes cancelar sin costo hasta 2 horas antes") y botón primario "Confirmar reserva". Incluye también la pantalla de éxito: icono de verificación, "Tu cita fue registrada y está pendiente de confirmación", botones "Agregar a Google Calendar" y "Ver mis citas".
```

### 12. Mis citas y detalle de cita

```
Pantalla "Mis citas" del cliente final en Barber OS. Mismo sistema de diseño, encabezado simple del negocio sin barra lateral.

- Pestañas: Próximas · Completadas · Canceladas.
- La próxima cita destacada arriba en una tarjeta grande: fecha y hora, servicio, barbero, precio, estado y botones "Reprogramar" y "Cancelar".
- Debajo, lista de las demás citas en filas compactas con fecha, servicio, barbero, precio y badge de estado; cada fila abre el detalle.
- Estado vacío para "Canceladas": icono, "No tienes citas canceladas" y botón "Reservar cita".
```

```
Pantalla "Detalle de cita" del cliente final: botón "← Mis citas", tarjeta con servicio, precio total, barbero (avatar), fecha, hora, duración y estado; recuadro con las notas que dejó el cliente y, si la cita está completada, las notas del barbero. Acciones: "Reprogramar" (abre un panel para elegir otro barbero, fecha y hora disponibles) y "Cancelar cita" (abre modal de confirmación con advertencia en rojo).
```

### 13. Perfil del cliente

```
Pantalla "Mi perfil" del cliente final en Barber OS, mismo sistema de diseño. Formulario en tarjetas apiladas con ancho máximo de 640px:
- "Información personal": avatar con iniciales, nombre completo, teléfono, correo (solo lectura) y fecha de nacimiento. Botón "Guardar cambios".
- "Seguridad": nueva contraseña y confirmar contraseña con indicador de fortaleza. Botón "Actualizar contraseña".
- "Preferencias": recordatorios por correo y por WhatsApp (interruptores).
- "Zona de peligro": botón destructivo "Eliminar mi cuenta".
```

---

## Acceso y alta del negocio (SaaS)

### 14. Iniciar sesión / Registro

```
Pantalla de inicio de sesión de Barber OS, mismo sistema de diseño. Layout dividido: a la izquierda (50%) el formulario centrado con ancho de 400px; a la derecha un panel azul muy oscuro #0F172A con una cita de un cliente y una captura estilizada del dashboard.

Formulario: logo, título "Inicia sesión en tu cuenta", botón "Continuar con Google", separador "o", campos Correo y Contraseña (con mostrar/ocultar), casilla "Recordarme", enlace "¿Olvidaste tu contraseña?", botón primario a todo el ancho "Iniciar sesión" y abajo "¿No tienes cuenta? Crea una gratis". Incluye un estado de error en el campo de contraseña.
```

### 15. Onboarding del negocio

```
Asistente de configuración inicial (onboarding) para un negocio nuevo en Barber OS, mismo sistema de diseño. Pantalla centrada de 640px con indicador de progreso de 4 pasos: 1 Tu negocio · 2 Horario · 3 Servicios · 4 Equipo.

Muestra el paso 1 "Tu negocio": nombre del negocio, tipo (Barbería / Estética / Spa), teléfono, dirección, subir logo (zona de arrastrar y soltar) y la URL de su página de reservas con vista previa "barberos.app/peludos" y validación de disponibilidad. Botón primario "Continuar" y enlace "Hacerlo más tarde".
```

### 16. Landing page del SaaS (opcional)

```
Landing page de marketing de Barber OS, software de gestión de citas para barberías. Mismo sistema de diseño, estilo SaaS serio tipo Stripe/Linear en tema claro.

Secciones: barra de navegación (Producto, Precios, Clientes, Iniciar sesión, botón "Prueba gratis"); hero con titular "El sistema operativo de tu barbería", subtítulo "Agenda, equipo, clientes e ingresos en un solo lugar", dos botones y captura del dashboard; fila de logos de negocios; 3 beneficios con iconos (Reservas en línea 24/7, Agenda por barbero, Reportes de ingresos); sección de funciones alternando texto y capturas; tabla de precios con 3 planes (Básico, Profesional destacado, Empresa) en MXN mensual; preguntas frecuentes en acordeón; pie de página con enlaces legales.
```

---

## Prompts de ajuste útiles (después de generar)

- `Aplica exactamente el mismo estilo, barra lateral y tipografía de la pantalla "Resumen" a esta pantalla.`
- `Reduce la densidad: más espacio en blanco entre secciones, sin cambiar los componentes.`
- `Genera la versión móvil de esta pantalla: la barra lateral se convierte en menú inferior con 4 iconos.`
- `Genera la versión en modo oscuro usando fondo #0B1120 y superficies #111827, conservando los mismos colores de estado.`
- `Muestra el estado vacío de esta pantalla` / `Muestra el estado de carga con skeletons`.
