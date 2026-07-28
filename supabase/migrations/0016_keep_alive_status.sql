-- Lets the admin panel warn when the keep-alive has stopped running.
--
-- `keep_alive` was created in 0001 with RLS on and zero policies, so nothing
-- except the service_role could read it. That is still right for the public: the
-- heartbeat is operational data, not site content. But a signed-in admin needs to
-- see it, because a silent keep-alive failure is exactly the kind of thing nobody
-- notices until the database has already paused and the site is showing stale text.
--
-- Read-only, and authenticated only. Writes stay service_role.
--
-- Run in SQL Editor after 0015_remaining_sheet_text.sql.

create policy "admin read keep_alive"
  on public.keep_alive for select to authenticated using (true);

insert into public.schema_migrations (version, name)
values ('0016', 'keep_alive_status') on conflict (version) do nothing;
