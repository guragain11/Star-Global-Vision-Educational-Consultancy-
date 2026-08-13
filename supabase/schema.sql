-- Star Global Vision — Supabase schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
--
-- Creates the admin-managed tables with row level security so that:
--   * anyone (anon) can read PUBLISHED rows, the public website
--   * only signed-in users can read drafts and insert / update / delete, /admin
--   * anyone can SUBMIT an enquiry, but only staff can read them back

-- ---------------------------------------------------------------------------
-- Blog posts
-- ---------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text        not null unique,
  title        text        not null,
  excerpt      text        not null default '',
  content      text        not null default '',
  category     text        not null default 'Destination Guide',
  author       text        not null default 'Star Global Vision',
  cover_image  text,
  published_at date        not null default current_date,
  published    boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Success stories
-- ---------------------------------------------------------------------------
create table if not exists public.success_stories (
  id           uuid primary key default gen_random_uuid(),
  slug         text        not null unique,
  student_name text        not null,
  country      text        not null default 'Australia',
  university   text        not null default '',
  course       text        not null default '',
  intake       text        not null default '',
  quote        text        not null default '',
  story        text        not null default '',
  photo        text,
  published_at date        not null default current_date,
  published    boolean     not null default false,
  featured     boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists blog_posts_published_idx
  on public.blog_posts (published, published_at desc);
create index if not exists success_stories_published_idx
  on public.success_stories (published, published_at desc);

-- ---------------------------------------------------------------------------
-- Team members
-- ---------------------------------------------------------------------------
create table if not exists public.team_members (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  designation   text        not null,
  department    text        not null default '',
  photo         text,
  email         text        not null default '',
  phone         text        not null default '',
  bio           text        not null default '',
  sort_order    integer     not null default 0,
  published     boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists team_members_sort_idx
  on public.team_members (sort_order, name);

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Keep updated_at current on every write
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

drop trigger if exists success_stories_set_updated_at on public.success_stories;
create trigger success_stories_set_updated_at
  before update on public.success_stories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.blog_posts      enable row level security;
alter table public.success_stories enable row level security;
alter table public.team_members    enable row level security;

-- Public read access, published rows only.
drop policy if exists "Published posts are readable by anyone" on public.blog_posts;
create policy "Published posts are readable by anyone"
  on public.blog_posts for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Published stories are readable by anyone" on public.success_stories;
create policy "Published stories are readable by anyone"
  on public.success_stories for select
  to anon, authenticated
  using (published = true);

-- Signed-in admins get full access, including drafts.
drop policy if exists "Admins read every post" on public.blog_posts;
create policy "Admins read every post"
  on public.blog_posts for select to authenticated using (true);

drop policy if exists "Admins write posts" on public.blog_posts;
create policy "Admins write posts"
  on public.blog_posts for insert to authenticated with check (true);

drop policy if exists "Admins update posts" on public.blog_posts;
create policy "Admins update posts"
  on public.blog_posts for update to authenticated using (true) with check (true);

drop policy if exists "Admins delete posts" on public.blog_posts;
create policy "Admins delete posts"
  on public.blog_posts for delete to authenticated using (true);

drop policy if exists "Admins read every story" on public.success_stories;
create policy "Admins read every story"
  on public.success_stories for select to authenticated using (true);

drop policy if exists "Admins write stories" on public.success_stories;
create policy "Admins write stories"
  on public.success_stories for insert to authenticated with check (true);

drop policy if exists "Admins update stories" on public.success_stories;
create policy "Admins update stories"
  on public.success_stories for update to authenticated using (true) with check (true);

drop policy if exists "Admins delete stories" on public.success_stories;
create policy "Admins delete stories"
  on public.success_stories for delete to authenticated using (true);

-- Team members: published rows readable by anyone, full access for admins.
drop policy if exists "Published team members readable by anyone" on public.team_members;
create policy "Published team members readable by anyone"
  on public.team_members for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admins read every team member" on public.team_members;
create policy "Admins read every team member"
  on public.team_members for select to authenticated using (true);

drop policy if exists "Admins write team members" on public.team_members;
create policy "Admins write team members"
  on public.team_members for insert to authenticated with check (true);

drop policy if exists "Admins update team members" on public.team_members;
create policy "Admins update team members"
  on public.team_members for update to authenticated using (true) with check (true);

drop policy if exists "Admins delete team members" on public.team_members;
create policy "Admins delete team members"
  on public.team_members for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Enquiries (contact form submissions)
-- ---------------------------------------------------------------------------
-- Length limits are enforced in the database, not just the browser, because
-- the insert policy is open to anon and a form is trivial to bypass.
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null check (char_length(name) between 1 and 120),
  phone       text        not null check (char_length(phone) between 1 and 40),
  email       text        not null default '' check (char_length(email) <= 160),
  destination text        not null default '' check (char_length(destination) <= 80),
  test        text        not null default '' check (char_length(test) <= 80),
  message     text        not null default '' check (char_length(message) <= 4000),
  status      text        not null default 'new'
                check (status in ('new', 'contacted', 'closed')),
  notes       text        not null default '' check (char_length(notes) <= 4000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists enquiries_status_idx
  on public.enquiries (status, created_at desc);

drop trigger if exists enquiries_set_updated_at on public.enquiries;
create trigger enquiries_set_updated_at
  before update on public.enquiries
  for each row execute function public.set_updated_at();

alter table public.enquiries enable row level security;

-- Anyone may submit the contact form. status and notes are staff-only fields,
-- so a submission is rejected unless it leaves them at their defaults.
drop policy if exists "Anyone can submit an enquiry" on public.enquiries;
create policy "Anyone can submit an enquiry"
  on public.enquiries for insert
  to anon, authenticated
  with check (status = 'new' and notes = '');

-- Deliberately NO select policy for anon: submissions are write-only to the
-- public, so nobody can read other people's contact details back out.
drop policy if exists "Admins read enquiries" on public.enquiries;
create policy "Admins read enquiries"
  on public.enquiries for select to authenticated using (true);

drop policy if exists "Admins update enquiries" on public.enquiries;
create policy "Admins update enquiries"
  on public.enquiries for update to authenticated using (true) with check (true);

drop policy if exists "Admins delete enquiries" on public.enquiries;
create policy "Admins delete enquiries"
  on public.enquiries for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded cover images and student photos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
  set public             = true,
      file_size_limit    = 5242880,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read so <img src> works for visitors; writes require a staff session.
drop policy if exists "Media is publicly readable" on storage.objects;
create policy "Media is publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "Staff upload media" on storage.objects;
create policy "Staff upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "Staff update media" on storage.objects;
create policy "Staff update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media') with check (bucket_id = 'media');

drop policy if exists "Staff delete media" on storage.objects;
create policy "Staff delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');

-- ---------------------------------------------------------------------------
-- After running this file
-- ---------------------------------------------------------------------------
-- 1. Dashboard → Authentication → Users → "Add user" → create the admin
--    account with a strong password, and tick "Auto Confirm User".
-- 2. Dashboard → Authentication → Providers → Email → turn OFF "Enable signup"
--    so nobody can self-register an admin account.
-- 3. Copy Project URL and anon key from Settings → API into .env:
--       VITE_SUPABASE_URL=...
--       VITE_SUPABASE_ANON_KEY=...
-- 4. Restart the dev server, open /admin and sign in.
