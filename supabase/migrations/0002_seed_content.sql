-- Phase 1 seed: current hardcoded copy from src/pages/Index.tsx.
-- Idempotent — safe to re-run. Run AFTER 0001_cms_schema.sql.

-- ---------------------------------------------------------------------------
-- site_content
-- ---------------------------------------------------------------------------
insert into public.site_content (key, value, label, multiline) values
  ('seo.title',            'For You Burritos — Sushi möter Burrito',                                  'SEO: sidtitel',            false),
  ('seo.description',      'Japanese precision. Mexican vibes. Beställ online eller besök oss i Malmö och Lund.', 'SEO: metabeskrivning', true),

  ('header.cta_label',     'BESTÄLL ONLINE',                                                          'Header: knapptext',        false),
  ('header.cta_url',       'https://foryou.qopla.com/restaurant/for-you-burritos-/qRbQ9pebDD/order',  'Header: knapplänk',        false),

  ('hero.title_line1',     'SHUSHI',                                                                  'Hero: rubrik rad 1',       false),
  ('hero.title_line2',     'BURRITO',                                                                 'Hero: rubrik rad 2 (röd)', false),
  ('hero.tagline',         E'JAPANESE PRECISION.\nMEXICAN VIBES.',                                    'Hero: slogan',             true),
  ('hero.cta_order_label', 'BESTÄLL ONLINE',                                                          'Hero: primär knapp',       false),
  ('hero.cta_menu_label',  'VÅR MENY',                                                                'Hero: sekundär knapp',     false),
  ('hero.image_url',       '/assets/hero2.png',                                                       'Hero: bild',               false),

  ('menu.heading',         'UPPTÄCK VÅR MENY',                                                        'Meny: rubrik',             false),
  ('menu.subheading',      'Sushi möter burrito. Tre kategorier, oändliga möjligheter.',              'Meny: underrubrik',        true),
  ('menu.card_cta_label',  'SE MENYN',                                                                'Meny: länktext på kort',   false),

  ('locations.heading',    'BESÖK OSS',                                                               'Platser: rubrik',          false),
  ('locations.subheading', 'Tre platser. Samma passion. Välj din favorit och beställ eller besök oss idag.', 'Platser: underrubrik', true),
  ('locations.cta_order_label', 'BESTÄLL ONLINE',                                                     'Platser: knapp 1',         false),
  ('locations.cta_site_label',  'VÅR HEMSIDA',                                                        'Platser: knapp 2',         false)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- feature_tiles
-- ---------------------------------------------------------------------------
insert into public.feature_tiles (title, subtitle, icon, sort_order)
select * from (values
  ('FÄRSKA RÅVAROR', 'Varje dag',      'Fish',  1::smallint),
  ('HANDRULLADE',    'Med passion',    'Hand',  2::smallint),
  ('DJÄRVA SMAKER',  'Som sticker ut', 'Flame', 3::smallint)
) as v(title, subtitle, icon, sort_order)
where not exists (select 1 from public.feature_tiles);

-- ---------------------------------------------------------------------------
-- menu_categories
-- ---------------------------------------------------------------------------
insert into public.menu_categories (title, description, image_url, link_url, sort_order)
select * from (values
  ('SUSHI',                 E'Klassiska smaker.\nJapansk tradition.',            '/assets/sushi.png',     'https://foryouburritos.se/', 1::smallint),
  ('VARMA THAIRÄTTER',      E'Kryddstarka favoriter.\nLagade på beställning.',   '/assets/varma.png',     'https://foryouburritos.se/', 2::smallint),
  ('FRITERADE THAIRÄTTER',  E'Krispigt, smakrikt\noch alltid mättande.',         '/assets/friterade.png', 'https://foryouburritos.se/', 3::smallint)
) as v(title, description, image_url, link_url, sort_order)
where not exists (select 1 from public.menu_categories);

-- ---------------------------------------------------------------------------
-- locations
-- ---------------------------------------------------------------------------
insert into public.locations (name, address1, address2, map_query, order_url, site_url, sort_order)
select * from (values
  ('Västra Hamnen', 'Einar Hansens Esplanad 31,', '211 75 Malmö',
   'Einar Hansens Esplanad 31, 211 75 Malmö',
   'https://foryou.qopla.com/restaurant/thai-n-sushi-for-you---vastra-hamnen/qomYBBd13K/order',
   'https://foryouburritos.se/', 1::smallint),
  ('Caroli', 'Östergatan 21,', '211 25 Malmö',
   'Östergatan 21, 211 25 Malmö',
   'https://foryou.qopla.com/restaurant/for-you-burritos-/qRbQ9pebDD/order',
   'https://foryouburritos.se/', 2::smallint),
  ('Caroli', 'Kyrkogatan 21,', '222 22 Lund, Sweden',
   'Kyrkogatan 21, 222 22 Lund',
   'https://foryou.qopla.com/restaurant/for-you-burritos-/qRbQ9pebDD/order',
   'https://www.thaisushiforyou.se/', 3::smallint)
) as v(name, address1, address2, map_query, order_url, site_url, sort_order)
where not exists (select 1 from public.locations);
