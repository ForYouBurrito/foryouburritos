-- Phase 2: the function GitHub Actions calls to keep the project awake.
-- Run in Supabase Dashboard -> SQL Editor, after 0001 and 0002.

create or replace function public.keep_alive_ping()
returns table (pinged_at timestamptz, ping_count bigint)
language sql
security definer          -- runs as owner, so it works despite keep_alive's zero RLS policies
set search_path = public
as $$
  update public.keep_alive
     set pinged_at  = now(),
         ping_count = ping_count + 1
   where id = 1
  returning pinged_at, ping_count;
$$;

-- Only the service_role key (used by the Actions job) may call this.
revoke execute on function public.keep_alive_ping() from public, anon, authenticated;
grant  execute on function public.keep_alive_ping() to service_role;
