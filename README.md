# Peludos Barber Shop · Barber OS

Sistema web de reservaciones para barberías. **Barber OS** es la plataforma; **Peludos Barber Shop** es el primer negocio que la usa.

- **Clientes:** página pública del negocio, reserva en 4 pasos, Mis citas y perfil.
- **Administrador:** Resumen, Agenda, Citas, Clientes, Equipo, Servicios, Reportes y Configuración.
- **Barberos:** Mi agenda del día con sus citas y notas.

Hecho con React 18, Vite, Tailwind CSS, Supabase (base de datos y autenticación), Recharts, jsPDF y lucide-react.

## Cómo correrlo

```bash
npm install
cp .env.example .env   # y llena la URL y la clave "anon" de tu proyecto de Supabase
npm run dev            # http://localhost:5173
npm run build          # versión de producción en dist/
```

> En `.env` va **solo** la clave `anon`. La clave `service_role` nunca debe estar en el código ni en el navegador.

## Rutas principales

| Ruta | Quién | Qué es |
|---|---|---|
| `/peludos` | Público | Página del negocio |
| `/peludos/reservar` | Público (confirmar pide sesión) | Reserva: servicio → barbero → fecha y hora → confirmar |
| `/peludos/mis-citas`, `/peludos/perfil` | Cliente | Citas, detalle de cada cita y datos de la cuenta |
| `/login`, `/registro`, `/recuperar` | Público | Acceso y recuperación de contraseña |
| `/app/resumen` … `/app/configuracion` | Administrador | Panel del negocio |
| `/app/mi-agenda` | Barbero | Agenda del barbero |

Las direcciones de la versión anterior (`/admin`, `/book`, `/my-appointments`, etc.) redirigen a las nuevas.

## Estructura

```
src/
  layouts/          AppLayout (panel), PortalLayout (negocio), AuthLayout (acceso)
  pages/app/        pantallas del panel
  pages/portal/     pantallas del cliente
  pages/auth/       login, registro y contraseña
  components/ui/    componentes base (Button, Input, Table, Drawer, Modal, Toast…)
  components/app/   piezas del panel por pantalla
  lib/              consultas a Supabase, cálculos (horarios libres, reportes) y formato
  hooks/            carga de datos por pantalla
supabase/migrations/  cambios de base de datos para aplicar en Supabase
design/stitch/        diseños de referencia (Google Stitch)
docs/design/          plan del rediseño, prompts e iconos
```

## Configuración pendiente en Supabase

1. **Vista pública de barberos:** ejecutar `supabase/migrations/20261007_public_barbers_view.sql` en el SQL Editor para que los visitantes vean los nombres de los barberos.
2. **Redirect URLs** (Authentication → URL Configuration): agregar `http://localhost:5173/**`, `http://127.0.0.1:5173/**` y la URL de producción con `/**`, para que funcionen los correos de confirmación y de recuperar contraseña.

Más detalle en [`docs/design/PLAN_REDISENO.md`](docs/design/PLAN_REDISENO.md).
