# Plan de Desarrollo: SPRINT 4 (Experiencia del Cliente & Home)

¡Llegó el momento de hacer que la aplicación luzca increíble! En este **Sprint 4**, nos enfocaremos en el lado público de la aplicación, es decir, lo que ven los clientes antes de siquiera iniciar sesión. El objetivo es dar una apariencia súper profesional y de primer nivel.

## User Review Required

> [!IMPORTANT]
> **Tareas a implementar en el Sprint 4:**
> 
> 1. **Rediseño del Home (Hero Section):** 
>    Mejoraremos la pantalla principal (`Home.jsx`) agregando una imagen de fondo atractiva (generada dinámicamente) que sirva como "Hero", con un filtro oscuro para que las letras doradas resalten aún más.
> 
> 2. **Sección "Nuestros Barberos":**
>    En la misma página principal, consultaremos a la base de datos quiénes son los barberos activos y los mostraremos en tarjetas elegantes. (Actualmente el Home es estático).
> 
> 3. **Catálogo de Servicios Público:**
>    Vamos a darle vida a la ruta `/services` (que ahorita solo dice "próximamente"). Crearemos el componente `ServiceCard.jsx` y mostraremos ahí todos los servicios reales que diste de alta en la base de datos con su respectivo precio y duración, ordenados por precio.
> 
> 4. **Botones de Llamado a la Acción:**
>    Conectaremos los botones del Home para que inviten sutilmente a iniciar sesión y agendar cita.
> 
> ¿Te parece bien este alcance para el Sprint 4? Si me das luz verde, empiezo de inmediato con el rediseño del Home y la generación de imágenes.

## Proposed Changes

### [MODIFY] `src/pages/Home.jsx`
- Reemplazar el layout actual por uno más moderno con imagen de fondo "Hero".
- Añadir fetch a la tabla `barbers` (con `profiles`) para renderizar dinámicamente la sección "Nuestros barberos".

### [NEW] `src/components/ui/BarberCard.jsx` (Opcional, puede ir dentro de Home)
- Componente para la tarjeta de barbero.

### [MODIFY] `src/pages/Services.jsx`
- Eliminar el texto "próximamente".
- Hacer fetch a `services` donde `is_active = true`.
- Mostrar una grilla de tarjetas con el nombre, descripción, precio y duración de cada servicio.

### [NEW] `src/components/ui/ServiceCard.jsx` (Opcional, puede ir dentro de Services)
- Tarjeta individual con diseño dark/gold.
