-- Phase 1: CMS schema for For You Burritos
-- Run in Supabase Dashboard -> SQL Editor -> New query -> Run

-- ---------------------------------------------------------------------------
-- Shared: updated_at trigger
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

-- ---------------------------------------------------------------------------
-- site_content: loose copy, keyed by dotted path (hero.title, menu.heading, ...)
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  key         text primary key,
  value       text not null default '',
  label       text not null,              -- human label shown in the admin UI
  multiline   boolean not null default false,
  updated_at  timestamptz not null default now()
);

create trigger site_content_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- feature_tiles: the three trust badges under the hero
-- ---------------------------------------------------------------------------
create table if not exists public.feature_tiles (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subtitle    text not null default '',
  icon        text not null default 'Fish',   -- lucide-react icon name
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create index if not exists feature_tiles_sort_idx on public.feature_tiles (sort_order);

create trigger feature_tiles_updated_at
  before update on public.feature_tiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- menu_categories: the "UPPTÄCK VÅR MENY" cards
-- ---------------------------------------------------------------------------
create table if not exists public.menu_categories (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null default '',
  image_url    text not null default '',
  link_url     text not null default '',
  sort_order   smallint not null default 0,
  is_active    boolean not null default true,
  updated_at   timestamptz not null default now()
);

create index if not exists menu_categories_sort_idx on public.menu_categories (sort_order);

create trigger menu_categories_updated_at
  before update on public.menu_categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- locations: the "BESÖK OSS" cards
-- ---------------------------------------------------------------------------
create table if not exists public.locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address1    text not null default '',
  address2    text not null default '',
  map_query   text not null default '',     -- fed to the Google Maps embed
  order_url   text not null default '',
  site_url    text not null default '',
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create index if not exists locations_sort_idx on public.locations (sort_order);

create trigger locations_updated_at
  before update on public.locations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- keep_alive: single-row heartbeat pinged by GitHub Actions (Phase 2).
-- Isolated from content tables so the cron job can never touch live copy.
-- ---------------------------------------------------------------------------
create table if not exists public.keep_alive (
  id          smallint primary key default 1,
  pinged_at   timestamptz not null default now(),
  ping_count  bigint not null default 0,
  constraint keep_alive_single_row check (id = 1)
);

insert into public.keep_alive (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security: public reads, authenticated writes
-- ---------------------------------------------------------------------------
alter table public.site_content    enable row level security;
alter table public.feature_tiles   enable row level security;
alter table public.menu_categories enable row level security;
alter table public.locations       enable row level security;
alter table public.keep_alive      enable row level security;

-- Public (anon key) may read content only.
create policy "public read site_content"    on public.site_content    for select to anon, authenticated using (true);
create policy "public read feature_tiles"   on public.feature_tiles   for select to anon, authenticated using (true);
create policy "public read menu_categories" on public.menu_categories for select to anon, authenticated using (true);
create policy "public read locations"       on public.locations       for select to anon, authenticated using (true);

-- Signed-in admins may write.
create policy "admin write site_content"    on public.site_content    for all to authenticated using (true) with check (true);
create policy "admin write feature_tiles"   on public.feature_tiles   for all to authenticated using (true) with check (true);
create policy "admin write menu_categories" on public.menu_categories for all to authenticated using (true) with check (true);
create policy "admin write locations"       on public.locations       for all to authenticated using (true) with check (true);

-- keep_alive: no anon or authenticated policies at all. RLS is on with zero
-- permissive policies, so it is unreachable except via the service_role key
-- (which bypasses RLS) used by the GitHub Actions job.
