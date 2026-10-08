# Plan del rediseño — Barber OS

Documento de cierre de la Fase 0. Define cómo se organizan las rutas, las estructuras de página (layouts) y los cambios de base de datos antes de construir las pantallas nuevas.

Referencias:

- Pantallas de Stitch: `design/stitch/<NN>-<nombre>/` (ver `design/stitch/README.md`)
- Sistema de diseño en código: `tailwind.config.js`
- Iconos: `docs/design/ICONOS.md`

## 1. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Paleta | Primario `#2563EB` (hover `#1D4ED8`), fondo `#F8FAFC`, grises slate. Se descartó la paleta de Stitch (`#004ac6` / `#faf8ff`). |
| Estilos | Tailwind. Los nombres de color, tipografía, radios y espaciados son los de Stitch (`bg-surface-container-low`, `text-body-sm`, …) con los valores de la paleta elegida, para copiar sus clases tal cual. |
| Iconos | `lucide-react`, tamaño 18 px y trazo 1.75. Equivalencias en `ICONOS.md`. |
| Tipografía | Inter (Google Fonts, cargada en `index.html`). |
| Producto | "Barber OS" es la plataforma; "Peludos Barber Shop" es un negocio dentro de ella. |
| Varios negocios | Las rutas se diseñan desde ya con `/:slug`, pero la base de datos se cambia hasta la Fase 5 (ver sección 6). |

## 2. Mapa de rutas

### Panel (`/app/*`) — admin y barbero

| Ruta | Pantalla Stitch | Rol | Reemplaza a |
|---|---|---|---|
| `/app` | — | — | Redirige a `/app/resumen` (admin) o `/app/mi-agenda` (barbero) |
| `/app/resumen` | 01-resumen | admin | `/admin` (sin pestaña equivalente; es nueva) |
| `/app/agenda` | 02-agenda | admin | `components/admin/WeeklyCalendar.jsx` |
| `/app/citas` | 03-citas | admin | `pages/admin/ManageAppointments.jsx` |
| `/app/clientes` | 04-clientes | admin | `pages/admin/ManageClients.jsx` |
| `/app/equipo` | 05-equipo | admin | `pages/admin/ManageBarbers.jsx` |
| `/app/servicios` | 06-servicios | admin | `pages/admin/ManageServices.jsx` |
| `/app/reportes` | 07-reportes | admin | `pages/admin/Reports.jsx` |
| `/app/configuracion` | 08-configuracion | admin | — (nueva) |
| `/app/mi-agenda` | 09-mi-agenda-barbero | barbero (y admin que también es barbero) | `pages/barber/BarberAgenda.jsx` (`/barber-agenda`) |

Los detalles (cita, cliente, barbero) se abren en un panel lateral (drawer) dentro de la misma página, no en otra ruta. El drawer abierto se refleja en la URL con un parámetro (`?cita=<id>`) para poder compartir el enlace y que funcione el botón atrás.

### Portal del negocio (`/:slug/*`) — clientes

| Ruta | Pantalla Stitch | Acceso | Reemplaza a |
|---|---|---|---|
| `/:slug` | 10-pagina-publica | público | `pages/Home.jsx` y `pages/Services.jsx` |
| `/:slug/reservar` | 11-reserva (pasos 1–4) | público hasta el paso 4; pide sesión para confirmar | `pages/BookAppointment.jsx` (`/book`) |
| `/:slug/mis-citas` | 12-mis-citas (`screen`) | cliente | `pages/MyAppointments.jsx` |
| `/:slug/mis-citas/:id` | 12-mis-citas (`screen-detalle`) | cliente | `pages/AppointmentDetails.jsx` |
| `/:slug/perfil` | 13-perfil | cliente | `pages/Profile.jsx` |

El paso actual de la reserva va en la URL (`?paso=3`) para que recargar la página no lo pierda; lo elegido (servicio, barbero, horario) se guarda en `sessionStorage` hasta confirmar.

### Rutas globales

| Ruta | Pantalla Stitch | Reemplaza a |
|---|---|---|
| `/` | 16-landing | Mientras no exista (Fase 5), redirige a `/peludos` |
| `/login` | 14-login | `pages/Login.jsx` |
| `/registro` | 14-login (variante registro) | `pages/Register.jsx` / `components/auth/RegisterForm.jsx` |
| `/onboarding` | 15-onboarding | — (nueva, Fase 5) |

Después de iniciar sesión se redirige según el rol: admin → `/app/resumen`, barbero → `/app/mi-agenda`, cliente → a la página de donde venía o a `/:slug/mis-citas`.

### Slugs reservados

Como `/:slug` captura cualquier primer segmento, estas palabras no pueden ser el slug de un negocio: `app`, `login`, `registro`, `onboarding`, `api`, `admin`, `precios`, `ayuda`, `terminos`, `privacidad`. Las rutas fijas se declaran antes que `/:slug` en el router.

### Redirecciones de las rutas actuales

Para no romper enlaces guardados, las rutas viejas redirigen a las nuevas hasta terminar la Fase 4:

| Ruta actual | Nueva |
|---|---|
| `/admin` | `/app/resumen` |
| `/barber-agenda` | `/app/mi-agenda` |
| `/services` | `/peludos` |
| `/book` | `/peludos/reservar` |
| `/my-appointments` | `/peludos/mis-citas` |
| `/my-appointments/:id` | `/peludos/mis-citas/:id` |
| `/profile` | `/peludos/perfil` |

## 3. Estructuras de página (layouts)

### `AppLayout` — panel

- Barra lateral fija de 240 px: logo, selector de negocio, navegación según rol, Configuración y tarjeta del usuario abajo.
- Barra superior de 64 px: breadcrumb, buscador (Ctrl+K), notificaciones y botón principal de la página (cada página lo define).
- Contenido con ancho máximo de 1280 px y padding de 32 px (16 px en móvil).
- En móvil la barra lateral se convierte en un menú que se abre con un botón.

Navegación por rol:

| Admin | Barbero |
|---|---|
| Resumen, Agenda, Citas, Clientes, Equipo, Servicios, Reportes · Configuración | Mi agenda |

Un admin que también es barbero ve además "Mi agenda".

### `PortalLayout` — portal del cliente

- Encabezado con logo, nombre y dirección del negocio; enlaces Servicios, Barberos, Mis reservas; botón "Agendar cita" y acceso al perfil.
- Pie con horario y ubicación.
- Carga los datos del negocio a partir del `:slug` y los comparte con las páginas hijas (`useBusiness()`).

### `AuthLayout` — login, registro y onboarding

Pantalla dividida (formulario + panel oscuro) en login/registro; columna centrada de 640 px en onboarding.

### Protección de rutas

Los componentes actuales (`ProtectedRoute`, `AdminRoute`, `BarberRoute`) se sustituyen por uno solo:

```jsx
<RequireAuth roles={['admin']} />      // panel del dueño
<RequireAuth roles={['barber']} />     // mi agenda (admin también pasa si es barbero)
<RequireAuth />                        // cualquier usuario con sesión
```

Sin sesión → `/login?volver=<ruta>`. Con sesión pero sin permiso → la página de inicio de su rol.

## 4. Estructura de carpetas

```
src/
  layouts/            AppLayout, PortalLayout, AuthLayout
  components/
    ui/               Button, Input, Select, Badge, StatusBadge, Card, KpiCard, Table,
                      Tabs, Drawer, Modal, EmptyState, Skeleton, Toast, Avatar
    app/              piezas del panel (Sidebar, Topbar, …)
    portal/           piezas del portal (BusinessHeader, BookingSummary, …)
  pages/
    app/              Resumen, Agenda, Citas, Clientes, Equipo, Servicios, Reportes,
                      Configuracion, MiAgenda
    portal/           Negocio, Reservar, MisCitas, DetalleCita, Perfil
    auth/             Login, Registro, Onboarding
    Landing.jsx
  hooks/              useResumenData, useBusiness (los hooks viejos estaban vacíos)
  context/            AuthContext (+ BusinessContext en Fase 4/5)
  lib/ utils/         sin cambios
```

Las páginas y componentes viejos se borran cuando su reemplazo esté terminado, no antes.

### Qué se reutiliza

| Archivo actual | Uso en el rediseño |
|---|---|
| `lib/supabaseClient.js` | Igual |
| `context/AuthContext.jsx` | Igual; se le agrega la redirección por rol |
| `hooks/useAppointments.js`, `useBarbers.js`, `useServices.js`, `useAuth.js` | Estaban vacíos (0 bytes). Las consultas nuevas viven en `lib/appointments.js` y en un hook por pantalla; los archivos vacíos se borran en el cierre |
| `utils/overlapCheck.js`, `utils/dateHelpers.js` | Igual (validación de horarios y formato de fechas) |
| Lógica de `BookAppointment.jsx` | Cálculo de horarios libres, inserción en `appointments` y `appointment_services` |
| `components/admin/ReportChart.jsx` (recharts) y exportación PDF (jspdf) | Se reutiliza la lógica; se rehace la parte visual |
| `components/ui/*`, `Navbar.jsx`, estilos en línea | Se reemplazan |

## 5. Convenciones de interfaz

Estados de cita (valor en base de datos → etiqueta e insignia):

| `status` | Etiqueta | Insignia |
|---|---|---|
| `pending` | Pendiente | `bg-amber-50 text-amber-700` |
| `accepted` | Confirmada | `bg-primary-fixed text-on-primary-fixed-variant` |
| `completed` | Completada | `bg-emerald-50 text-emerald-700` |
| `cancelled` | Cancelada | `bg-surface-container-low text-error` |

Formato: español de México, moneda `$1,250 MXN`, fecha `lun 12 oct 2026`, hora en 24 h, zona horaria `America/Mexico_City` (con `date-fns` y su locale `es`).

Retroalimentación: toasts para confirmar acciones y modales propios para confirmar acciones destructivas. Nunca `alert()` ni `confirm()` del navegador.

## 6. Base de datos para varios negocios (se aplica en la Fase 5)

### Estado actual

Una sola barbería implícita. Tablas: `profiles` (con `role` global: `client`, `barber`, `admin`), `barbers` (con `schedule` JSONB), `services`, `appointments` y `appointment_services`.

### Cambios propuestos

1. **Tabla `businesses`**

   | Columna | Tipo | Notas |
   |---|---|---|
   | `id` | uuid PK | |
   | `slug` | text único | minúsculas, números y guiones; no puede ser un slug reservado |
   | `name` | text | |
   | `type` | text | `barberia`, `estetica`, `spa` |
   | `phone`, `address` | text | |
   | `logo_url` | text | archivo en Supabase Storage |
   | `schedule` | jsonb | horario del negocio (paso 2 del onboarding) |
   | `timezone` | text | por defecto `America/Mexico_City` |
   | `plan` | text | `basico`, `profesional`, `empresa` |
   | `created_at` | timestamptz | |

2. **Tabla `business_members`** — quién trabaja en cada negocio y con qué rol.

   | Columna | Tipo | Notas |
   |---|---|---|
   | `business_id` | uuid FK → `businesses` | |
   | `profile_id` | uuid FK → `profiles` | |
   | `role` | text | `owner`, `admin`, `barber` |
   | PK | (`business_id`, `profile_id`) | |

   Sustituye a `profiles.role` para el personal. Los clientes no necesitan registro aquí: un cliente es cualquier usuario con citas en ese negocio, y puede reservar en varios negocios con la misma cuenta.

3. **`business_id` en `barbers`, `services` y `appointments`** (uuid, FK, `NOT NULL`, con índice). `appointment_services` lo hereda a través de la cita.

4. **Políticas RLS**
   - Lectura pública de `businesses`, `services` y `barbers` activos (para la página pública y la reserva).
   - El personal solo lee y modifica filas de los negocios donde es miembro.
   - Un cliente solo ve sus propias citas (`client_id = auth.uid()`).
   - **Hallazgo de la Fase 1:** hoy la tabla `appointments` se puede leer sin sesión (fechas, estados y notas; los nombres y teléfonos no, porque `profiles` sí está protegida). La reserva necesita saber qué horarios están ocupados, así que exponerlo con una vista o función que solo devuelva `barber_id`, `scheduled_at` y `ends_at`, y cerrar la lectura directa.

### Migración de los datos actuales

1. Crear `businesses` y `business_members`.
2. Insertar "Peludos Barber Shop" con slug `peludos`.
3. Agregar `business_id` (nullable) a `barbers`, `services` y `appointments`; llenarlo con el id de Peludos; después cambiarlo a `NOT NULL`.
4. Registrar en `business_members` a los perfiles con `role = 'admin'` como `owner` y a los barberos activos como `barber`.
5. Actualizar las políticas RLS y probarlas con un usuario de cada rol.
6. Dejar `profiles.role` mientras el código lo use; retirarlo al final.

Se hace en un script SQL versionado (`supabase/migrations/`) y se prueba primero en un proyecto de Supabase de prueba.

### Mientras tanto (Fases 1–4)

Las rutas ya usan `/:slug`, pero `useBusiness()` devuelve siempre a Peludos (slug `peludos`) y las consultas no filtran por negocio. En la Fase 5 solo cambia ese hook y se agrega el filtro `business_id` a las consultas.

### Datos que piden las pantallas y hoy no existen

Se revisan al construir cada pantalla; mientras no existan, se muestran ocultos o con un estado vacío, nunca con datos inventados:

- Suscripción y facturación (08-configuracion).
- Bloqueo de horas sueltas del barbero (`blocked_slots`, pendiente desde el Sprint 4).
- Confirmaciones y recordatorios por WhatsApp.
- Calificaciones de barberos (estrellas en 10-pagina-publica y 12-mis-citas).
- Logo y fotos del negocio (Supabase Storage).

## 7. Fases

| Fase | Contenido | Terminada cuando… |
|---|---|---|
| **0. Preparación** ✅ | Limpieza, pantallas de Stitch, Tailwind, iconos y este plan | Este documento está en `saas-redesign` |
| **1. Base** ✅ | Componentes `ui/`, `AppLayout`, `RequireAuth`, router nuevo con redirecciones y la pantalla Resumen (01) | `/app/resumen` funciona con datos reales y el resto de la app sigue funcionando |
| **2. Panel admin** ✅ | Pantallas 02–08 | El admin ya no necesita `/admin` |
| **3. Barbero** ✅ | Pantalla 09 | `/barber-agenda` solo redirige |
| **4. Cliente** ✅ | `PortalLayout` y pantallas 10–13 | Se puede reservar de principio a fin en `/peludos` |
| **5. SaaS** (en curso: login y registro ✅) | Migración de la sección 6, login/registro (14), onboarding (15) y landing (16) | Se puede dar de alta un segundo negocio y sus datos no se mezclan con los de Peludos |
| **Cierre** ✅ | Borrar páginas, componentes y redirecciones viejas | No queda código del diseño anterior |

## 8. Estado al cierre (7 oct 2026)

**Hecho:** las 16 pantallas de Stitch salvo alta del negocio (15) y landing (16), que dependen de varios negocios. Ya no queda código del diseño anterior; las direcciones viejas se conservan solo como redirecciones porque los clientes pueden tenerlas guardadas.

**Cambios respecto al plan original:**
- Los hooks viejos estaban vacíos; las consultas viven en `lib/` (appointments, clients, team, services, publicData) y un hook por pantalla.
- La pantalla Clientes (04) se hizo en el cierre: faltaba y solo existía en el panel anterior.
- Cada pantalla se carga solo al visitarla (`React.lazy`); el archivo inicial bajó de 1.26 MB a 421 KB.
- La nota del barbero se agrega a `appointments.notes` sin borrar la del cliente (no hay columna aparte).
- El rol `banned` ahora impide reservar en línea (antes no se revisaba).

**Hallazgos de seguridad:**
- `.env.example` tenía la clave `service_role` en el repositorio público desde el primer commit. Se quitó del archivo, pero **hay que regenerar las claves en Supabase** porque siguen en el historial de git.
- `appointments` se puede leer sin sesión (ver sección 6).

**Pendiente para la Fase 5:** tabla `businesses` y `business_members`, `business_id` en las tablas, RLS, alta del negocio (15) y landing (16). Opcional: columnas `is_public` y `sort_order` en `services`, tabla `barber_services`, `blocked_slots`, estado "no se presentó" y propinas.
