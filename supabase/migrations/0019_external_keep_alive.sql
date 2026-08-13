-- A second, independent way to keep the database awake.
--
-- Everything today hangs off one thread: GitHub Actions. If that stops — the
-- free tier changes, the repo is archived, a scheduled workflow gets disabled,
-- the deploy key is removed — nothing pings Supabase, it pauses after 7 days,
-- and the live site quietly falls back to the copy hardcoded in the JS bundle.
-- Every edit the client has made since launch disappears from view.
--
-- So this adds a path that does not involve GitHub at all: a function any
-- external cron service can call with the PUBLIC anon key.
--
-- ---------------------------------------------------------------------------
-- Why a public write function is acceptable here
-- ---------------------------------------------------------------------------
-- It updates one timestamp on one row of a table holding no content. There is
-- nothing to read, nothing to corrupt and nothing to leak. The realistic abuse
-- is someone calling it repeatedly, which costs a single UPDATE and is exactly
-- what it is for.
--
-- The one genuine downside: a caller hammering this would keep `pinged_at`
-- fresh and could mask a GitHub failure. That is why the two sources are
-- tracked SEPARATELY below — the admin warning watches `github_at`, so the
-- backup keeping the site up never hides the fact that the primary died.
--
-- Run in SQL Editor after 0018_page_seo.sql.

-- ---------------------------------------------------------------------------
-- Tell the two sources apart
-- ---------------------------------------------------------------------------
alter table public.keep_alive
  add column if not exists source    text,
  add column if not exists github_at timestamptz;

-- The existing row was pinged by the GitHub job, so seed github_at from it
-- rather than leaving it null and tripping the warning on the next page load.
update public.keep_alive
   set github_at = coalesce(github_at, pinged_at),
       source    = coalesce(source, 'github')
 where id = 1;

-- ---------------------------------------------------------------------------
-- The GitHub job's function, now also stamping github_at
-- ---------------------------------------------------------------------------
create or replace function public.keep_alive_ping()
returns table (pinged_at timestamptz, ping_count bigint)
language sql
security definer          -- runs as owner, so it works despite keep_alive's zero RLS policies
set search_path = public
as $$
  update public.keep_alive
     set pinged_at  = now(),
         github_at  = now(),
         ping_count = ping_count + 1,
         source     = 'github'
   where id = 1
  returning pinged_at, ping_count;
$$;

revoke execute on function public.keep_alive_ping() from public, anon, authenticated;
grant  execute on function public.keep_alive_ping() to service_role;

-- ---------------------------------------------------------------------------
-- The external safeguard
-- ---------------------------------------------------------------------------
-- Deliberately does NOT touch github_at: this is the backup reporting in, not
-- evidence that the primary is alive.
--
-- Returns nothing useful on purpose — a cron service only needs a 200.
create or replace function public.keep_alive_ping_external()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  update public.keep_alive
     set pinged_at  = now(),
         ping_count = ping_count + 1,
         source     = 'external'
   where id = 1
  returning pinged_at;
$$;

-- The anon key is public by design, so this is callable by anyone who has the
-- project URL. See the note at the top for why that is fine.
grant execute on function public.keep_alive_ping_external() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Let the admin panel read the new columns
-- ---------------------------------------------------------------------------
-- 0016 already granted authenticated select on keep_alive; the added columns
-- are covered by it. Nothing further is needed here.

insert into public.schema_migrations (version, name)
values ('0019', 'external_keep_alive') on conflict (version) do nothing;
