# Pantallas de Google Stitch — Barber OS

Referencia visual del rediseño. Este HTML **no se copia a la app**: sirve para tomar estructura, medidas y colores al construir cada pantalla en React. Los prompts que las generaron están en `docs/design/PROMPTS_GOOGLE_STITCH.md`.

## Cómo guardar cada exportación

En Stitch: seleccionar la pantalla → **Export → Code** (y descargar también la imagen). Guardar en la carpeta que le corresponde:

```
design/stitch/<NN>-<nombre>/
  screen.png      ← captura de la pantalla
  code.html       ← código exportado por Stitch
```

| #  | Carpeta                    | Pantalla                          | Ruta destino en la app        |
|----|----------------------------|-----------------------------------|-------------------------------|
| 01 | `01-resumen`               | Resumen (dashboard admin)         | `/app/resumen`                |
| 02 | `02-agenda`                | Agenda semanal por barbero        | `/app/agenda`                 |
| 03 | `03-citas`                 | Listado de citas                  | `/app/citas`                  |
| 04 | `04-clientes`              | Clientes + historial              | `/app/clientes`               |
| 05 | `05-equipo`                | Equipo y horarios                 | `/app/equipo`                 |
| 06 | `06-servicios`             | Catálogo de servicios             | `/app/servicios`              |
| 07 | `07-reportes`              | Reportes                          | `/app/reportes`               |
| 08 | `08-configuracion`         | Configuración y suscripción       | `/app/configuracion`          |
| 09 | `09-mi-agenda-barbero`     | Mi agenda del barbero             | `/app/mi-agenda`              |
| 10 | `10-pagina-publica`        | Página pública del negocio        | `/:slug`                      |
| 11 | `11-reserva`               | Flujo de reserva (pasos 3 y 4)    | `/:slug/reservar`             |
| 12 | `12-mis-citas`             | Mis citas + detalle               | `/:slug/mis-citas`            |
| 13 | `13-perfil`                | Perfil del cliente                | `/:slug/perfil`               |
| 14 | `14-login`                 | Iniciar sesión / registro         | `/login`                      |
| 15 | `15-onboarding`            | Alta del negocio                  | `/onboarding`                 |
| 16 | `16-landing`               | Landing de Barber OS              | `/`                           |

Si una pantalla tiene variantes (modal abierto, drawer, versión móvil), guardarlas en la misma carpeta con sufijo: `screen-drawer.png`, `screen-mobile.png`.
