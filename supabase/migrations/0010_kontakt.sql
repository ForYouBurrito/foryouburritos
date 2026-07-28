-- "Kontakta oss" page content.
--
-- Every string on /kontakt lives here — the page itself holds no copy, including
-- the form's field labels and the address the map embed is pinned to.
--
-- Copy is verbatim from the client's live page and the hand-off spec. Do not
-- translate or reword.
--
-- Run in SQL Editor after 0009.
--
-- ---------------------------------------------------------------------------
-- NOT SEEDED HERE, ON PURPOSE: kontakt.hours
--
-- The spec listed opening hours as a `list` field on this page, then flagged
-- (§5) that they disagree with the footer's and asked for a single source of
-- truth. This is that decision: /kontakt reads the shared `opening_hours` table
-- the footer already uses, so the two cannot drift. Regrouping the rows into
-- "Måndag till torsdag" is an edit to that table in /admin/edit, not a second
-- copy of the same facts.
--
-- Two factual conflicts remain for the client to settle — do NOT guess:
--   * Lördag — table says 12–23, the contact page said 11–23.
--   * Söndag — table says 12–21, the contact page listed no Sunday at all.
-- Whichever is right, fix it in `opening_hours` and both pages follow.
-- ---------------------------------------------------------------------------

insert into public.site_content (key, value, label, multiline) values
  ('kontakt.eyebrow',              'Vi vill gärna höra från dig',        'Kontakt: överrubrik',            false),
  ('kontakt.title',                'Kontakta oss',                       'Kontakt: rubrik',                false),

  ('kontakt.visit_title',          'Besöka oss',                         'Kontakt: rubrik besök',          false),
  ('kontakt.visit_address_line1',  'Östergatan 21',                      'Kontakt: adress rad 1',          false),
  ('kontakt.visit_address_line2',  '211 25 Malmö',                       'Kontakt: adress rad 2',          false),
  ('kontakt.visit_cta_label',      'VISA PÅ KARTA',                      'Kontakt: knapp karta',           false),

  -- Heading only. The number and address themselves are contact.phone /
  -- contact.email, already editable and already shared with the header and
  -- footer — duplicating them here is what lets them drift apart.
  ('kontakt.contact_title',        'Ring/ maila oss',                    'Kontakt: rubrik ring/maila',     false),
  ('kontakt.hours_title',          'Öppettider',                         'Kontakt: rubrik öppettider',     false),

  ('kontakt.form_eyebrow',         'SKICKA ETT MEDDELANDE',              'Kontakt: formulär överrubrik',   false),
  ('kontakt.form_title',           'Hör av dig',                         'Kontakt: formulär rubrik',       false),
  ('kontakt.form_intro',           'Fyll i formuläret så återkommer vi så snart vi kan. Fält märkta med', 'Kontakt: formulär ingress', true),
  ('kontakt.form_name',            'Namn & Efternamn',                   'Kontakt: fält namn',             false),
  ('kontakt.form_email',           'Mail',                               'Kontakt: fält mail',             false),
  ('kontakt.form_phone',           'Telefonnummer',                      'Kontakt: fält telefon',          false),
  ('kontakt.form_message',         'Meddelande',                         'Kontakt: fält meddelande',       false),
  ('kontakt.form_submit',          'SKICKA',                             'Kontakt: knapp skicka',          false),
  ('kontakt.form_submit_sending',  'SKICKAR…',                           'Kontakt: knapp skickar',         false),
  ('kontakt.form_sent',            'Tack! Ditt meddelande är skickat — vi återkommer så snart vi kan.', 'Kontakt: kvittens skickat', true),
  ('kontakt.form_mailto',          'Din e-postklient öppnas med meddelandet ifyllt. Öppnas den inte? Mejla oss direkt på', 'Kontakt: kvittens mailto', true),

  -- The embed is built from this address, so the pin can be re-pointed from the
  -- admin UI without a deploy.
  ('kontakt.map_address',          'Östergatan 21, 211 25 Malmö',        'Kontakt: adress för kartan',     false),
  ('kontakt.map_title',            'Karta till For You Burritos, Östergatan 21', 'Kontakt: kartans titel (skärmläsare)', false),
  ('kontakt.map_cta_label',        'ÖPPNA I GOOGLE MAPS',                'Kontakt: knapp öppna karta',     false)
on conflict (key) do nothing;

-- "Kontakta oss" is now its own page rather than an anchor on the landing page.
update public.nav_links set href = '/kontakt' where label = 'KONTAKTA OSS';

insert into public.schema_migrations (version, name)
values ('0010', 'kontakt') on conflict (version) do nothing;
