-- Makes the dish names, prices and descriptions on /meny editable.
--
-- DESIGN: the CMS owns the words, the code owns the layout. Every item on a menu
-- sheet is positioned against the printed artwork in design pixels, so
-- coordinates, sizes and fonts stay in MenuSheet1/2.tsx. Only the text lives here.
--
-- Rows are matched to their slot by `slug`, which is positional (s1.poke.1) rather
-- than name-derived — renaming "SUJUK BOWL" in the admin UI must not orphan its
-- row. Items cannot be added or removed from the admin UI: each one occupies a
-- fixed slot in the artwork, and a sixth burrito stick has nowhere to go.
--
-- Run in SQL Editor after 0011_meny_catering.sql.

create table if not exists public.menu_items (
  id           uuid primary key default gen_random_uuid(),
  sheet        smallint not null,        -- 1 or 2
  section      text not null,            -- 'poke', 'sticks', 'burritos', …
  slug         text not null unique,     -- 's1.poke.1' — the artwork slot
  name         text not null,
  price        text not null default '', -- text, not numeric: the print reads "179:-"
  description  text not null default '', -- '\n' separates the lunch-box rows
  sort_order   smallint not null default 0,
  is_active    boolean not null default true,
  updated_at   timestamptz not null default now()
);

create index if not exists menu_items_sheet_idx on public.menu_items (sheet, section, sort_order);

create trigger menu_items_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

alter table public.menu_items enable row level security;

create policy "public read menu_items"
  on public.menu_items for select to anon, authenticated using (true);
create policy "admin write menu_items"
  on public.menu_items for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Sheet 01. Verbatim from MenuSheet1.tsx — this is a real restaurant's menu, so
-- every name, price and ingredient list must match the source exactly.
-- ---------------------------------------------------------------------------
insert into public.menu_items (sheet, section, slug, name, price, description, sort_order)
select * from (values
  -- poke bowls
  (1, 'poke', 's1.poke.1', 'SUJUK BOWL',           '179:-', 'Sujuk', 1::smallint),
  (1, 'poke', 's1.poke.2', 'YAKINIKU BOWL',        '159:-', 'Yakiniku (Marinerad Biff)', 2::smallint),
  (1, 'poke', 's1.poke.3', 'SHRIMP BOWL',          '145:-', 'Räkor', 3::smallint),
  (1, 'poke', 's1.poke.4', 'TOFU BOWL',            '130:-', 'Tofu', 4::smallint),
  (1, 'poke', 's1.poke.5', 'TUNA BOWL',            '145:-', 'Tonfisk', 5::smallint),
  (1, 'poke', 's1.poke.6', 'SALMON BOWL',          '155:-', 'Lax', 6::smallint),
  (1, 'poke', 's1.poke.7', 'CRISPY CHICKEN BOWL',  '129:-', 'Panko (Friterad Kyckling)', 7::smallint),

  -- burrito sticks (the 59:- / 99:- block under these is artwork, not text)
  (1, 'sticks', 's1.sticks.1', 'Burrito stick Lax',      '', 'Avokado, lax', 1::smallint),
  (1, 'sticks', 's1.sticks.2', 'Burrito stick Kyckling', '', 'Cream cheese, kyckling', 2::smallint),
  (1, 'sticks', 's1.sticks.3', 'Burrito stick Råkor',    '', 'Cream cheese, gurka, räkor', 3::smallint),
  (1, 'sticks', 's1.sticks.4', 'Burrito stick Biff',     '', 'Biff, rödlök', 4::smallint),
  (1, 'sticks', 's1.sticks.5', 'Burrito stick Veg',      '', 'Cream cheese, gurka, avokado', 5::smallint),

  -- tillägg
  (1, 'tillagg', 's1.tillagg.1', 'CHILIMAYO',        '15:-', '', 1::smallint),
  (1, 'tillagg', 's1.tillagg.2', 'MANGO CURRY SÅS',  '15:-', '', 2::smallint),
  (1, 'tillagg', 's1.tillagg.3', 'AVOKADO SÅS',      '15:-', '', 3::smallint),
  (1, 'tillagg', 's1.tillagg.4', 'SWEET CHILISÅS',   '15:-', '', 4::smallint),
  (1, 'tillagg', 's1.tillagg.5', 'WASABIMAYO',       '15:-', '', 5::smallint),

  -- sushi burritos
  (1, 'burritos', 's1.burritos.1', 'Kyckling BURRITO', '149:-',
   'Kyckling, ris, gurka, färskost, japansk majonnäs, picklad rödlök, sriracha, Isbergssallad', 1::smallint),
  (1, 'burritos', 's1.burritos.2', 'Spicy kyckling BURRITO', '179:-',
   'Stark kyckling, cream cheese, japansk majonnäs, mango curry sås, Majs, rostad lök', 2::smallint),
  (1, 'burritos', 's1.burritos.3', 'Deluxe BURRITO', '179:-',
   'Kyckling, paprika, lök, kryddblandning, soja, sriracha, avokadosås', 3::smallint),
  (1, 'burritos', 's1.burritos.4', 'Sujuk BURRITO', '179:-',
   'Ris, sujuk, avokado, cream cheese, avokado sås', 4::smallint),
  (1, 'burritos', 's1.burritos.5', 'Biff BURRITO', '149:-',
   'Biff, ris, gurka, cream cheese, japansk majonnäs, picklad rödlök, sriracha, isbergssallad', 5::smallint),
  (1, 'burritos', 's1.burritos.6', 'Friterad Räka BURRITO', '149:-',
   'Friterad räka, ris, gurka, cream cheese, japansk majonnäs, picklad rödlök, sriracha, isbergssallad', 6::smallint),
  (1, 'burritos', 's1.burritos.7', 'Lax BURRITO', '149:-',
   'Lax, ris, gurka, cream cheese, japansk majonnäs, picklad rödlök, sriracha, isbergssallad', 7::smallint),
  (1, 'burritos', 's1.burritos.8', 'Tofu BURRITO', '149:-',
   'Tofu, ris, gurka, färskost, japansk majonnäs, picklad rödlök, sriracha, isbergssallad', 8::smallint),
  (1, 'burritos', 's1.burritos.9', 'Vegetarisk BURRITO', '149:-',
   'Avokado, ris, gurka, färskost, japansk majonnäs, picklad rödlök, sriracha, isbergssallad', 9::smallint),

  -- lunch boxes. `description` holds the three rows, newline separated; the
  -- component splits it, so adding a fourth line would overflow the printed card.
  (1, 'lunch', 's1.lunch.1', 'Lunch box', '14 Sushi Bitar',
   E'6 Bitar Philadelphia Roll\n4 Bitar Maki Avokado\n4 Olika Nigiri Bitar', 1::smallint),
  (1, 'lunch', 's1.lunch.2', 'Lunch box', '14 Sushi Bitar',
   E'6 Bitar Crispy Chicken Roll\n4 Bitar Maki Kappa (VEGETARISK)\n4 Olika Nigiri Bitar', 2::smallint),
  (1, 'lunch', 's1.lunch.3', 'Lunch box', '14 Sushi Bitar',
   E'6 Bitar Fried Ebi Roll\n4 Bitar Maki Ebi\n4 Olika Nigiri Bitar', 3::smallint)
) as v(sheet, section, slug, name, price, description, sort_order)
where not exists (select 1 from public.menu_items where sheet = 1);

insert into public.schema_migrations (version, name)
values ('0012', 'menu_items') on conflict (version) do nothing;
