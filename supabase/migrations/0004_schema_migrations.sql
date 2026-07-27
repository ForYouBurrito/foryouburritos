-- Phase 1/2 bookkeeping: a ledger of which migration files have actually been
-- applied to this project. We apply SQL by hand in the dashboard rather than via
-- the Supabase CLI, so without this the migrations/ folder records intent only.
--
-- Deliberately readable with the anon key: it contains filenames, not data, and
-- being queryable over REST is the whole point — it lets anyone (or any agent)
-- check applied state without dashboard access.
--
-- Run in SQL Editor after 0003.

create table if not exists public.schema_migrations (
  version     text primary key,   -- '0001'
  name        text not null,      -- 'cms_schema'
  applied_at  timestamptz not null default now()
);

alter table public.schema_migrations enable row level security;

create policy "public read schema_migrations"
  on public.schema_migrations for select to anon, authenticated using (true);

-- Backfill everything applied so far.
insert into public.schema_migrations (version, name) values
  ('0001', 'cms_schema'),
  ('0002', 'seed_content'),
  ('0003', 'keep_alive_rpc'),
  ('0004', 'schema_migrations')
on conflict (version) do nothing;

-- CONVENTION: every future migration file ends with its own insert, e.g.
--   insert into public.schema_migrations (version, name)
--   values ('0005', 'admin_profiles') on conflict (version) do nothing;
