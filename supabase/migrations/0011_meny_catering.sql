-- Brings /meny and /catering into the CMS so both are editable at /admin/edit.
--
-- NOTE ON NUMBERING: there are two 0009 files on disk. 0009_om_oss_images.sql is a
-- strict subset of 0009_optimised_media_single_location.sql (which is the one the
-- ledger recorded), so nothing was lost — but both insert ('0009', …) with
-- `on conflict do nothing`, so the second was swallowed silently. Do not reuse a
-- version number.
--
-- Run in SQL Editor after 0010_kontakt.sql.

-- ---------------------------------------------------------------------------
-- catering_blocks: the three repeating card groups on /catering.
-- One table with a `section` discriminator rather than three near-identical
-- tables — same shape, same admin treatment, one policy set.
-- ---------------------------------------------------------------------------
create table if not exists public.catering_blocks (
  id          uuid primary key default gen_random_uuid(),
  section     text not null check (section in ('varden', 'erbjudanden', 'process')),
  title       text not null,
  body        text not null default '',
  icon        text not null default '',   -- lucide-react name; only 'varden' uses it
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create index if not exists catering_blocks_section_idx
  on public.catering_blocks (section, sort_order);

create trigger catering_blocks_updated_at
  before update on public.catering_blocks
  for each row execute function public.set_updated_at();

alter table public.catering_blocks enable row level security;

create policy "public read catering_blocks"
  on public.catering_blocks for select to anon, authenticated using (true);
create policy "admin write catering_blocks"
  on public.catering_blocks for all to authenticated using (true) with check (true);

insert into public.catering_blocks (section, title, body, icon, sort_order)
select * from (values
  ('varden', 'Färska ingredienser',
   'Våra rätter tillagas med noggrant utvalda råvaror för att garantera bästa smak och kvalitet.',
   'Leaf', 1::smallint),
  ('varden', 'Mångsidig meny',
   'Från sushi och wok till poke bowls och thailändska curryrätter – vi har något för alla smaker.',
   'UtensilsCrossed', 2::smallint),
  ('varden', 'Flexibla lösningar',
   'Vi anpassar menyn efter dina behov, oavsett om det är en liten samling eller ett större event.',
   'SlidersHorizontal', 3::smallint),
  ('varden', 'Professionell service',
   'Vårt team ser till att allt är perfekt, från matens presentation till leveransen.',
   'Sparkles', 4::smallint),

  ('erbjudanden', 'Sushi-plattor',
   'Perfekta för mingel eller som förrätt, med allt från klassiska makirullar till våra signatur-rullar.',
   '', 1::smallint),
  ('erbjudanden', 'Sushi Burrito Sticks',
   'Smidigt, gott och fullt av smak! Perfekt balanserade rullar fyllda med färska ingredienser, serverade i en lättätlig stick-form.',
   '', 2::smallint),
  ('erbjudanden', 'Poke Bowls',
   'Fräscha och färgstarka bowls, perfekt för en hälsosam och modern touch.',
   '', 3::smallint),
  ('erbjudanden', 'Friterade specialiteter',
   'Krispiga och läckra alternativ som alla älskar.',
   '', 4::smallint),
  ('erbjudanden', 'Vegetariska och veganska alternativ',
   'För att se till att alla gäster är nöjda.',
   '', 5::smallint),

  ('process', 'Planering',
   'Kontakta oss med information om ditt event, antal gäster och önskemål.',
   '', 1::smallint),
  ('process', 'Menyanpassning',
   'Vi hjälper dig att välja rätter som passar dina behov.',
   '', 2::smallint),
  ('process', 'Leverans',
   'Vi levererar maten direkt till ditt event – alltid fräsch och redo att serveras.',
   '', 3::smallint),
  ('process', 'Extra tjänster',
   'Behöver du porslin, serveringspersonal eller något annat? Vi fixar det!',
   '', 4::smallint)
) as v(section, title, body, icon, sort_order)
where not exists (select 1 from public.catering_blocks);

-- ---------------------------------------------------------------------------
-- /meny page copy. The menu sheets themselves are artwork-positioned text in
-- MenuSheet1.tsx and are NOT covered here — see the note at the bottom.
-- ---------------------------------------------------------------------------
insert into public.site_content (key, value, label, multiline) values
  ('meny.eyebrow',           'FOR YOU BURRITOS',                    'Meny: överrubrik',            false),
  ('meny.title_line1',       'VÅR',                                 'Meny: rubrik rad 1',          false),
  ('meny.title_line2',       'MENY',                                'Meny: rubrik rad 2 (röd)',    false),
  ('meny.intro',             'Japansk precision, mexikanska vibbar. Hela sortimentet — sushi burritos, poke bowls, nigiri, maki och rolls — finns i menyerna nedan.', 'Meny: ingress', true),
  ('meny.cta_order_label',   'BESTÄLL ONLINE',                      'Meny: knapp beställ',         false),
  ('meny.cta_scroll_label',  'SE MENYN',                            'Meny: länk till menyn',       false),
  ('meny.sheet1_title',      'SUSHI BURRITOS',                      'Meny: blad 1 rubrik',         false),
  ('meny.sheet1_sub',        'Poke bowls, burrito sticks, lunchlådor & tillägg', 'Meny: blad 1 underrubrik', false),
  ('meny.sheet2_title',      'SUSHI & ROLLS',                       'Meny: blad 2 rubrik',         false),
  ('meny.sheet2_sub',        'Sushimenyer, nigiri, maki, inside-out rolls & tillbehör', 'Meny: blad 2 underrubrik', false),
  ('meny.fullscreen_label',  'ÖPPNA I FULLSKÄRM',                   'Meny: fullskärmslänk',        false),
  ('meny.sheet_cta_title',   'Hittat din favorit?',                 'Meny: beställruta rubrik',    false),
  ('meny.sheet_cta_body',    'Beställ direkt online — hämta färdigt i Malmö.', 'Meny: beställruta text', true),
  ('meny.note1_title',       'LUNCH BOX 119:–',                     'Meny: notis 1 rubrik',        false),
  ('meny.note1_body',        'Måndag–fredag 11–14. Tre lunchlådor med 14 sushibitar var.', 'Meny: notis 1 text', true),
  ('meny.note2_title',       'ALLERGIER',                           'Meny: notis 2 rubrik',        false),
  ('meny.note2_body',        'Fråga personalen — vi hjälper dig hitta rätt.', 'Meny: notis 2 text',  true),
  ('meny.cta_heading',       'HUNGRIG?',                            'Meny: avslutande rubrik',     false),
  ('meny.cta_body',          'Beställ online och hämta i Malmö eller Lund.', 'Meny: avslutande text', true),
  ('meny.cta_button_label',  'BESTÄLL',                             'Meny: avslutande knapp',      false),

-- ---------------------------------------------------------------------------
-- /catering page copy. Form field labels are deliberately excluded: they are the
-- payload of the enquiry email composed in Catering.tsx, so renaming one in the
-- admin UI would silently change what the kitchen receives.
-- ---------------------------------------------------------------------------
  ('catering.eyebrow',       'FOR YOU BURRITOS',                    'Catering: överrubrik',        false),
  ('catering.title',         'CATERING',                            'Catering: rubrik',            false),
  ('catering.intro',         'Oavsett om du planerar en familjemiddag, företagsevent eller en större fest, erbjuder For You Burritos catering fylld med smakrika och kreativa rätter. Våra sushi burritos, sticks och bowls är perfekt balanserade och anpassade för alla tillfällen. Med färska ingredienser och unika smakkombinationer garanterar vi en upplevelse som överraskar och imponerar. Låt oss göra ditt evenemang oförglömligt med mat tillagad med passion och kärlek!', 'Catering: ingress', true),
  ('catering.cta_quote_label', 'BEGÄR OFFERT',                      'Catering: knapp offert',      false),
  ('catering.offerings_title', 'VAD VI ERBJUDER',                   'Catering: rubrik erbjudanden', false),
  ('catering.offerings_sub', 'Sushi-plattor, sticks, bowls och friterat — anpassat efter ditt tillfälle.', 'Catering: underrubrik erbjudanden', true),
  ('catering.process_title', 'SÅ FUNGERAR DET',                     'Catering: rubrik process',    false),
  ('catering.process_sub',   'Fyra steg från första kontakt till serverad mat.', 'Catering: underrubrik process', true),
  ('catering.form_eyebrow',  'CATERINGFÖRFRÅGAN',                   'Catering: formulär överrubrik', false),
  ('catering.form_title',    'BERÄTTA OM DITT EVENT',               'Catering: formulär rubrik',   false)
on conflict (key) do nothing;

insert into public.schema_migrations (version, name)
values ('0011', 'meny_catering') on conflict (version) do nothing;
