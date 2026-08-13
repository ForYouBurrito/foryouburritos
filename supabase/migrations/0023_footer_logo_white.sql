-- Point the footer logo at its own white/outline lockup instead of the plain
-- black mark. 0022 gave header and footer separate keys but seeded both from
-- the same file; the footer copy relied on a light backing plate (removed in
-- the same change as this migration) to stay legible on navy. The new file
-- is white/outlined by design, so it sits directly on the navy footer with
-- no plate needed.
--
-- Guarded on the value still being the shipped default so a logo the owner
-- already replaced through /admin/edit is left alone rather than reverted.
--
-- Run in SQL Editor after 0022_split_logo.sql.

update public.site_content
set value = '/assets/Footer_logo_white.png'
where key = 'brand.logo_footer'
  and value = '/assets/logo.png';

insert into public.schema_migrations (version, name)
values ('0023', 'footer_logo_white') on conflict (version) do nothing;
