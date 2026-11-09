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

-- ===== 3.0: свой ID у каждого аккаунта и фон профиля, который видят все =====
alter table public.profiles add column if not exists pid integer;
alter table public.profiles add column if not exists bg text;
alter table public.profiles add column if not exists bg_dim smallint;
-- номера по порядку регистрации, начиная с 1001
do $$ begin
  if exists (select 1 from public.profiles where pid is null) then
    with o as (select user_id, row_number() over (order by created_at, user_id) rn from public.profiles where pid is null)
    update public.profiles p set pid = (select coalesce(max(pid), 1000) from public.profiles) + o.rn from o where p.user_id = o.user_id;
  end if;
end $$;
do $$ begin alter table public.profiles add constraint profiles_pid_key unique (pid); exception when duplicate_object or duplicate_table then null; end $$;
do $$ begin alter table public.profiles add constraint profiles_bg_dim_chk check (bg_dim is null or bg_dim between 0 and 90); exception when duplicate_object then null; end $$;
-- новичок получает следующий номер; поменять свой номер нельзя
create or replace function public.profiles_keep_pid() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then new.pid := old.pid;
  elsif new.pid is null then new.pid := (select coalesce(max(p.pid), 1000) + 1 from public.profiles p);
  end if;
  return new;
end $$;
drop trigger if exists profiles_keep_pid on public.profiles;
create trigger profiles_keep_pid before insert or update on public.profiles for each row execute function public.profiles_keep_pid();

-- ===== 3.1: общая стена — посты, комменты, реакции, лайки комментов =====
create table if not exists public.wall_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text check (char_length(body) <= 4000),
  image text,
  created_at timestamptz not null default now(),
  constraint wall_posts_not_empty check (body is not null or image is not null)
);
create table if not exists public.wall_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.wall_posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text check (char_length(body) <= 2000),
  image text,
  created_at timestamptz not null default now(),
  constraint wall_comments_not_empty check (body is not null or image is not null)
);
create table if not exists public.wall_reactions (
  post_id uuid not null references public.wall_posts (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('like','lol','cringe','poop','clown','party','cry','salute','skull','fire')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, kind)
);
create table if not exists public.wall_comment_likes (
  comment_id uuid not null references public.wall_comments (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);
create index if not exists wall_posts_created_idx on public.wall_posts (created_at desc);
create index if not exists wall_posts_user_idx on public.wall_posts (user_id);
create index if not exists wall_comments_post_idx on public.wall_comments (post_id, created_at);
create index if not exists wall_comments_user_idx on public.wall_comments (user_id);
create index if not exists wall_reactions_user_idx on public.wall_reactions (user_id);
create index if not exists wall_comment_likes_user_idx on public.wall_comment_likes (user_id);
alter table public.wall_posts enable row level security;
alter table public.wall_comments enable row level security;
alter table public.wall_reactions enable row level security;
alter table public.wall_comment_likes enable row level security;
drop policy if exists wp_select on public.wall_posts;
drop policy if exists wp_insert on public.wall_posts;
drop policy if exists wp_delete on public.wall_posts;
create policy wp_select on public.wall_posts for select to authenticated using (true);
create policy wp_insert on public.wall_posts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy wp_delete on public.wall_posts for delete to authenticated using ((select auth.uid()) = user_id);
drop policy if exists wc_select on public.wall_comments;
drop policy if exists wc_insert on public.wall_comments;
drop policy if exists wc_delete on public.wall_comments;
create policy wc_select on public.wall_comments for select to authenticated using (true);
create policy wc_insert on public.wall_comments for insert to authenticated with check ((select auth.uid()) = user_id);
create policy wc_delete on public.wall_comments for delete to authenticated
  using ((select auth.uid()) = user_id or exists (select 1 from public.wall_posts p where p.id = post_id and p.user_id = (select auth.uid())));
drop policy if exists wr_select on public.wall_reactions;
drop policy if exists wr_insert on public.wall_reactions;
drop policy if exists wr_delete on public.wall_reactions;
create policy wr_select on public.wall_reactions for select to authenticated using (true);
create policy wr_insert on public.wall_reactions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy wr_delete on public.wall_reactions for delete to authenticated using ((select auth.uid()) = user_id);
drop policy if exists wcl_select on public.wall_comment_likes;
drop policy if exists wcl_insert on public.wall_comment_likes;
drop policy if exists wcl_delete on public.wall_comment_likes;
create policy wcl_select on public.wall_comment_likes for select to authenticated using (true);
create policy wcl_insert on public.wall_comment_likes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy wcl_delete on public.wall_comment_likes for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.wall_posts, public.wall_comments, public.wall_reactions, public.wall_comment_likes from anon;
do $$ begin alter publication supabase_realtime add table public.wall_posts; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.wall_comments; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.wall_reactions; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.wall_comment_likes; exception when duplicate_object then null; end $$;

-- ===== 3.1: свои витрины в профиле =====
create table if not exists public.showcases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  kind text not null check (kind in ('game','kino','read')),
  entries jsonb not null default '[]'::jsonb check (jsonb_typeof(entries) = 'array' and jsonb_array_length(entries) <= 200),
  ord integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists showcases_user_idx on public.showcases (user_id, ord);
alter table public.showcases enable row level security;
drop policy if exists sc_select on public.showcases;
drop policy if exists sc_insert on public.showcases;
drop policy if exists sc_update on public.showcases;
drop policy if exists sc_delete on public.showcases;
create policy sc_select on public.showcases for select to authenticated using (true);
create policy sc_insert on public.showcases for insert to authenticated with check ((select auth.uid()) = user_id);
create policy sc_update on public.showcases for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy sc_delete on public.showcases for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.showcases from anon;
do $$ begin alter publication supabase_realtime add table public.showcases; exception when duplicate_object then null; end $$;

-- ===== 3.3: уведомления (упоминания, ответы) и отдельный фон профиля для телефона =====
alter table public.profiles add column if not exists bg_m text;
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  actor uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('mention_post','mention_comment','comment','invite')),
  ref text,
  body text check (char_length(body) <= 300),
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_actor_idx on public.notifications (actor);
alter table public.notifications enable row level security;
drop policy if exists nt_select on public.notifications;
drop policy if exists nt_insert on public.notifications;
drop policy if exists nt_update on public.notifications;
drop policy if exists nt_delete on public.notifications;
create policy nt_select on public.notifications for select to authenticated using ((select auth.uid()) = user_id);
create policy nt_insert on public.notifications for insert to authenticated with check ((select auth.uid()) = actor and user_id <> actor);
create policy nt_update on public.notifications for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy nt_delete on public.notifications for delete to authenticated using ((select auth.uid()) = user_id);
revoke all on public.notifications from anon;
alter table public.notifications replica identity full;
do $$ begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end $$;

-- ===== 3.4: тир-листы, книга жалоб и предложений, отметки на стенах мероприятий =====
alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check check (kind in ('mention_post','mention_comment','comment','invite','mention_event','tier_reply'));

create table if not exists public.tierlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  tiers jsonb not null default '[]'::jsonb check (jsonb_typeof(tiers) = 'array' and jsonb_array_length(tiers) <= 20),
  pool jsonb not null default '[]'::jsonb check (jsonb_typeof(pool) = 'array'),
  pinned boolean not null default false,
  reply_to uuid references public.tierlists(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tierlists_user_idx on public.tierlists(user_id);
create index if not exists tierlists_reply_idx on public.tierlists(reply_to);
alter table public.tierlists enable row level security;
drop policy if exists tl_select on public.tierlists; create policy tl_select on public.tierlists for select to authenticated using (true);
drop policy if exists tl_insert on public.tierlists; create policy tl_insert on public.tierlists for insert to authenticated with check (user_id = auth.uid());
drop policy if exists tl_update on public.tierlists; create policy tl_update on public.tierlists for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists tl_delete on public.tierlists; create policy tl_delete on public.tierlists for delete to authenticated using (user_id = auth.uid());

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  body text check (body is null or char_length(body) <= 3000),
  image text,
  created_at timestamptz not null default now(),
  check (body is not null or image is not null)
);
alter table public.feedback enable row level security;
drop policy if exists fb_select on public.feedback; create policy fb_select on public.feedback for select to authenticated using (true);
drop policy if exists fb_insert on public.feedback; create policy fb_insert on public.feedback for insert to authenticated with check (user_id = auth.uid());
drop policy if exists fb_delete on public.feedback; create policy fb_delete on public.feedback for delete to authenticated using (user_id = auth.uid());

create table if not exists public.feedback_votes (
  feedback_id uuid not null references public.feedback(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  v smallint not null check (v in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (feedback_id, user_id)
);
alter table public.feedback_votes enable row level security;
drop policy if exists fv_select on public.feedback_votes; create policy fv_select on public.feedback_votes for select to authenticated using (true);
drop policy if exists fv_insert on public.feedback_votes; create policy fv_insert on public.feedback_votes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists fv_update on public.feedback_votes; create policy fv_update on public.feedback_votes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists fv_delete on public.feedback_votes; create policy fv_delete on public.feedback_votes for delete to authenticated using (user_id = auth.uid());
revoke all on public.tierlists, public.feedback, public.feedback_votes from anon;
do $$ begin
  begin alter publication supabase_realtime add table public.tierlists; exception when others then null; end;
  begin alter publication supabase_realtime add table public.feedback; exception when others then null; end;
  begin alter publication supabase_realtime add table public.feedback_votes; exception when others then null; end;
end $$;

-- ===== 3.5: комментарии в книге жалоб =====
alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check check (kind in ('mention_post','mention_comment','comment','invite','mention_event','tier_reply','book_comment'));
create table if not exists public.feedback_comments (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedback(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists feedback_comments_fb_idx on public.feedback_comments(feedback_id);
alter table public.feedback_comments enable row level security;
drop policy if exists fc_select on public.feedback_comments; create policy fc_select on public.feedback_comments for select to authenticated using (true);
drop policy if exists fc_insert on public.feedback_comments; create policy fc_insert on public.feedback_comments for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists fc_delete on public.feedback_comments; create policy fc_delete on public.feedback_comments for delete to authenticated using (user_id = (select auth.uid()));
revoke all on public.feedback_comments from anon;
do $$ begin begin alter publication supabase_realtime add table public.feedback_comments; exception when others then null; end; end $$;
