-- /kontakt redesign: three new copy keys.
--
-- The page now sets the phone number as its own headline, renders opening hours
-- as a board with today's row picked out, and shows a live open/closed badge in
-- the masthead. That badge and the mail label are the only new strings; every
-- other value on the page still comes from 0010.
--
-- The open/closed state is computed in the browser from the `opening_hours`
-- table in Europe/Stockholm time. It is deliberately conservative: if today's
-- label doesn't resolve to exactly one row, or the row's `hours` doesn't parse
-- as a range (e.g. it says "Stängt"), no badge renders at all. So regrouping
-- rows into "Måndag till torsdag" is safe — it turns the badge off, it does not
-- make the page lie.
--
-- Run in SQL Editor after 0012.

insert into public.site_content (key, value, label, multiline) values
  ('kontakt.email_label',   'MAILA OSS',       'Kontakt: etikett över mailadressen', false),
  ('kontakt.status_open',   'ÖPPET NU',        'Kontakt: badge när vi har öppet',    false),
  ('kontakt.status_closed', 'STÄNGT JUST NU',  'Kontakt: badge när vi har stängt',   false)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Ledger repair.
--
-- 0010, 0011 and 0012 are all applied — verified against the live tables (22
-- kontakt.* keys, 20 meny.* keys, 10 catering.* keys, 13 catering_blocks rows,
-- 29 menu_items rows) — but none of them recorded a version row, so
-- `schema_migrations` still stopped at 0009. Anyone following CLAUDE.md's
-- "check the ledger before writing a migration" would conclude they still need
-- running. Backfilled here; idempotent either way.
--
-- Also note two files both numbered 0009 (`0009_om_oss_images.sql` and
-- `0009_optimised_media_single_location.sql`) share the single 0009 row. The
-- database is in the right state, but that numbering will silently swallow a
-- migration next time.
-- ---------------------------------------------------------------------------
insert into public.schema_migrations (version, name) values
  ('0010', 'kontakt'),
  ('0011', 'meny_catering'),
  ('0012', 'menu_items'),
  ('0013', 'kontakt_status_labels')
on conflict (version) do nothing;
