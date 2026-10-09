# CLAUDE.md

Guía para trabajar en este repositorio. Para qué hace la app, rutas y cómo levantarla, ver `README.md`. Para decisiones del rediseño y fases, ver `docs/design/PLAN_REDISENO.md`.

## Proyecto

**Barber OS** es la plataforma de reservaciones; **Peludos Barber Shop** es el único negocio que la usa (proyecto escolar, aún sin producción real). React 18 + Vite + Tailwind 3 + Supabase (auth y base de datos), con React Router 6, date-fns, Recharts, jsPDF y lucide-react. JavaScript, no TypeScript.

## Comandos

```bash
npm run dev      # http://localhost:5173
npm run build    # verificación principal: debe compilar sin errores
npm run preview
```

No hay tests, linter ni formateador configurados. Para comprobar un cambio: `npm run build` y revisar la pantalla en el navegador.

## Forma de trabajar

- Todo en **español**: textos de la interfaz, comentarios, mensajes de commit y respuestas al usuario.
- Trabajo por pasos: **un commit por paso** y `git push` al terminarlo. Resumir qué se hizo, qué se verificó y qué debe revisar el usuario.
- `master` es lo que publica Vercel. Se trabaja en ramas (`saas-redesign`, `diseno-presencia`, …) y se une a `master` con merge solo cuando el usuario lo pide.
- No hacer acciones que cambien datos reales de Supabase (crear/cancelar citas, guardar) sin permiso.

## Arquitectura

- `src/App.jsx`: todas las rutas; páginas con `lazy()`. Tres zonas:
  - `/app/*` panel de admin y barbero (`AppLayout`), protegido con `RequireAuth roles={[...]}`.
  - `/:slug/*` portal público del negocio (`PortalLayout`); `/` redirige a `/peludos`.
  - `/login`, `/registro`, … (`AuthLayout`); `/barber-os` (landing) y `/onboarding` (solo frontend, borrador en el navegador).
- `src/hooks/useBusiness.js`: el negocio está **fijo en código** (Peludos) hasta la Fase 5 (tabla `businesses`, varios negocios). No asumir que existe esa tabla.
- `src/lib/`: consultas a Supabase y lógica pura. `availability.js` calcula horarios libres (turno del barbero, duración, sin encimarse, nunca en el pasado); `roles.js` decide la página de inicio por rol y valida `?volver=`.
- `src/hooks/use*Data.js`: carga de datos por pantalla.
- Detalles (cita, cliente) se abren en drawer con parámetro en la URL (`?cita=<id>`); el paso de la reserva va en `?paso=N`.

## Supabase

- En el navegador solo la clave **anon** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Nunca la `service_role` en código ni en `.env` del frontend.
- Los cambios de base de datos son archivos en `supabase/migrations/` que el usuario ejecuta a mano en el SQL Editor. El código debe seguir funcionando si aún no se aplicaron (ver el respaldo de `fetchPublicBarbers` en `lib/publicData.js`).

## Estilos

- Tokens en `tailwind.config.js` con los nombres de Google Stitch (`bg-surface-container-low`, `text-body-sm`, `text-on-surface-variant`, espaciados `space-*`, `gutter`, `margin`). Usar estos, no colores de Tailwind sueltos.
- **Dos estilos**:
  - Panel `/app`: sobrio, azul `primary` (#2563EB), Inter.
  - Landing y portal público: "barbería premium": `ink` (carbón), `gold` (dorado), `cream`, títulos `font-display` (Playfair Display), botones `variant="gold"` / `"outline-light"`, `<Logo tone="premium" />`. No llevar este estilo al panel.
- Componentes base en `src/components/ui` (importar desde `../components/ui`). Movimiento en `src/components/motion` (`Reveal`, `Tilt`, `CountUp`, `Marquee`, `ScrollProgress`, `trackPointer` + clase `.spotlight`) y keyframes/clases en `src/index.css`; respetan `prefers-reduced-motion`.
- `cn()` (`src/lib/cn.js`) es solo `clsx`, **sin tailwind-merge**: pasar `className="bg-..."` a un componente que ya tiene otro `bg-*` no lo reemplaza de forma fiable. Usar un `div` propio o una variante.
- Iconos: lucide-react, 18 px, `strokeWidth={1.75}` (ver `docs/design/ICONOS.md`).
- Las vistas ilustrativas del landing usan datos de ejemplo marcados como tales; el landing solo describe funciones que la app ya tiene.

## Skills del proyecto

En `.claude/skills/` hay skills de diseño y animación (`impeccable`, `design-taste-frontend`, `animate`, `review-animations`, …). Úsalas para auditar o pulir la interfaz respetando las convenciones de arriba.
