-- Sheet 02 (sushi & rolls) menu items — the other half of 0012.
--
-- Same contract as sheet 01: the CMS owns the words, MenuSheet2.tsx owns the
-- layout. Slugs are positional artwork slots, so renaming an item never orphans
-- its row, and items cannot be added or removed from the admin UI.
--
-- Two encodings are used because the print sets these boxes differently:
--
--   * `menyer.description` — the sub-list under each menu name. Rows are newline
--     separated; cells within a row are separated by " | " and land in that menu's
--     column positions. A row with more cells than the box has columns will not
--     render the extras.
--   * `till.price` — where the print shows a two-tier price ("6st 74:-  10st 99:-"),
--     both prices live here pipe-separated, in tier order. The quantity labels stay
--     in code: they are fixed by the artwork.
--
-- Run in SQL Editor after 0012_menu_items.sql.

insert into public.menu_items (sheet, section, slug, name, price, description, sort_order)
select * from (values
  -- sushi menyer -----------------------------------------------------------
  (2, 'menyer', 's2.menyer.1', 'NIGIRI MENY - 6 BITAR', '89:-', 'Valfri', 1::smallint),
  (2, 'menyer', 's2.menyer.2', 'LAX MENY - 14 BITAR', '149:-',
   '6 st Nigiri Shake  ·  8 st Philadelphia', 2::smallint),
  (2, 'menyer', 's2.menyer.3', 'YOKOHAMA MENY - 16 BITAR', '189:-',
   '8 st Blandade Nigiri  ·  8 st Inside-Out Philadelphia', 3::smallint),
  (2, 'menyer', 's2.menyer.4', 'CHICKEN ROLL MENY - 29 BITAR', '265:-',
   E'6 st Maki Chicken | 7 st For you Chicken\n8 st Inside-Out Chicken | 8 st Inside-Out Crispy Chicken',
   4::smallint),
  (2, 'menyer', 's2.menyer.5', 'TAIYO MENY - 29 BITAR', '299:-',
   E'6 st Maki Avokado | 7 st For you Salmon\n8 st Inside-Out Alaska | 8 st Inside-Out Friterad crabstick',
   5::smallint),
  (2, 'menyer', 's2.menyer.6', 'SUPER MENY - 42 BITAR', '499:-',
   E'20 st Blandade Nigiri | 6 st Maki Shake\n8 st Inside-Out Ebi Avokado | 8 st Inside-Out Tekka',
   6::smallint),
  (2, 'menyer', 's2.menyer.7', 'PARTY MENY - 53 BITAR', '599:-',
   E'25 st Blandad Nigiri\n6 st Maki Shake Avokado | 8 st Inside-Out Philadelphia\n6 st Maki Kappa | 8 st Inside-Out Alaska',
   7::smallint),
  (2, 'menyer', 's2.menyer.8', 'XL MENY 60 BITAR', '649:-',
   E'6 st Blandade Nigiri\n6 st Maki Shake Avokado | 6 st Maki Ebi\n6 st Maki Shake | 8 st Inside-Out Philadelphia\n6 st Maki Kappa | 8 st Inside-Out Alaska\n6 st Maki Tuna | 8 st Inside-Out Ebi Avokado',
   8::smallint),
  (2, 'menyer', 's2.menyer.9', 'XXL MENY - 96 BITAR', '849:-',
   E'4 st Nigiri Shake | 4 st Nigiri Tuna | 4 st Nigiri Ebi\n12 st Maki Kappa | 12 st Maki Tuna | 12 st Maki Shake\n16 st Inside-Out Philadelphia | 16 st Inside-Out Tekka\n16 st California Roll',
   9::smallint),

  -- valfri meny ------------------------------------------------------------
  (2, 'valfri', 's2.valfri.1', '16 bitar', '239:-', '', 1::smallint),
  (2, 'valfri', 's2.valfri.2', '20 bitar', '279:-', '', 2::smallint),
  (2, 'valfri', 's2.valfri.3', '30 bitar', '359:-', '', 3::smallint),

  -- nigiri, left column ----------------------------------------------------
  (2, 'nigiri_l', 's2.nigiri_l.1', 'NIGIRI SHAKE', '34:-', 'Lax', 1::smallint),
  (2, 'nigiri_l', 's2.nigiri_l.2', 'NIGIRI MAGURO', '37:-', 'Tuna', 2::smallint),
  (2, 'nigiri_l', 's2.nigiri_l.3', 'NIGIRI SURIMI', '32:-', 'Crabstick', 3::smallint),
  (2, 'nigiri_l', 's2.nigiri_l.4', 'NIGIRI SHAKE FLAMBERAD', '39:-', 'Flamberad Lax', 4::smallint),

  -- nigiri, right column ---------------------------------------------------
  (2, 'nigiri_r', 's2.nigiri_r.1', 'NIGIRI EBI', '34:-', 'Räka', 1::smallint),
  (2, 'nigiri_r', 's2.nigiri_r.2', 'NIGIRI AVOKADO', '34:-', 'Avokado', 2::smallint),
  (2, 'nigiri_r', 's2.nigiri_r.3', 'NIGIRI SPICY TUNA', '39:-',
   'Tonfisk, Japansk Mayo, Siracha, Sesam, Vårlök', 3::smallint),

  -- for you rolls, badged --------------------------------------------------
  (2, 'fy_badged', 's2.fy_badged.1', 'SHRIMP', '94:-',
   'Räkor, Gurka, Cream cheese, Sesam', 1::smallint),
  (2, 'fy_badged', 's2.fy_badged.2', 'CHICKEN', '79:-',
   'Kyckling, Cream cheese, Gurka, Sesam', 2::smallint),
  (2, 'fy_badged', 's2.fy_badged.3', 'SALMON', '89:-',
   'Lax, Cream cheese, Gurka, Sesam', 3::smallint),

  -- for you rolls, plain ---------------------------------------------------
  (2, 'fy_plain', 's2.fy_plain.1', 'FOR YOU LAX', '94:-',
   'Lax, Avokado, Gurka, Cream cheese, Sesam', 1::smallint),
  (2, 'fy_plain', 's2.fy_plain.2', 'FOR YOU TUNA', '94:-',
   'Tonfisk, Gurka, Sesam, Cream cheese', 2::smallint),
  (2, 'fy_plain', 's2.fy_plain.3', 'FOR YOU VEGETARISK', '79:-',
   'Avokado, Gurka, Cream cheese', 3::smallint),

  -- inside-out rolls. slug is row.cell, matching the print's mixed 1/2-column rows
  (2, 'inside', 's2.inside.1.1', 'ALASKA ROLL', '80:-', 'Lax, Avokado', 1::smallint),
  (2, 'inside', 's2.inside.2.1', 'EBI ROLL', '100:-',
   'Räka, Cream cheese, Gurka, Sesam', 2::smallint),
  (2, 'inside', 's2.inside.2.2', 'TEKKA ROLL', '104:-',
   'Tonfisk, Gurka, Cream cheese', 3::smallint),
  (2, 'inside', 's2.inside.3.1', 'SHAKE ROLL', '104:-',
   'Lax, Cream cheese, Avokado, Sesam', 4::smallint),
  (2, 'inside', 's2.inside.3.2', 'AVOKADO KAPPA ROLL', '90:-',
   'Avokado, Gurka, Cream cheese, Sesam', 5::smallint),
  (2, 'inside', 's2.inside.4.1', 'FRIED EBI ROLL', '104:-',
   'Ebi Tempura, Gurka, Avokado, Chilimayo', 6::smallint),
  (2, 'inside', 's2.inside.4.2', 'CALIFORNIA ROLL', '90:-', 'Krabba, Avokado', 7::smallint),
  (2, 'inside', 's2.inside.5.1', 'PHILADELPHIA ROLL', '90:-',
   'Lax, Gurka, Cream cheese', 8::smallint),
  (2, 'inside', 's2.inside.6.1', 'CRISPY CHICKEN ROLL', '94:-',
   'Krispig Kyckling, Gurka, Cream cheese', 9::smallint),
  (2, 'inside', 's2.inside.7.1', 'EBI AVOKADO ROLL', '92:-', 'Räkor, Avokado', 10::smallint),

  -- delux rolls ------------------------------------------------------------
  (2, 'delux', 's2.delux.1', 'TEMPURA DELUX', '135:-',
   'Friterad Räka, Avokado, Gurka Topping: Flamberad Lax, Teriyakisås, Chilimayo, Sesam',
   1::smallint),
  (2, 'delux', 's2.delux.2', 'CHICKEN DELUX', '119:-',
   'Kyckling, Cream cheese, Gurka. Topping: Avokado, Teriyakisås, Chilimayo', 2::smallint),
  (2, 'delux', 's2.delux.3', 'SPICY SALMON ROLL', '125:-',
   'Lax, Avokado, Gurka Topping: Flamberad Lax, Japansk Mayo, Chilipeppar, siracha sås',
   3::smallint),
  (2, 'delux', 's2.delux.4', 'TEMPURA ROYAL', '135:-',
   'Friterad Räka, gurka Topping: Avokado, Chilli Mayo, Teriyakisås, sesam', 4::smallint),

  -- maki -------------------------------------------------------------------
  (2, 'maki', 's2.maki.1', 'MAKI AVOKADO', '49:-', 'Avokado', 1::smallint),
  (2, 'maki', 's2.maki.2', 'MAKI CHICKEN', '45:-', 'Kyckling, Cream Cheese', 2::smallint),
  (2, 'maki', 's2.maki.3', 'MAKI EBI', '55:-', 'Räkor', 3::smallint),
  (2, 'maki', 's2.maki.4', 'MAKI SALMON', '55:-',
   'Flamberad Lax, Chilli Mayo, Teriyakisås, Sesam', 4::smallint),
  (2, 'maki', 's2.maki.5', 'MAKI SHAKE AVOKADO', '49:-', 'Lax, Avokado', 5::smallint),
  (2, 'maki', 's2.maki.6', 'MAKI SHAKE', '49:-', 'Lax', 6::smallint),
  (2, 'maki', 's2.maki.7', 'MAKI TUNA', '49:-', 'Tonfisk, Majonnäs', 7::smallint),

  -- tillbehör. Pipe-separated price = the two-tier rows, in tier order.
  (2, 'till', 's2.till.1', 'VÅRRULLAR', '49:-',
   '12 st Vegetariska Vårrullar med Sweet Chilisås', 1::smallint),
  (2, 'till', 's2.till.2', 'EDAMAME', '49:-',
   'Kokta Sojabönor kryddade med Shichimi & Flingsalt', 2::smallint),
  (2, 'till', 's2.till.3', 'EBI TEMPURA STICKS', '74:-|99:-',
   'Tempurafriterade Räkor med Chilimayo', 3::smallint),
  (2, 'till', 's2.till.4', 'CRISPY CHICKEN STICKS', '49:-|69:-',
   'Panerade Kycklingsticks med Chilimayo', 4::smallint),
  (2, 'till', 's2.till.5', 'ALGSALLAD', '39:-', '', 5::smallint)
) as v(sheet, section, slug, name, price, description, sort_order)
where not exists (select 1 from public.menu_items where sheet = 2);

insert into public.schema_migrations (version, name)
values ('0013', 'menu_items_sheet2') on conflict (version) do nothing;
