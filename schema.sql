-- NEXUS: схема базы для Supabase.
-- Вставь целиком в SQL Editor и нажми Run. Повторный запуск безопасен.

-- ===== записи (игры, фильмы, сериалы) =====
create table if not exists public.items (
  id          text primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists items_user_id_idx on public.items (user_id);

-- ===== настройки пользователя (тема, ачивки) =====
create table if not exists public.meta (
  user_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key      text not null,
  data     jsonb not null default '{}'::jsonb,
  primary key (user_id, key)
);

-- ===== профиль: ник =====
create table if not exists public.profiles (
  user_id     uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  nick        text not null check (char_length(nick) between 2 and 16),
  created_at  timestamptz not null default now()
);

-- ===== доступ: каждый видит и меняет только своё =====
alter table public.items    enable row level security;
alter table public.meta     enable row level security;
alter table public.profiles enable row level security;

drop policy if exists items_select on public.items;
drop policy if exists items_insert on public.items;
drop policy if exists items_update on public.items;
drop policy if exists items_delete on public.items;
create policy items_select on public.items for select to authenticated using ((select auth.uid()) = user_id);
create policy items_insert on public.items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy items_update on public.items for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy items_delete on public.items for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists meta_all on public.meta;
create policy meta_all on public.meta for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists profiles_all on public.profiles;
create policy profiles_all on public.profiles for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- гостям без входа ничего не положено
revoke all on public.items, public.meta, public.profiles from anon;

-- ===== живая синхронизация между устройствами =====
alter table public.items replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.items;
exception when duplicate_object then null;
end $$;

-- ===== картинки: обложки, обои, скриншоты =====
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 20971520, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set public = true, file_size_limit = 20971520, allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'];

-- загружать и удалять можно только в свою папку (первая часть пути = id пользователя)
drop policy if exists media_insert on storage.objects;
drop policy if exists media_update on storage.objects;
drop policy if exists media_delete on storage.objects;
create policy media_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy media_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy media_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
