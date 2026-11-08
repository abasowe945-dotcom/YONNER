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

-- ===== друзья: все вошедшие видят ники и полки друг друга (без заметок и причин дропа) =====
drop policy if exists profiles_read_all on public.profiles;
create policy profiles_read_all on public.profiles for select to authenticated using (true);

create or replace function public.public_items()
returns table (id text, user_id uuid, data jsonb, updated_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select i.id, i.user_id, i.data - 'note' - 'dropReason', i.updated_at
  from public.items i
  where (select auth.uid()) is not null
$$;
revoke all on function public.public_items() from public, anon;
grant execute on function public.public_items() to authenticated;

-- ===== аватарки =====
alter table public.profiles add column if not exists avatar text;
alter table public.profiles add column if not exists ava_animal text;
alter table public.profiles add column if not exists ava_color text;

-- ===== дни рождения (2.1) =====
alter table public.profiles add column if not exists birthday date;

-- ===== мероприятия, участники и стена (2.2) =====
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  descr text check (char_length(descr) <= 3000),
  place text check (char_length(place) <= 200),
  starts_at timestamptz,
  photo text,
  created_at timestamptz not null default now()
);
create table if not exists public.event_members (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'invited' check (status in ('invited','going','not')),
  invited_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);
create table if not exists public.event_posts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text check (char_length(body) <= 2000),
  image text,
  created_at timestamptz not null default now()
);
create index if not exists event_members_user_idx on public.event_members (user_id);
create index if not exists event_posts_event_idx on public.event_posts (event_id, created_at);
alter table public.events enable row level security;
alter table public.event_members enable row level security;
alter table public.event_posts enable row level security;
drop policy if exists events_select on public.events;
drop policy if exists events_insert on public.events;
drop policy if exists events_update on public.events;
drop policy if exists events_delete on public.events;
create policy events_select on public.events for select to authenticated using (true);
create policy events_insert on public.events for insert to authenticated with check ((select auth.uid()) = owner);
create policy events_update on public.events for update to authenticated using ((select auth.uid()) = owner) with check ((select auth.uid()) = owner);
create policy events_delete on public.events for delete to authenticated using ((select auth.uid()) = owner);
drop policy if exists em_select on public.event_members;
drop policy if exists em_insert on public.event_members;
drop policy if exists em_update on public.event_members;
drop policy if exists em_delete on public.event_members;
create policy em_select on public.event_members for select to authenticated using (true);
create policy em_insert on public.event_members for insert to authenticated
  with check ((select auth.uid()) = user_id or ((select auth.uid()) = invited_by and status = 'invited'));
create policy em_update on public.event_members for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy em_delete on public.event_members for delete to authenticated
  using ((select auth.uid()) = user_id or exists (select 1 from public.events e where e.id = event_id and e.owner = (select auth.uid())));
drop policy if exists ep_select on public.event_posts;
drop policy if exists ep_insert on public.event_posts;
drop policy if exists ep_delete on public.event_posts;
create policy ep_select on public.event_posts for select to authenticated using (true);
create policy ep_insert on public.event_posts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy ep_delete on public.event_posts for delete to authenticated
  using ((select auth.uid()) = user_id or exists (select 1 from public.events e where e.id = event_id and e.owner = (select auth.uid())));
revoke all on public.events, public.event_members, public.event_posts from anon;
do $$ begin alter publication supabase_realtime add table public.events; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.event_members; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.event_posts; exception when duplicate_object then null; end $$;

-- ===== 2.3: читалка, лайки на стене, «ГО ПОСМОТРИМ» =====
create table if not exists public.reads (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.reads enable row level security;
drop policy if exists reads_select on public.reads;
drop policy if exists reads_insert on public.reads;
drop policy if exists reads_update on public.reads;
drop policy if exists reads_delete on public.reads;
create policy reads_select on public.reads for select to authenticated using (true);
create policy reads_insert on public.reads for insert to authenticated with check ((select auth.uid()) = user_id);
create policy reads_update on public.reads for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy reads_delete on public.reads for delete to authenticated using ((select auth.uid()) = user_id);

create table if not exists public.event_post_likes (
  post_id uuid not null references public.event_posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index if not exists epl_user_idx on public.event_post_likes (user_id);
alter table public.event_post_likes enable row level security;
drop policy if exists epl_select on public.event_post_likes;
drop policy if exists epl_insert on public.event_post_likes;
drop policy if exists epl_delete on public.event_post_likes;
create policy epl_select on public.event_post_likes for select to authenticated using (true);
create policy epl_insert on public.event_post_likes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy epl_delete on public.event_post_likes for delete to authenticated using ((select auth.uid()) = user_id);

alter table public.events add column if not exists kind text not null default 'event';
alter table public.events add column if not exists mode text;
alter table public.events add column if not exists film jsonb;
alter table public.events add column if not exists link text;
do $$ begin alter table public.events add constraint events_kind_chk check (kind in ('event','watch')); exception when duplicate_object then null; end $$;

revoke all on public.reads, public.event_post_likes from anon;
do $$ begin alter publication supabase_realtime add table public.event_post_likes; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.profiles; exception when duplicate_object then null; end $$;
