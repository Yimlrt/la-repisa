-- Ejecuta este script completo en Supabase: Panel > SQL Editor > New Query > pega esto > Run

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null default 0,
  stock integer not null default 0,
  category text,
  image_url text,
  created_at timestamptz not null default now()
);

-- Activamos seguridad a nivel de fila
alter table products enable row level security;

-- Cualquier persona (incluso sin iniciar sesión) puede VER los productos
create policy "Los productos son publicos para leer"
  on products for select
  using (true);

-- Solo usuarios autenticados (tu mamá, con su usuario admin) pueden crear/editar/borrar
create policy "Solo usuarios logueados pueden insertar"
  on products for insert
  to authenticated
  with check (true);

create policy "Solo usuarios logueados pueden actualizar"
  on products for update
  to authenticated
  using (true);

create policy "Solo usuarios logueados pueden borrar"
  on products for delete
  to authenticated
  using (true);

-- Bucket de almacenamiento para las fotos de los productos
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Cualquiera puede ver las imagenes de productos"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Solo usuarios logueados pueden subir imagenes"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "Solo usuarios logueados pueden borrar imagenes"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
