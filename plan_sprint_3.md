# Plan de Desarrollo: SPRINT 3 (Mejoras de UX)

¡Qué bueno que te esté gustando cómo va quedando! Tienes un sistema muy potente en tus manos.

De acuerdo a nuestro esquema de trabajo, el siguiente bloque es el **Sprint 3**, enfocado en "Mejoras Rápidas de Experiencia de Usuario (UX)". El objetivo aquí es pulir esos pequeños detalles que hacen que la aplicación se sienta premium y fácil de usar.

## User Review Required

> [!IMPORTANT]
> **Tareas a implementar en el Sprint 3:**
> 
> 1. **Filtros en "Mis Citas" (Cliente):** 
>    Actualmente la vista de citas del cliente muestra todo junto. Agregaremos pestañas para separar "Próximas", "Completadas" y "Canceladas". Además, mostraremos el precio de cada corte ahí mismo.
> 
> 2. **Notas para el Barbero:**
>    En la pantalla de reservar (`BookAppointment.jsx`), agregaremos un campo de texto opcional para que el cliente pueda dejar instrucciones especiales (Ej: "Solo con tijera a los lados").
> 
> 3. **Validación de Horarios Globales:**
>    Aunque ya validamos el horario de cada barbero, aseguraremos que el selector de fechas solo permita escoger fechas a partir del día de hoy. (Evitar que reserven en el pasado).
> 
> 4. **Paginación en el Panel de Administrador (Opcional por ahora):**
>    Como la base de datos crecerá, implementaremos un límite visual (ej. 10 elementos por página) en la tabla de citas del administrador para que no se sature.
> 
> 5. **Mejora de Errores Globales:**
>    Cambiar las alertas genéricas (`alert("Error...")`) por mensajes más limpios integrados en la interfaz de usuario para que sea menos intrusivo.
> 
> ¿Te parece bien enfocarnos en estos detalles ahora? Si me das luz verde, comienzo inmediatamente con las Pestañas de Citas y las Notas para el barbero.

## Proposed Changes

### [MODIFY] `src/pages/MyAppointments.jsx`
- Reestructurar la vista para incluir un selector de pestañas (Tabs).
- Mostrar el precio total del servicio en cada tarjeta de cita.

### [MODIFY] `src/pages/BookAppointment.jsx`
- Añadir un `textarea` en el formulario vinculado a la columna `notes` de la tabla `appointments`.
- Enviar el contenido de `notes` durante el `insert` en Supabase.

### [MODIFY] `src/pages/admin/ManageAppointments.jsx`
- Implementar paginación local cortando el array `appointments` en bloques de 10 o 15 elementos y agregar botones de "Anterior" y "Siguiente".

### [MODIFY] Varias vistas (Globales)
- Sustituir `alert()` por un componente de notificación estilo Toast o textos en rojo si el tiempo lo permite.
