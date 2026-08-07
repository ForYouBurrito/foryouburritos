-- Per-page SEO copy, and a focus phrase for the writing checker on /admin/seo.
--
-- Until now `seo.title` and `seo.description` were the ONLY pair, sitting in
-- index.html — so Google listed /meny, /kontakt and /catering under the same
-- title as the homepage. Each page gets its own here, and <RouteSeo> applies
-- them in the browser.
--
-- `seo.<page>.focus` is not published anywhere. It is the phrase the admin
-- wants that page to be found by, and it exists so the checker has something
-- to grade the copy against — "is this phrase in the title, in a heading, in
-- the body". It is advice, not markup.
--
-- Lengths of the seeded values are inside the limits the checker enforces
-- (title 30-60, description 120-158) so a fresh install starts green rather
-- than showing the client a wall of warnings about text they never wrote.
--
-- The old global `seo.title` / `seo.description` stay as the fallback for any
-- route without its own row.
--
-- Run in SQL Editor after 0017_seo_stats.sql.

insert into public.site_content (key, value, label, multiline) values

-- ---------------------------------------------------------------- startsidan
('seo.start.title',
 'For You Burritos — sushiburrito och poké i Malmö',
 'SEO startsidan: sidtitel', false),
('seo.start.description',
 'Handrullade sushiburritos, poké och wok mitt i Malmö. Beställ online för avhämtning eller besök oss på Östergatan 21.',
 'SEO startsidan: beskrivning', true),
('seo.start.focus',
 'sushi burrito malmö',
 'SEO startsidan: fokusfras', false),

-- ---------------------------------------------------------------------- meny
('seo.meny.title',
 'Meny — sushiburritos, poké och wok i Malmö',
 'SEO meny: sidtitel', false),
('seo.meny.description',
 'Se hela menyn hos For You Burritos i Malmö: sushiburritos, poké bowls, wok och lunchlådor med priser och innehåll för varje rätt.',
 'SEO meny: beskrivning', true),
('seo.meny.focus',
 'sushi meny malmö',
 'SEO meny: fokusfras', false),

-- ------------------------------------------------------------------ catering
('seo.catering.title',
 'Catering i Malmö — sushi och poké till event',
 'SEO catering: sidtitel', false),
('seo.catering.description',
 'Catering i Malmö för fest, kontor och event. Sushiplattor, poké och wok till grupper — skicka en förfrågan så återkommer vi med förslag och pris.',
 'SEO catering: beskrivning', true),
('seo.catering.focus',
 'catering malmö sushi',
 'SEO catering: fokusfras', false),

-- -------------------------------------------------------------------- om oss
('seo.om-oss.title',
 'Om oss — historien bakom For You Burritos i Malmö',
 'SEO om oss: sidtitel', false),
('seo.om-oss.description',
 'Japansk precision möter mexikansk känsla. Läs om tanken bakom For You Burritos och maten vi lagar varje dag på Östergatan i Malmö.',
 'SEO om oss: beskrivning', true),
('seo.om-oss.focus',
 'for you burritos malmö',
 'SEO om oss: fokusfras', false),

-- ------------------------------------------------------------------- kontakt
('seo.kontakt.title',
 'Kontakt och öppettider — For You Burritos Malmö',
 'SEO kontakt: sidtitel', false),
('seo.kontakt.description',
 'Hitta hit, ring oss eller skicka ett meddelande. Öppettider, adress och kontaktuppgifter för For You Burritos på Östergatan 21 i Malmö.',
 'SEO kontakt: beskrivning', true),
('seo.kontakt.focus',
 'for you burritos kontakt',
 'SEO kontakt: fokusfras', false)

on conflict (key) do nothing;

insert into public.schema_migrations (version, name)
values ('0018', 'page_seo') on conflict (version) do nothing;
