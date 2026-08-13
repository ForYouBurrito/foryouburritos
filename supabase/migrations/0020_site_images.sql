-- Owner-replaceable images.
--
-- Text has been editable in place since 0011; images were not, so the most
-- common change a restaurant makes — a new photo of a dish — still needed a
-- developer. This closes that.
--
-- ---------------------------------------------------------------------------
-- Nothing already on the site moves
-- ---------------------------------------------------------------------------
-- Every key below is seeded with the path the page ALREADY renders. The files
-- stay in public/assets/, served free by the static host. Only when the owner
-- uploads a replacement does the value change to a Storage URL — so applying
-- this migration is visually a no-op, and the 33 MB in public/assets/ is not
-- copied into Supabase.
--
-- That also protects the free tier: egress is 5 GB/month, and serving the
-- current 1.7 MB PNGs from Storage would burn it. Uploads are converted to
-- WebP at display size in the browser first (~80 KB), so replaced images cost
-- roughly 5% of what the originals would.
--
-- ---------------------------------------------------------------------------
-- Deliberately NOT editable
-- ---------------------------------------------------------------------------
--   * Menu1_empty.png / Menu2_canvas.png — every dish name and price is
--     positioned as a percentage over those exact images. Replacing one puts
--     all the text in the wrong place. Locked in code, no key here.
--   * menu_categories.image_url — the three cards on the start page. Excluded
--     at the owner's request; the column already exists if that changes.
--
-- Run in SQL Editor after 0019_external_keep_alive.sql.

-- ---------------------------------------------------------------------------
-- Where uploads live
-- ---------------------------------------------------------------------------
-- Public bucket: these are photos on a public marketing site, and a public
-- bucket is served straight from the CDN without signing every URL.
--
-- The size limit is a backstop, not the mechanism — the browser compresses
-- before uploading. It exists so a bug in that step cannot push a 12 MB phone
-- photo into Storage.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images',
  'site-images',
  true,
  2097152,                                            -- 2 MB
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may read (it is a public bucket on a public site); only a signed-in
-- admin may write. Same shape as the content tables.
drop policy if exists "public read site-images"   on storage.objects;
drop policy if exists "admin upload site-images"  on storage.objects;
drop policy if exists "admin update site-images"  on storage.objects;
drop policy if exists "admin delete site-images"  on storage.objects;

create policy "public read site-images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-images');

create policy "admin upload site-images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-images');

create policy "admin update site-images" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-images')
  with check (bucket_id = 'site-images');

create policy "admin delete site-images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-images');

-- ---------------------------------------------------------------------------
-- The slots
-- ---------------------------------------------------------------------------
-- Seeded with what each page renders today. `on conflict do nothing` so a
-- re-run never overwrites an image the owner has since replaced.
insert into public.site_content (key, value, label, multiline) values
  ('hero.background_image',  '/assets/hero2bg-tight.png',  'Startsidan: bakgrundsbild',        false),
  ('hero.storefront_image',  '/assets/omoss-butik.jpg',    'Startsidan: bild på butiken',      false),
  ('meny.hero_image',        '/assets/IMG_8906-scaled.jpg','Meny: toppbild',                   false),
  ('meny.masthead_image',    '/assets/poke-bowl.png',      'Meny: poké-bild',                  false),
  ('kontakt.hero_image',     '/assets/kontakt-hero.jpg',   'Kontakt: toppbild',                false),
  ('kontakt.shopfront_image','/assets/omoss-butik.jpg',    'Kontakt: bild på butiken',         false),
  ('catering.hero_image',    '/assets/varma.png',          'Catering: toppbild',               false),
  ('catering.poke_image',    '/assets/omoss-poke.jpg',     'Catering: bild på maten',          false),
  ('omoss.hero_image',       '/assets/omoss-hero.jpg',     'Om oss: toppbild',                 false),
  ('brand.logo_image',       '/assets/logo.png',           'Logotyp (sidhuvud och sidfot)',    false)
on conflict (key) do nothing;

insert into public.schema_migrations (version, name)
values ('0020', 'site_images') on conflict (version) do nothing;
