-- Separate the header logo from the footer logo.
--
-- 0020 gave both one key, `brand.logo_image`, so replacing either changed both.
-- That is wrong for this site: the two are not the same picture doing the same
-- job. The header mark sits on white at 36-48px tall; the footer mark sits on
-- navy under a feathered white wash, at a different size and in two different
-- lockups (a centred one on phones, a left-anchored one on desktop). A logo
-- that reads well in one can read badly in the other.
--
-- After this:
--   * brand.logo_header — every page's top navigation, and the admin login page
--   * brand.logo_footer — every page's footer, BOTH the mobile and desktop
--                         lockups, since those are one mark shown twice
--
-- Changing either still changes it site-wide, which is the point — a logo is
-- one brand asset, not a per-page decoration. They are simply two assets now.
--
-- Both inherit whatever `brand.logo_image` currently holds rather than being
-- reset to the shipped file, so a logo already replaced through the editor
-- survives this migration instead of silently reverting.
--
-- Run in SQL Editor after 0021_menu_sheet_artwork.sql.

insert into public.site_content (key, value, label, multiline)
select
  'brand.logo_header',
  coalesce((select value from public.site_content where key = 'brand.logo_image'), '/assets/logo.png'),
  'Logotyp: sidhuvud (alla sidor)',
  false
on conflict (key) do nothing;

insert into public.site_content (key, value, label, multiline)
select
  'brand.logo_footer',
  coalesce((select value from public.site_content where key = 'brand.logo_image'), '/assets/logo.png'),
  'Logotyp: sidfot (alla sidor)',
  false
on conflict (key) do nothing;

-- Nothing reads it any more. Left in place it would show up under "VISA ALLT"
-- in /admin/settings as a field that looks editable and changes nothing —
-- worse than not being there.
delete from public.site_content where key = 'brand.logo_image';

insert into public.schema_migrations (version, name)
values ('0022', 'split_logo') on conflict (version) do nothing;
