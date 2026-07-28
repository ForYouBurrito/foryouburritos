-- OmOss.tsx renders a third optional image (`omoss.vision_image`) that 0006 never
-- seeded. useAboutImage() ignores a missing key, so the page looks fine — but the
-- admin form lists site_content rows, so with no row there is no field, and the
-- image can never be set. This adds the missing row.
--
-- Run in SQL Editor after 0006.

insert into public.site_content (key, value, label, multiline) values
  ('omoss.vision_image', '', 'Om oss: bild vision (URL, valfri)', false)
on conflict (key) do nothing;

insert into public.schema_migrations (version, name)
values ('0007', 'om_oss_vision_image') on conflict (version) do nothing;
