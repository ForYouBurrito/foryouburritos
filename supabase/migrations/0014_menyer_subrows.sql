-- Fixes the sushi-menyer sub-lists on sheet 02 being uneditable.
--
-- 0013 packed each menu's contents into that menu's `description`, rows separated
-- by newline and columns by "|". It renders correctly, but a single field cannot
-- be edited in place when it is drawn as up to 15 separately positioned cells —
-- so the small text under each menu name had no way to be clicked.
--
-- Each cell now gets its own row, keyed by its slot: s2.menyer.<menu>.<row>.<col>.
-- The cell text lives in `name`; `price` and `description` are unused here.
--
-- The old packed `description` on the menyer rows is cleared at the end: the text
-- now lives in these rows, and leaving a stale copy behind would be a second
-- source of truth that nothing renders.
--
-- Run in SQL Editor after 0013_menu_items_sheet2.sql.

insert into public.menu_items (sheet, section, slug, name, sort_order)
select * from (values
  -- 1. NIGIRI MENY
  (2, 'menyer_sub', 's2.menyer.1.1.1', 'Valfri', 1::smallint),
  -- 2. LAX MENY
  (2, 'menyer_sub', 's2.menyer.2.1.1', '6 st Nigiri Shake  ·  8 st Philadelphia', 2::smallint),
  -- 3. YOKOHAMA MENY
  (2, 'menyer_sub', 's2.menyer.3.1.1', '8 st Blandade Nigiri  ·  8 st Inside-Out Philadelphia', 3::smallint),

  -- 4. CHICKEN ROLL MENY
  (2, 'menyer_sub', 's2.menyer.4.1.1', '6 st Maki Chicken', 4::smallint),
  (2, 'menyer_sub', 's2.menyer.4.1.2', '7 st For you Chicken', 5::smallint),
  (2, 'menyer_sub', 's2.menyer.4.2.1', '8 st Inside-Out Chicken', 6::smallint),
  (2, 'menyer_sub', 's2.menyer.4.2.2', '8 st Inside-Out Crispy Chicken', 7::smallint),

  -- 5. TAIYO MENY
  (2, 'menyer_sub', 's2.menyer.5.1.1', '6 st Maki Avokado', 8::smallint),
  (2, 'menyer_sub', 's2.menyer.5.1.2', '7 st For you Salmon', 9::smallint),
  (2, 'menyer_sub', 's2.menyer.5.2.1', '8 st Inside-Out Alaska', 10::smallint),
  (2, 'menyer_sub', 's2.menyer.5.2.2', '8 st Inside-Out Friterad crabstick', 11::smallint),

  -- 6. SUPER MENY
  (2, 'menyer_sub', 's2.menyer.6.1.1', '20 st Blandade Nigiri', 12::smallint),
  (2, 'menyer_sub', 's2.menyer.6.1.2', '6 st Maki Shake', 13::smallint),
  (2, 'menyer_sub', 's2.menyer.6.2.1', '8 st Inside-Out Ebi Avokado', 14::smallint),
  (2, 'menyer_sub', 's2.menyer.6.2.2', '8 st Inside-Out Tekka', 15::smallint),

  -- 7. PARTY MENY
  (2, 'menyer_sub', 's2.menyer.7.1.1', '25 st Blandad Nigiri', 16::smallint),
  (2, 'menyer_sub', 's2.menyer.7.2.1', '6 st Maki Shake Avokado', 17::smallint),
  (2, 'menyer_sub', 's2.menyer.7.2.2', '8 st Inside-Out Philadelphia', 18::smallint),
  (2, 'menyer_sub', 's2.menyer.7.3.1', '6 st Maki Kappa', 19::smallint),
  (2, 'menyer_sub', 's2.menyer.7.3.2', '8 st Inside-Out Alaska', 20::smallint),

  -- 8. XL MENY
  (2, 'menyer_sub', 's2.menyer.8.1.1', '6 st Blandade Nigiri', 21::smallint),
  (2, 'menyer_sub', 's2.menyer.8.2.1', '6 st Maki Shake Avokado', 22::smallint),
  (2, 'menyer_sub', 's2.menyer.8.2.2', '6 st Maki Ebi', 23::smallint),
  (2, 'menyer_sub', 's2.menyer.8.3.1', '6 st Maki Shake', 24::smallint),
  (2, 'menyer_sub', 's2.menyer.8.3.2', '8 st Inside-Out Philadelphia', 25::smallint),
  (2, 'menyer_sub', 's2.menyer.8.4.1', '6 st Maki Kappa', 26::smallint),
  (2, 'menyer_sub', 's2.menyer.8.4.2', '8 st Inside-Out Alaska', 27::smallint),
  (2, 'menyer_sub', 's2.menyer.8.5.1', '6 st Maki Tuna', 28::smallint),
  (2, 'menyer_sub', 's2.menyer.8.5.2', '8 st Inside-Out Ebi Avokado', 29::smallint),

  -- 9. XXL MENY
  (2, 'menyer_sub', 's2.menyer.9.1.1', '4 st Nigiri Shake', 30::smallint),
  (2, 'menyer_sub', 's2.menyer.9.1.2', '4 st Nigiri Tuna', 31::smallint),
  (2, 'menyer_sub', 's2.menyer.9.1.3', '4 st Nigiri Ebi', 32::smallint),
  (2, 'menyer_sub', 's2.menyer.9.2.1', '12 st Maki Kappa', 33::smallint),
  (2, 'menyer_sub', 's2.menyer.9.2.2', '12 st Maki Tuna', 34::smallint),
  (2, 'menyer_sub', 's2.menyer.9.2.3', '12 st Maki Shake', 35::smallint),
  (2, 'menyer_sub', 's2.menyer.9.3.1', '16 st Inside-Out Philadelphia', 36::smallint),
  (2, 'menyer_sub', 's2.menyer.9.3.2', '16 st Inside-Out Tekka', 37::smallint),
  (2, 'menyer_sub', 's2.menyer.9.4.1', '16 st California Roll', 38::smallint)
) as v(sheet, section, slug, name, sort_order)
where not exists (select 1 from public.menu_items where section = 'menyer_sub');

-- Retire the packed copy now that the cells own the text.
update public.menu_items set description = '' where sheet = 2 and section = 'menyer';

insert into public.schema_migrations (version, name)
values ('0014', 'menyer_subrows') on conflict (version) do nothing;
