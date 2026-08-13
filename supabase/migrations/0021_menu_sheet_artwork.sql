-- The last two fixed images: the menu sheet backgrounds.
--
-- 0020 deliberately left these out. They are now included at the owner's
-- request, but they are NOT like the other slots and the difference is worth
-- stating plainly:
--
--   Every dish name, price and descriptor on /meny is a real text element
--   positioned as a PERCENTAGE of the artwork behind it. `Menu1_empty.png` and
--   `Menu2_canvas.png` are the printed spreads with the item lines erased —
--   the text is drawn back on in code, which is what makes the menu
--   selectable, searchable and editable.
--
--   So a replacement is only safe if it has the same layout and proportions as
--   the file it replaces: a regenerated blank of the same spread, at the same
--   design size (1024x724 for sheet 01, 1440-wide for 02). Any other picture
--   leaves 130-odd menu rows floating over an unrelated photo.
--
-- The editor says so at the point of upload rather than relying on this file
-- being read. There is no way to detect a wrong image automatically — it is a
-- judgement about layout, not about pixels.
--
-- Run in SQL Editor after 0020_site_images.sql.

insert into public.site_content (key, value, label, multiline) values
  ('meny.sheet1_artwork', '/assets/Menu1_empty.png',
   'Meny blad 01: bakgrund (måste ha samma mått)', false),
  ('meny.sheet2_artwork', '/assets/Menu2_canvas.png',
   'Meny blad 02: bakgrund (måste ha samma mått)', false)
on conflict (key) do nothing;

insert into public.schema_migrations (version, name)
values ('0021', 'menu_sheet_artwork') on conflict (version) do nothing;
