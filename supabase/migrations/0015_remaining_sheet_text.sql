-- Every remaining piece of menu-sheet text that rendered but could not be edited.
--
-- All the same mistake as 0014: a field drawn as several separately positioned
-- elements cannot be edited in place, because one contentEditable cannot span
-- them. Each positioned element needs its own row.
--
--   * s1.lunch.<box>.<line>  — the three contents lines in each lunch box
--   * s1.poke.intro          — the "Alla Bowls Ingår…" line above the poke bowls
--   * s2.valfri.heading      — the VALFRI MENY box heading
--   * s2.till.<n>.tier.<i>   — the two-tier quantity/price pairs. `name` holds the
--                              quantity ("6st"), `price` holds that tier's price.
--
-- The two-tier prices matter most: 0013 packed them into one pipe-separated
-- field, so they rendered from the database but were not clickable.
--
-- Run in SQL Editor after 0014_menyer_subrows.sql.

insert into public.menu_items (sheet, section, slug, name, price, sort_order)
select * from (values
  -- sheet 1: poke bowls intro
  (1, 'poke_intro', 's1.poke.intro',
   'Alla Bowls Ingår: Ris, Edamamebönor, Wakame Sallad, Mango, Sesam, Picklad rödlök, Chilimayo, Teriyaki, Gurka, Vårlök & Avokado',
   '', 1::smallint),

  -- sheet 1: lunch box contents, three lines per box
  (1, 'lunch_row', 's1.lunch.1.1', '6 Bitar Philadelphia Roll', '', 1::smallint),
  (1, 'lunch_row', 's1.lunch.1.2', '4 Bitar Maki Avokado', '', 2::smallint),
  (1, 'lunch_row', 's1.lunch.1.3', '4 Olika Nigiri Bitar', '', 3::smallint),
  (1, 'lunch_row', 's1.lunch.2.1', '6 Bitar Crispy Chicken Roll', '', 4::smallint),
  (1, 'lunch_row', 's1.lunch.2.2', '4 Bitar Maki Kappa (VEGETARISK)', '', 5::smallint),
  (1, 'lunch_row', 's1.lunch.2.3', '4 Olika Nigiri Bitar', '', 6::smallint),
  (1, 'lunch_row', 's1.lunch.3.1', '6 Bitar Fried Ebi Roll', '', 7::smallint),
  (1, 'lunch_row', 's1.lunch.3.2', '4 Bitar Maki Ebi', '', 8::smallint),
  (1, 'lunch_row', 's1.lunch.3.3', '4 Olika Nigiri Bitar', '', 9::smallint),

  -- sheet 2: valfri meny heading
  (2, 'valfri_head', 's2.valfri.heading', 'VALFRI MENY', '', 1::smallint),

  -- sheet 2: two-tier quantity/price pairs
  (2, 'till_tier', 's2.till.3.tier.1', '6st',  '74:-', 1::smallint),
  (2, 'till_tier', 's2.till.3.tier.2', '10st', '99:-', 2::smallint),
  (2, 'till_tier', 's2.till.4.tier.1', '6st',  '49:-', 3::smallint),
  (2, 'till_tier', 's2.till.4.tier.2', '9st',  '69:-', 4::smallint)
) as v(sheet, section, slug, name, price, sort_order)
where not exists (select 1 from public.menu_items where section = 'lunch_row');

-- Retire the packed copies now that each element owns its own text.
update public.menu_items set description = '' where slug like 's1.lunch._';
update public.menu_items set price = '' where slug in ('s2.till.3', 's2.till.4');

insert into public.schema_migrations (version, name)
values ('0015', 'remaining_sheet_text') on conflict (version) do nothing;
