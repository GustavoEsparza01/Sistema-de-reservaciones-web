# Prompts para las skills de diseño

Skills instaladas en `.claude/skills/`. Cópialas en Claude Code en este orden.
Regla de oro: **una skill y una pantalla a la vez, y commit antes de cada fase.**

**Enfoque actual: solo frontend.** Si una skill quiere tocar `src/lib/`, `src/hooks/`, `supabase/` o `.env`, dile que no y que lo anote como pendiente de backend.

| Skill | Para qué |
|---|---|
| `/impeccable <comando>` | Crítica, auditoría, robustez, móvil, textos, pulido |
| `/design-taste-frontend` | Criterio visual, que no se vea "hecho por IA" |
| `/emil-design-eng` | Detalles finos de UI (filosofía de Emil Kowalski) |
| `/review-animations` · `/improve-animations` · `/find-animation-opportunities` · `/animate` | Movimiento |
| `/break-ui` | Probar la UI con datos extremos |
| `/mobile-native` | Que la web se sienta como app en el celular |

---

## Fase 0: Contexto (una sola vez)

```
/impeccable init
Contexto: Peludos Barber Shop sobre la plataforma Barber OS. Hay dos superficies:
1) Portal público (/peludos/*): estilo premium carbón (ink) + dorado (gold), títulos Playfair Display. Modo Persuade/Operate: el cliente debe reservar rápido desde el celular.
2) Panel (/app/*): azul/slate, sobrio. Modo Operate.
Respeta tailwind.config.js y design/stitch/DESIGN.md; no cambies paleta ni fuentes.
```

---

## Fase 1: Diagnóstico de la reserva (solo lectura)

```
/impeccable critique src/pages/portal/Reservar.jsx
Es el flujo de reserva en 4 pasos (servicio → barbero → fecha y hora → confirmar).
Dame la evaluación con puntuación y una lista priorizada de problemas. No edites código todavía.
```

```
/design-taste-frontend
Audita src/pages/portal/Reservar.jsx y src/pages/portal/Negocio.jsx dentro de mi sistema actual (ink/gold, Playfair + Inter).
¿Qué se ve genérico o "plantilla de IA"? Es un refinamiento, NO un rediseño.
Solo lista de hallazgos con prioridad; no escribas código.
```

```
/review-animations
Revisa las animaciones del flujo de reserva: src/pages/portal/Reservar.jsx, src/components/motion/index.jsx y las clases animate-enter / reveal / text-shimmer-gold en src/index.css.
Señala duraciones, curvas y efectos que sobran en un formulario.
```

> Lee los tres reportes y decide qué aplicar. Haz commit antes de seguir.

---

## Fase 2: Robustez (lo más importante en reservaciones)

```
/impeccable harden src/pages/portal/Reservar.jsx
Solo frontend: no modifiques src/lib/, supabase/ ni las consultas; trabaja con los datos y errores que ya llegan a la página.
Diseña estados claros y en español para:
- Día sin horarios disponibles y barbero sin agenda configurada
- Error al cargar o al confirmar (mensaje amable + botón de reintentar)
- Usuario sin sesión al llegar al paso 4
- Conexión lenta: skeletons en lugar de pantallas vacías
- Botón "Confirmar" deshabilitado con spinner mientras se envía (evita doble clic)
```

```
/break-ui
Estresa el flujo de reserva con nombres de servicios y barberos muy largos, precios grandes, 0 y 40 horarios, emojis y nombres de una letra.
Usa datos de demostración solo en el componente (sin tocar Supabase). Repórtame qué se rompe y corrígelo.
```

---

## Fase 3: Móvil

```
/impeccable adapt src/pages/portal/Reservar.jsx
La mayoría reserva desde el celular (360–430 px). Revisa el carrusel de días, la cuadrícula de horarios,
el resumen lateral y que "Continuar" quede al alcance del pulgar (barra fija abajo si conviene).
```

```
/mobile-native
Aplica las correcciones de sensación nativa al portal público (src/layouts/PortalLayout.jsx y src/pages/portal/*):
tap highlight, hover pegajoso, inputs que hacen zoom, 100vh, safe areas y scroll horizontal del carrusel de días.
```

---

## Fase 4: Movimiento

```
/emil-design-eng
Aplica tu criterio al flujo de reserva (src/pages/portal/Reservar.jsx). Prioridades:
1. Transición con dirección entre pasos: avanzar entra desde la derecha, "Atrás" desde la izquierda.
2. Feedback inmediato al elegir servicio, barbero, día y horario (press scale, sin esperar transiciones).
3. Barra del Stepper: hoy usa duration-700, que es lento para algo que el usuario provoca.
4. Quitar Tilt/spotlight/shimmer donde estorben dentro del formulario.
Usa CSS y src/components/motion; no agregues Framer Motion. Respeta prefers-reduced-motion.
```

```
/animate
Crea la animación de confirmación de cita en el paso final de Reservar.jsx: check dorado que se dibuja,
resumen que aparece escalonado y aviso con src/components/ui/Toast.jsx. Debe sentirse premium pero durar menos de 600 ms en total.
```

```
/find-animation-opportunities
Busca en src/pages/portal/MisCitas.jsx, DetalleCita.jsx y Perfil.jsx lugares donde el movimiento ayudaría.
Solo propuestas con valores exactos; no implementes.
```

---

## Fase 5: Textos, accesibilidad y pulido final

```
/impeccable clarify src/pages/portal/Reservar.jsx
Mejora los textos de botones, ayudas, errores y la confirmación. Tono: cercano, de barbería, en español de México. Sin tecnicismos.
```

```
/impeccable audit src/pages/portal
Accesibilidad (contraste del dorado sobre crema y blanco, foco con teclado, aria del Stepper y los horarios), rendimiento y responsive.
```

```
/impeccable polish src/pages/portal/Reservar.jsx
Pasada final: espaciado, alineación, consistencia con el resto del portal. Verifica en escritorio y móvil.
```

---

## Fase 6: Verificar

```
Levanta npm run dev y haz una reserva completa en vista móvil y escritorio en el navegador integrado.
Muéstrame capturas de cada paso y de los estados de error.
```

---

## Prompts para otras pantallas

**Página del negocio (vende la reserva):**
```
/impeccable critique src/pages/portal/Negocio.jsx
Es la página pública del negocio; su objetivo es que el visitante pulse "Reservar". Evalúa la jerarquía y el llamado a la acción.
```

**Mis citas (cliente):**
```
/impeccable harden src/pages/portal/MisCitas.jsx
Estados: sin citas (que invite a reservar), citas pasadas vs próximas, cancelar y reprogramar con confirmación.
```

**Panel del administrador (claridad antes que estilo):**
```
/impeccable audit src/pages/app/Agenda.jsx
Es una herramienta de trabajo diario (modo Operate). Prioriza legibilidad, escaneo rápido y accesibilidad; nada de efectos decorativos.
```

```
/impeccable distill src/pages/app/Resumen.jsx
Reduce el ruido del dashboard: que el dueño vea en 5 segundos citas de hoy, ingresos y pendientes.
```

**Landing de Barber OS:**
```
/design-taste-frontend
Revisa src/pages/Landing.jsx. Es la landing de la plataforma (modo Persuade). ¿Qué la hace sentir plantilla? Propón mejoras dentro de ink/gold.
```

---

## Trucos

- Si un resultado no te gusta: `git restore .` y repite el prompt con más restricciones.
- Para tonos: `/impeccable quieter` (demasiado llamativo) o `/impeccable bolder` (demasiado soso).
- `/impeccable` sin argumentos te muestra un menú según tu proyecto.
- Siempre que puedas, pide "lista primero, código después".
