# Plan de Desarrollo: SPRINT 2 (Funcionalidad Importante)

¡Excelente! Me alegra que el Sprint 1 esté sólido. Ahora vamos a darle más profundidad al sistema con el **Sprint 2**.

## User Review Required

> [!IMPORTANT]
> **Tareas a implementar en el Sprint 2:**
> 
> 1. **Confirmación de Citas:** 
>    En el panel de Citas, agregaremos un botón de "Confirmar" para pasar una cita de estado "Pendiente" a "Confirmada".
> 
> 2. **Duración Real de Servicios:**
>    En `ManageServices.jsx` agregaremos un campo para capturar la duración de cada corte en minutos (ej. 30, 45, 60). Luego, en `BookAppointment.jsx`, usaremos esa duración real para calcular a qué hora termina la cita, en lugar de asumir siempre 60 minutos.
> 
> 3. **Historial por Cliente:**
>    En `ManageClients.jsx` añadiremos un botón "Ver historial" que abrirá una ventana emergente mostrándote todos los cortes que se ha hecho ese cliente en tu barbería.
> 
> 4. **Gráficas de Reportes:**
>    En `Reports.jsx` implementaremos gráficas visuales (de barras y pastel) usando la librería `recharts` que instalé ayer, para que veas tus ingresos y rendimiento de manera súper profesional.
> 
> 5. **Horarios de Barberos (Atención requerida de tu parte):**
>    Para asignar qué días y a qué horas trabaja cada barbero, necesitamos guardar esa configuración. La forma más limpia es agregar una columna tipo JSON a tu tabla `barbers`. **Necesitaré que ejecutes un pequeño comando SQL en tu panel de Supabase** para poder programar esta parte.
> 
> ¿Estás de acuerdo con el plan? Si es así, te pasaré el comando SQL para el punto 5 y me pondré a programar de inmediato los puntos 1, 2, 3 y 4.

## Proposed Changes

### [MODIFY] `src/pages/admin/ManageAppointments.jsx`
- Agregar botón "Confirmar" que ejecuta `updateStatus(id, 'accepted')`.

### [MODIFY] `src/pages/admin/ManageServices.jsx`
- Agregar `duration_min` al estado del formulario y a la tabla. Actualizar sentencias de `insert` y `update`.

### [MODIFY] `src/pages/BookAppointment.jsx`
- Buscar el `duration_min` del servicio seleccionado y calcular `ends_at = scheduledAt.getTime() + (duration_min * 60000)`.

### [MODIFY] `src/pages/admin/ManageClients.jsx`
- Agregar modal de historial.
- Al hacer clic en "Ver historial", buscar en `appointments` las citas de ese cliente y listarlas.

### [MODIFY] `src/pages/admin/Reports.jsx` & [NEW] `src/components/admin/ReportChart.jsx`
- Usar `recharts` para generar gráficos de ingresos diarios y distribución de estado de citas.
