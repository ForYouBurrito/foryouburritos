-- Point the three /om-oss image slots at the client's own photos.
--
-- The rows already exist (0006, 0007) with an empty value, so this is an update,
-- not an insert. Empty is falsy in useContent(), which means the page has been
-- rendering these from FALLBACK_CONTENT in cms.ts — this migration makes the
-- database agree with the bundle rather than changing what a visitor sees.
--
-- The files are derivatives generated from the originals the client supplied in
-- public/assets/, resized and recompressed (13 MB of source down to ~740 KB):
--
--   omoss-butik.jpg  <- sq.png                      the storefront on Östergatan
--   omoss-poke.jpg   <- Kaeng-Ped-rod-curryww…png   poke bowl, transparent cut-out
--   omoss-sushi.jpg  <- Hideko-Meny-sushi…png       sushi platter, transparent cut-out
--
-- The last two were transparent PNGs, flattened onto the exact background colour
-- of the section they sit in (#f6f6f4 and white). They read as floating cut-outs
-- but cost a quarter of the bytes. If a section's background colour changes,
-- regenerate them — a flattened image on a mismatched background shows its box.
--
-- Run in SQL Editor after 0008.

update public.site_content set value = '/assets/omoss-butik.jpg' where key = 'omoss.intro_image';
update public.site_content set value = '/assets/omoss-poke.jpg'  where key = 'omoss.philosophy_image';
update public.site_content set value = '/assets/omoss-sushi.jpg' where key = 'omoss.vision_image';

insert into public.schema_migrations (version, name)
values ('0009', 'om_oss_images') on conflict (version) do nothing;
