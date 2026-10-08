---
name: Barber OS Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-page:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-page-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-section:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-default:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-semibold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  table-header:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  badge-label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  numeric-metric:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

Este sistema de diseño está concebido para un entorno B2B SaaS de alto rendimiento operativo, orientado a la gestión integral de barberías y estudios de cuidado personal masculino. La identidad combina la precisión utilitaria de Linear, la neutralidad financiera de Stripe Dashboard y la claridad programática de Calendly.

### Personalidad y Tono
- **Riguroso y confiable:** Elimina cualquier artificio visual, degradados cromáticos o recursos efectistas. La interfaz debe comunicar estabilidad, exactitud contable y control absoluto sobre la agenda y el negocio.
- **Sobrio y funcional:** Cada elemento en pantalla responde estrictamente a una necesidad operativa (agendar, cobrar, auditar, reasignar). 
- **Lenguaje:** Español de México formal, directo y profesional, adaptado al contexto operativo local con soporte estandarizado para moneda nacional (MXN, formato `$0,000.00`). Cero uso de emojis o iconografía decorativa informal.

### Dirección Estética
- **Minimalismo Estructurado:** Fondos planos neutros, superficies blancas de alto contraste y delimitación precisa mediante bordes continuos de 1px.
- **Jerarquía Tipográfica Neutra:** Construida exclusivamente en sans-serif de trazo técnico y sistemático.

## Colors

La paleta se rige por un esquema cromático neutro frío de alta legibilidad, complementado por un azul técnico de acento y una gama de estados semánticos de bajo contraste visual pero alta claridad funcional.

### Superficies y Fondo
- **Lienzo base (Canvas):** `#F8FAFC` (Slate 50). Proporciona una base uniforme y fría que reduce la fatiga visual.
- **Superficies operativas (Cards, Modals, Tables):** `#FFFFFF` (Pure White). Aislamiento nítido de contenido.
- **Divisores y Bordes estructurales:** `#E2E8F0` (Slate 200), aplicados consistentemente en 1px.

### Tipografía y Contraste
- **Texto Principal:** `#0F172A` (Slate 900) para encabezados, valores métricos y celdas activas.
- **Texto Secundario:** `#475569` (Slate 600) para metadatos, descripciones, subtítulos y etiquetas de formulario.
- **Texto Terciario / Muted:** `#94A3B8` (Slate 400) para placeholders, estados deshabilitados y texto accesorio.

### Acento Interactivo
- **Primary:** `#2563EB` (Blue 600) para acciones principales, estados seleccionados y foco interactivo.
- **Primary Hover / Active:** `#1D4ED8` (Blue 700) para retroalimentación al interactuar.
- **Primary Focus Ring:** `rgba(37, 99, 235, 0.15)` con borde exterior de 2px.

### Estados de Citas y Badges Semánticos
Cada estado utiliza fondos tintados suaves con borde a juego y texto oscuro para garantizar legibilidad estricta:
- **Pendiente:** Fondo `#FFFBEB` (Amber 50), Borde `#FDE68A` (Amber 200), Texto `#B45309` (Amber 700).
- **Confirmada:** Fondo `#EFF6FF` (Blue 50), Borde `#BFDBFE` (Blue 200), Texto `#1D4ED8` (Blue 700).
- **Completada:** Fondo `#ECFDF5` (Emerald 50), Borde `#A7F3D0` (Emerald 200), Texto `#047857` (Emerald 700).
- **Cancelada:** Fondo `#F1F5F9` (Slate 100), Borde `#FECDD3` (Rose 200), Texto `#E11D48` (Rose 600).

## Typography

El sistema utiliza exclusivamente **Inter**, aprovechando sus características OpenType para interfaces densas en datos: `cv02`, `cv03`, `cv04` y números tabulares (`tnum`) para alineación contable exacta de importes y horas.

### Normas de Aplicación
- **Encabezados de Página:** Limitados estrictamente a 24px (`headline-page`) en desktop y 20px en móvil, en peso Semibold (600). Proporciona autoridad sin ocupar espacio innecesario del flujo de trabajo.
- **Títulos de Sección:** 16px Semibold para divisiones internas de vistas, paneles y encabezados de tarjetas maestras.
- **Texto Base:** 14px como núcleo para listas, celdas de tabla, valores de formulario y descripciones.
- **Encabezados de Columnas (`table-header`):** 12px Semibold, transformado en mayúsculas forzadas (`text-transform: uppercase`) y tracking ampliado (`letter-spacing: 0.05em`) para dotar de ritmo a tablas densas.
- **Datos Numéricos y Financieros:** Todas las columnas de precios en MXN y horas de citas deben utilizar la clase de variante `tnum` (tabular numbers) para mantener una alineación vertical perfecta.

## Layout & Spacing

El ritmo visual se basa en una cuadrícula fija de múltiplos de 8px (con pasos complementarios de 4px para micro-alineaciones en componentes).

### Arquitectura de Layout
- **Marco de Aplicación:** Barra lateral de navegación fija (ancho: 240px colapsable a 64px) con área de trabajo principal fluida.
- **Padding del Canvas:** `32px` (`margin: 2rem`) de espaciado periférico continuo en desktop para vistas de panel y gestión, reduciéndose a `16px` en interfaces móviles.
- **Estructura de Contenedores:** Las secciones de contenido tienen un ancho máximo útil de 1440px en pantallas extendidas para evitar el estiramiento horizontal excesivo de formularios y tablas.
- **Tablas Operativas:** Altura de fila estandarizada en exactamente `52px` para garantizar un balance óptimo entre densidad de información y área táctil/clicable de selección de cita.

## Elevation & Depth

La separación de planos y la jerarquía se resuelven primordialmente mediante bordes (`#E2E8F0`) y alternancia de superficies (`#F8FAFC` vs `#FFFFFF`), manteniendo las sombras reducidas al mínimo indispensable.

### Niveles de Elevación
- **Nivel 0 (Base plana):** Tarjetas estáticas, paneles y tablas. Sin sombra (`box-shadow: none`). La delimitación depende exclusivamente del borde perimetral de `1px solid #E2E8F0`.
- **Nivel 1 (Tarjetas interactivas y hover):** `box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.05)`. Se aplica únicamente al elevar tarjetas de citas arrastrables o interactivas.
- **Nivel 2 (Superposiciones y Menús contextuales):** Dropdowns de barberos, selectores de fecha y menús de acciones: `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Nivel 3 (Modales de cita y Diálogos de cobro):** Modales centrados sobre fondo de bloqueo (`rgba(15, 23, 42, 0.4)`): `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

La geometría general mantiene una moderación corporativa con un radio de esquina unificado de 8px (`rounded-lg`), transmitiendo modernidad técnica sin caer en la informalidad de interfaces redondeadas o amigables para el consumidor masivo.

### Reglas de Radio de Borde
- **Contenedores Principales (Tarjetas, Paneles, Tablas, Modales):** `8px` (`rounded-lg`).
- **Controles Interactivos (Botones, Inputs, Selects):** `8px` (`rounded-lg`).
- **Badges y Etiquetas de Estado:** `6px` (`rounded-md`) con padding horizontal compacto (`8px`) y vertical (`2px`).
- **Píldoras de Avatar:** Círculo completo (`9999px` / `rounded-full`) exclusivamente reservado para avatares de barberos y clientes.

## Components

Todos los componentes deben implementar iconografía lineal de **Lucide**, renderizada a exactamente `18px` de ancho y alto, con un grosor de trazo (`stroke-width`) uniforme de `2px`.

### Botones
- **Primary:** Fondo `#2563EB`, texto `#FFFFFF`, altura fija de `36px` (compacto) o `40px` (estándar), padding horizontal de `16px`. Hover `#1D4ED8`. Borde nulo.
- **Secondary / Outline:** Fondo `#FFFFFF`, borde `1px solid #E2E8F0`, texto `#0F172A`. Hover: fondo `#F8FAFC`, borde `#CBD5E1`.
- **Ghost:** Fondo transparente, texto `#475569`. Hover: fondo `#F1F5F9`, texto `#0F172A`.
- **Destructive:** Fondo `#FFFFFF`, borde `1px solid #FECDD3`, texto `#E11D48`. Hover: fondo `#FFF1F2`.

### Inputs y Selectores
- Altura base: `38px`.
- Fondo: `#FFFFFF`, borde: `1px solid #E2E8F0`, radio: `8px`.
- Tipografía interior: 14px regular (`#0F172A`), placeholder: `#94A3B8`.
- Foco: Borde `#2563EB`, `box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15)`.

### Tablas Operativas
- **Header:** Fondo `#F8FAFC`, altura `40px`, borde inferior `1px solid #E2E8F0`. Tipografía `12px` semibold en mayúsculas (`#475569`).
- **Filas:** Altura estricta de `52px`, fondo `#FFFFFF`, borde inferior `1px solid #E2E8F0`. Hover de fila: `#F8FAFC`.
- **Celdas Numéricas:** Alineadas a la derecha con formato monetario estándar (`$150.00 MXN`).

### Badges de Estado
Componentes en línea con padding horizontal de `8px`, vertical de `2px`, borde de `1px` y texto de `12px` medium:
- **Pendiente:** `bg-amber-50 text-amber-700 border-amber-200`
- **Confirmada:** `bg-blue-50 text-blue-700 border-blue-200`
- **Completada:** `bg-emerald-50 text-emerald-700 border-emerald-200`
- **Cancelada:** `bg-slate-100 text-rose-600 border-rose-200`
Un punto indicador opcional (`dot`) de `6px` puede preceder al texto con el color pleno del estado.

### Tarjetas de Agenda (Timeline de Citas)
- Borde lateral izquierdo reforzado con color de estado (ancho: `3px`).
- Fondo `#FFFFFF`, borde perimetral `1px solid #E2E8F0`.
- Padding interno `12px 16px`. Muestra hora de inicio, nombre del cliente, servicio y barbero asignado sin decoraciones secundarias.