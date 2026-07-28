-- Storage for the /admin/seo dashboard.
--
-- Google Search Console cannot be called from the browser: it needs a private
-- credential, and everything the admin page loads is public. So the keep-alive
-- workflow — which already runs every 2 days holding secrets — fetches the
-- numbers and writes them here, and the dashboard reads them like any other
-- table. No secret ever reaches the client.
--
-- These tables are OPERATIONAL data, not site content:
--   * `anon` gets nothing. A competitor should not be able to read which search
--     terms bring this restaurant its customers, and the anon key is public.
--   * `authenticated` gets select only.
--   * Writes have no policy at all, so only `service_role` (which bypasses RLS)
--     can insert — that is the GitHub Action and nothing else.
--
-- Every table is safe to be empty. The dashboard renders a "waiting for Google"
-- state rather than an error, because there genuinely is no data until the site
-- has been live and crawled for a few weeks.
--
-- Run in SQL Editor after 0016_keep_alive_status.sql.

-- ---------------------------------------------------------------------------
-- Daily totals — the trend line. One row per calendar day, upserted, so
-- re-running the fetch corrects a day rather than duplicating it.
-- ---------------------------------------------------------------------------
create table if not exists public.seo_daily (
  day          date primary key,
  clicks       integer not null default 0,
  impressions  integer not null default 0,
  ctr          numeric not null default 0,  -- 0..1 as Google returns it
  position     numeric not null default 0,
  fetched_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Top search phrases — the answer to "what should we write on the site".
-- Replaced wholesale on every fetch: this is a current top-N, not a history.
-- ---------------------------------------------------------------------------
create table if not exists public.seo_queries (
  id           uuid primary key default gen_random_uuid(),
  query        text not null,
  clicks       integer not null default 0,
  impressions  integer not null default 0,
  ctr          numeric not null default 0,
  position     numeric not null default 0,
  sort_order   integer not null default 0,
  fetched_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Top pages — which URLs Google actually sends people to.
-- ---------------------------------------------------------------------------
create table if not exists public.seo_pages (
  id           uuid primary key default gen_random_uuid(),
  page         text not null,
  clicks       integer not null default 0,
  impressions  integer not null default 0,
  ctr          numeric not null default 0,
  position     numeric not null default 0,
  sort_order   integer not null default 0,
  fetched_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Core Web Vitals from PageSpeed Insights. Two rows, one per strategy.
-- `performance` is 0-100; the rest are the raw metrics in ms (cls is unitless).
-- ---------------------------------------------------------------------------
create table if not exists public.seo_vitals (
  strategy     text primary key check (strategy in ('mobile', 'desktop')),
  performance  integer,
  lcp_ms       integer,
  cls          numeric,
  inp_ms       integer,
  fetched_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Single-row status. Lets the dashboard say "senast uppdaterad" and, more
-- usefully, surface the reason a fetch failed instead of showing stale numbers
-- as if they were current.
-- ---------------------------------------------------------------------------
create table if not exists public.seo_meta (
  id             integer primary key default 1,
  site_url       text,
  last_fetch_at  timestamptz,
  last_error     text,
  constraint seo_meta_single_row check (id = 1)
);

insert into public.seo_meta (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS — read for signed-in admins, writes for service_role only.
-- ---------------------------------------------------------------------------
alter table public.seo_daily   enable row level security;
alter table public.seo_queries enable row level security;
alter table public.seo_pages   enable row level security;
alter table public.seo_vitals  enable row level security;
alter table public.seo_meta    enable row level security;

create policy "admin read seo_daily"
  on public.seo_daily for select to authenticated using (true);
create policy "admin read seo_queries"
  on public.seo_queries for select to authenticated using (true);
create policy "admin read seo_pages"
  on public.seo_pages for select to authenticated using (true);
create policy "admin read seo_vitals"
  on public.seo_vitals for select to authenticated using (true);
create policy "admin read seo_meta"
  on public.seo_meta for select to authenticated using (true);

-- Ordering the dashboard relies on.
create index if not exists seo_queries_sort_idx on public.seo_queries (sort_order);
create index if not exists seo_pages_sort_idx   on public.seo_pages (sort_order);

insert into public.schema_migrations (version, name)
values ('0017', 'seo_stats') on conflict (version) do nothing;
