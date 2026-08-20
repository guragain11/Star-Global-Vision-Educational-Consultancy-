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

-- ---------------------------------------------------------------------------
-- Study destinations
-- ---------------------------------------------------------------------------
-- Drives /countries, the per-country pages, the header Destinations menu and
-- the enquiry dropdowns. `published = false` hides a destination from all of
-- them at once while keeping the row editable in /admin.
--
-- Starts empty. The fourteen destinations the office counsels for ship as seed
-- content in src/data/content.ts and render until this table has rows, so the
-- site is never without a destination list. /admin offers a one-click action to
-- copy those defaults in here once staff want to edit them.
create table if not exists public.countries (
  id           uuid        primary key default gen_random_uuid(),
  slug         text        not null unique,
  name         text        not null,
  -- ISO-ish two letter code, used for the flag chip in the nav.
  flag         text        not null default '',
  -- 'primary' marks the destinations we place the most students in.
  tier         text        not null default 'secondary'
                 check (tier in ('primary', 'secondary')),
  blurb        text        not null default '',
  overview     text        not null default '',
  highlights   text[]      not null default '{}',
  intakes      text        not null default '',
  work         text        not null default '',
  tests        text        not null default '',
  tuition      text        not null default '',
  cost_living  text        not null default '',
  requirements text        not null default '',
  universities text[]      not null default '{}',
  image        text,
  sort_order   integer     not null default 0,
  published    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists countries_sort_idx
  on public.countries (published, sort_order, name);

-- ---------------------------------------------------------------------------
-- Site settings (business info + SEO defaults)
-- ---------------------------------------------------------------------------
-- Exactly one row, ever. The primary key is a fixed literal rather than a uuid
-- so the check constraint can enforce that, and so every read and write can
-- name the row without first looking up its id.
--
-- Real columns rather than jsonb because these values are read on every single
-- page — top bar, footer, contact page, JSON-LD — and are consumed as
-- `settings.email`, where a jsonb blob would be untyped at every call site.
--
-- Starts empty. `src/data/site.ts` is the fallback and renders until this row
-- exists, so the site never shows a blank phone number. /admin writes the row
-- on first save.
--
-- Note for whoever adds the next column: `create table if not exists` does
-- nothing whatsoever when the table already exists, so adding a column to the
-- block below is invisible to every database that has already run this file.
-- Adding one means an `alter table public.site_settings add column if not
-- exists ...` after this statement. `fetchSettings` layers the row over the
-- defaults so a missing column degrades rather than crashing, but that is a
-- safety net, not the fix — the column still will not exist to be written to.
create table if not exists public.site_settings (
  id              text        primary key default 'main' check (id = 'main'),
  name            text        not null default '',
  legal_name      text        not null default '',
  mission         text        not null default '',
  address         text        not null default '',
  email           text        not null default '',
  -- Two numbers, as separate columns rather than an array: the top bar shows the
  -- landline and the mobile CTA shows the mobile, so they are not interchangeable
  -- and a positional array made that impossible to label in the editor.
  phone_primary   text        not null default '',
  phone_secondary text        not null default '',
  -- Digits only, international format, for wa.me links.
  whatsapp        text        not null default '',
  facebook        text        not null default '',
  approval        text        not null default '',
  hours           text        not null default '',
  -- Free text passed to the Google Maps embed on /contact.
  map_query       text        not null default '',
  -- Defaults for pages that do not set their own.
  seo_title       text        not null default '',
  seo_description text        not null default '',
  og_image        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Keep updated_at current on every write
-- ---------------------------------------------------------------------------
-- Defined before the triggers that reference it, so this file runs top to
-- bottom on an empty database.
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

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

drop trigger if exists countries_set_updated_at on public.countries;
create trigger countries_set_updated_at
  before update on public.countries
  for each row execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.blog_posts      enable row level security;
alter table public.success_stories enable row level security;
alter table public.team_members    enable row level security;
alter table public.countries       enable row level security;
alter table public.site_settings   enable row level security;

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

-- Countries: published destinations readable by anyone, full access for admins.
drop policy if exists "Published countries readable by anyone" on public.countries;
create policy "Published countries readable by anyone"
  on public.countries for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admins read every country" on public.countries;
create policy "Admins read every country"
  on public.countries for select to authenticated using (true);

drop policy if exists "Admins write countries" on public.countries;
create policy "Admins write countries"
  on public.countries for insert to authenticated with check (true);

drop policy if exists "Admins update countries" on public.countries;
create policy "Admins update countries"
  on public.countries for update to authenticated using (true) with check (true);

drop policy if exists "Admins delete countries" on public.countries;
create policy "Admins delete countries"
  on public.countries for delete to authenticated using (true);

-- Site settings: readable by everyone (the footer needs them on every page),
-- writable only by staff. No `published` column to filter on — there is one row
-- and it is public information by definition.
drop policy if exists "Site settings readable by anyone" on public.site_settings;
create policy "Site settings readable by anyone"
  on public.site_settings for select
  to anon, authenticated
  using (true);

-- Insert as well as update: the table ships empty, so the first save from /admin
-- has to create the row.
drop policy if exists "Admins write site settings" on public.site_settings;
create policy "Admins write site settings"
  on public.site_settings for insert to authenticated with check (true);

drop policy if exists "Admins update site settings" on public.site_settings;
create policy "Admins update site settings"
  on public.site_settings for update to authenticated using (true) with check (true);

-- Deliberately no delete policy: there is one row and nothing should remove it.
-- Clearing a field is an update.

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
-- Site content (the repeating lists that make up the marketing pages)
-- ---------------------------------------------------------------------------
-- One table for every editable list on the site — services, testimonials, the
-- six process steps, FAQs, exams and so on — discriminated by `collection`.
--
-- Not a table per list. Thirteen tables would mean thirteen schema blocks,
-- thirteen RLS blocks and thirteen editors for what is, in every case, an
-- ordered list of small records. The shape of each record is declared once in
-- `src/data/collections.ts`, and /admin builds its form from that declaration.
--
-- `data` is jsonb because the columns genuinely differ per collection: a
-- testimonial has a quote, an exam has a fee and a set of sections. The
-- alternative — a wide table of nullable columns covering the union of all
-- thirteen shapes — is harder to read and no more typed, since Postgres cannot
-- enforce "these six columns matter when collection = 'exams'" either way.
--
-- Starts empty, like the destinations table. Each list falls back to the array
-- in `src/data/site.ts` or `src/data/exams.ts` until staff import it in /admin.
create table if not exists public.site_content (
  id         uuid        primary key default gen_random_uuid(),
  -- Which list this row belongs to, e.g. 'services'. Constrained by length
  -- rather than an enum: adding a collection is a code change in
  -- src/data/collections.ts, and an enum would make it a migration too.
  collection text        not null check (char_length(collection) between 1 and 40),
  sort_order int         not null default 0,
  published  boolean     not null default true,
  data       jsonb       not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Matches the only query the public site runs: every published row, in display
-- order, for one collection or all of them at once.
create index if not exists site_content_lookup_idx
  on public.site_content (collection, published, sort_order);

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "Published site content readable by anyone" on public.site_content;
create policy "Published site content readable by anyone"
  on public.site_content for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admins read every site content row" on public.site_content;
create policy "Admins read every site content row"
  on public.site_content for select to authenticated using (true);

drop policy if exists "Admins write site content" on public.site_content;
create policy "Admins write site content"
  on public.site_content for insert to authenticated with check (true);

drop policy if exists "Admins update site content" on public.site_content;
create policy "Admins update site content"
  on public.site_content for update to authenticated using (true) with check (true);

drop policy if exists "Admins delete site content" on public.site_content;
create policy "Admins delete site content"
  on public.site_content for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Page sections (the eyebrow, heading and intro above each block of a page)
-- ---------------------------------------------------------------------------
-- The copy that used to be written into the JSX: "How it works", "Six steps
-- from your first question to the departure gate", and the sentence under it.
-- Fifty-two of these across ten pages.
--
-- Keyed rather than ordered, which is what makes this a second table instead of
-- another `site_content` collection. A section is not an item in a list: it is
-- one named slot in a page's layout, it cannot be reordered or duplicated, and
-- the code that renders it asks for it by name. The unique index below is what
-- enforces that, and it is what the save path upserts on.
--
-- Every column defaults to empty and every row is optional. A page with no rows
-- at all shows the built-in copy declared in `src/data/page-copy.ts`, so this
-- table holds overrides, not content. Deleting a row is how staff undo an edit.
--
-- No `published` column, unlike site_content: a heading has no draft state. It
-- is either overridden or it is not.
create table if not exists public.page_sections (
  id         uuid        primary key default gen_random_uuid(),
  -- Which page and which block within it, e.g. ('home', 'process'). Both are
  -- declared in src/data/page-copy.ts; a row naming anything else is simply
  -- never read, which is the harmless failure and why there is no enum here.
  page       text        not null check (char_length(page) between 1 and 40),
  section    text        not null check (char_length(section) between 1 and 40),
  -- Length limits sized to the design rather than to the storage: an eyebrow is
  -- one or two words above the heading, and an intro that runs past a thousand
  -- characters has stopped being an intro.
  eyebrow    text        not null default '' check (char_length(eyebrow) <= 80),
  heading    text        not null default '' check (char_length(heading) <= 200),
  intro      text        not null default '' check (char_length(intro) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per slot, and the conflict target the editor upserts on.
create unique index if not exists page_sections_key_idx
  on public.page_sections (page, section);

drop trigger if exists page_sections_set_updated_at on public.page_sections;
create trigger page_sections_set_updated_at
  before update on public.page_sections
  for each row execute function public.set_updated_at();

alter table public.page_sections enable row level security;

-- Readable by anyone: this is the copy on the marketing pages, and the root
-- route reads it for every visitor. No `published = true` filter to apply.
drop policy if exists "Page sections readable by anyone" on public.page_sections;
create policy "Page sections readable by anyone"
  on public.page_sections for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins write page sections" on public.page_sections;
create policy "Admins write page sections"
  on public.page_sections for insert to authenticated with check (true);

drop policy if exists "Admins update page sections" on public.page_sections;
create policy "Admins update page sections"
  on public.page_sections for update to authenticated using (true) with check (true);

drop policy if exists "Admins delete page sections" on public.page_sections;
create policy "Admins delete page sections"
  on public.page_sections for delete to authenticated using (true);

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
