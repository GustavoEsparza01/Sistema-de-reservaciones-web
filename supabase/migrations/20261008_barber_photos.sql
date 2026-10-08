-- Fotos de los barberos para la página del negocio y la reserva.
--
-- 1. Columna photo_url en barbers (dirección pública de la foto).
-- 2. Bucket público "barber-photos" en Supabase Storage: cualquiera puede ver
--    las fotos, pero solo los administradores pueden subirlas o borrarlas.
-- 3. La vista public_barbers ahora también expone photo_url.
--
-- Cómo aplicarla: Supabase → SQL Editor → pegar este archivo → Run.
-- También crea la vista public_barbers, así que sustituye a
-- 20261007_public_barbers_view.sql si esa aún no se había aplicado.

alter table public.barbers add column if not exists photo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('barber-photos', 'barber-photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "barber_photos_admin_insert" on storage.objects;
drop policy if exists "barber_photos_admin_update" on storage.objects;
drop policy if exists "barber_photos_admin_delete" on storage.objects;

create policy "barber_photos_admin_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'barber-photos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "barber_photos_admin_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'barber-photos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "barber_photos_admin_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'barber-photos'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Se borra y se vuelve a crear porque "create or replace" no permite
-- agregar columnas en medio de una vista existente.
drop view if exists public.public_barbers;

create view public.public_barbers as
select
  b.id,
  p.full_name,
  b.bio,
  b.schedule,
  b.photo_url
from public.barbers b
join public.profiles p on p.id = b.profile_id
where b.is_active = true;

grant select on public.public_barbers to anon, authenticated;
