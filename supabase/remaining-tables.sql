-- Run this in the Supabase SQL Editor to create the three missing tables.
-- Safe to run on a database that already has the other tables — every
-- statement uses IF NOT EXISTS / IF EXISTS.

-- ---------------------------------------------------------------------------
-- Site settings (business info + SEO defaults)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id              text        primary key default 'main' check (id = 'main'),
  name            text        not null default '',
  legal_name      text        not null default '',
  mission         text        not null default '',
  address         text        not null default '',
  email           text        not null default '',
  phone_primary   text        not null default '',
  phone_secondary text        not null default '',
  whatsapp        text        not null default '',
  facebook        text        not null default '',
  approval        text        not null default '',
  hours           text        not null default '',
  map_query       text        not null default '',
  seo_title       text        not null default '',
  seo_description text        not null default '',
  og_image        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Site content (the repeating lists that make up the marketing pages)
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  id         uuid        primary key default gen_random_uuid(),
  collection text        not null check (char_length(collection) between 1 and 40),
  sort_order int         not null default 0,
  published  boolean     not null default true,
  data       jsonb       not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_content_lookup_idx
  on public.site_content (collection, published, sort_order);

-- ---------------------------------------------------------------------------
-- Page sections (eyebrow, heading and intro above each block of a page)
-- ---------------------------------------------------------------------------
create table if not exists public.page_sections (
  id         uuid        primary key default gen_random_uuid(),
  page       text        not null check (char_length(page) between 1 and 40),
  section    text        not null check (char_length(section) between 1 and 40),
  eyebrow    text        not null default '' check (char_length(eyebrow) <= 80),
  heading    text        not null default '' check (char_length(heading) <= 200),
  intro      text        not null default '' check (char_length(intro) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists page_sections_key_idx
  on public.page_sections (page, section);

-- ---------------------------------------------------------------------------
-- Trigger: keep updated_at current
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

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

drop trigger if exists page_sections_set_updated_at on public.page_sections;
create trigger page_sections_set_updated_at
  before update on public.page_sections
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.site_settings enable row level security;
alter table public.site_content  enable row level security;
alter table public.page_sections enable row level security;

-- site_settings: readable by everyone, writable by staff.
drop policy if exists "Site settings readable by anyone" on public.site_settings;
create policy "Site settings readable by anyone"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins write site settings" on public.site_settings;
create policy "Admins write site settings"
  on public.site_settings for insert to authenticated with check (true);

drop policy if exists "Admins update site settings" on public.site_settings;
create policy "Admins update site settings"
  on public.site_settings for update to authenticated using (true) with check (true);

-- site_content: published rows readable by anyone, full access for admins.
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

-- page_sections: readable by anyone, writable by staff.
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

-- After running this, run: notify pgrst, 'reload schema';
