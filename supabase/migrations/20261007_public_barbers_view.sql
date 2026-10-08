-- Vista pública de barberos activos para la página del negocio y la reserva.
--
-- Problema: los visitantes sin sesión no pueden leer la tabla profiles (está
-- protegida con RLS porque guarda teléfonos y roles), así que ven a los
-- barberos sin nombre.
--
-- Solución: una vista que expone SOLO lo necesario de los barberos activos
-- (nombre, biografía y horario). La vista se ejecuta con los permisos de su
-- dueño, por eso puede leer profiles sin abrir esa tabla al público.
--
-- Cómo aplicarla: Supabase → SQL Editor → pegar este archivo → Run.

create or replace view public.public_barbers as
select
  b.id,
  p.full_name,
  b.bio,
  b.schedule
from public.barbers b
join public.profiles p on p.id = b.profile_id
where b.is_active = true;

grant select on public.public_barbers to anon, authenticated;
