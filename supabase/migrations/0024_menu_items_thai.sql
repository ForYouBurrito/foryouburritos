-- Adds the Thai category to /meny, editable through /admin/edit like the rest.
--
-- DESIGN: this is the first menu section with no printed spread behind it. Sheets
-- 1 and 2 exist as artwork, so their `sheet` number identifies a scan and their
-- slugs identify a fixed slot in it — which is why items there cannot be added or
-- removed from the admin UI (a sixth burrito stick has nowhere to go).
--
-- Sheet 3 has no such constraint. `MenuThai.tsx` lays the rows out in a flow grid,
-- so the number here is only a grouping key for the fetch and the section grows or
-- shrinks with the rows. Adding a seventh dish is an INSERT, not a redesign.
--
-- Prices are stored with the site's own ':-' rather than the ordering system's
-- 'kr' — every other price on /meny reads '119:-', and the two side by side look
-- like a mistake. 'Från' is kept where the dish is priced by protein choice.
--
-- Run in SQL Editor after 0023_footer_logo_white.sql.

-- ---------------------------------------------------------------------------
-- Section heading. Mirrored in FALLBACK_CONTENT in src/lib/cms.ts — the two must
-- agree or visitors see the old text flash before the fetch resolves.
-- ---------------------------------------------------------------------------
insert into public.site_content (key, value, label, multiline) values
  ('meny.thai_title', 'THAI',                                                                    'Meny: Thai rubrik',       false),
  ('meny.thai_sub',   'Currygrytor, nudlar och friterade favoriter — lagade på beställning.',    'Meny: Thai underrubrik',  false)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- The dishes. Verbatim from the client's ordering system — this is a real
-- restaurant's menu, so names, prices and descriptions must match the source
-- exactly, including its own capitalisation.
-- ---------------------------------------------------------------------------
insert into public.menu_items (sheet, section, slug, name, price, description, sort_order)
select * from (values
  (3, 'thai', 's3.thai.1', 'Panko Chicken', '119:-',
   'Marinerad kyckling med ris & jordnötssås.', 1::smallint),
  (3, 'thai', 's3.thai.2', 'Koong Tod', '119:-',
   'Friterade tigerräkor med sweetchilisås och ris.', 2::smallint),
  (3, 'thai', 's3.thai.3', 'Pad Thai', 'Från 119:-',
   'Stekta risnudlar med pad thai sås, ägg, krossade jordnötter, böngroddar', 3::smallint),
  (3, 'thai', 's3.thai.4', 'Kaeng Ped', 'Från 119:-',
   'Röd currygryta, limeblad, bambuskott, thaibasilika, paprika, zucchini, sockerärtor, kokosmjölk och ris. Välj protein i nästa steg.', 4::smallint),
  (3, 'thai', 's3.thai.5', 'Kaen Khiew Wan', 'Från 119:-',
   'Grön currygryta. thaibasilika, Limeblad, chili, bambu, thaibasilika och serveras med ris.', 5::smallint),
  (3, 'thai', 's3.thai.6', 'Kaeng Ped Noodles', 'Från 119:-',
   'Stekta nudlar i röd currygryta med zucchini, paprika, bambuskott, thaibasilika, sockerärtor och kokosmjölk.', 6::smallint)
) as v(sheet, section, slug, name, price, description, sort_order)
where not exists (select 1 from public.menu_items where sheet = 3);

insert into public.schema_migrations (version, name)
values ('0024', 'menu_items_thai') on conflict (version) do nothing;
