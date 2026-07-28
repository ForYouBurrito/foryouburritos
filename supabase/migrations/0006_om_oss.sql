-- "Om oss" page content.
--
-- Every string on /om-oss lives here — the page itself holds no copy. Section
-- text goes in site_content under the `omoss.` prefix (the admin form groups by
-- that prefix), the three "Vår filosofi" bullets go in their own table so the
-- content creator can add or remove items.
--
-- Copy is verbatim from the client's live page. Do not translate or reword.
--
-- Run in SQL Editor after 0005.

-- ---------------------------------------------------------------------------
-- about_points: the repeatable "Vår filosofi" list.
-- Same shape as every other content table so cms.ts can read it with useRows().
-- On the live page each item was wrapped in a decorative "#" link — dropped
-- here, these are plain text.
-- ---------------------------------------------------------------------------
create table if not exists public.about_points (
  id          uuid primary key default gen_random_uuid(),
  body        text not null,
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create index if not exists about_points_sort_idx on public.about_points (sort_order);

create trigger about_points_updated_at
  before update on public.about_points
  for each row execute function public.set_updated_at();

alter table public.about_points enable row level security;

create policy "public read about_points" on public.about_points for select to anon, authenticated using (true);
create policy "admin write about_points" on public.about_points for all    to authenticated using (true) with check (true);

insert into public.about_points (body, sort_order)
select * from (values
  ('Färska och högkvalitativa ingredienser',        1::smallint),
  ('Autentiska recept från Thailand och Japan',     2::smallint),
  ('Noggrann tillagning med kärlek och omtanke',    3::smallint)
) as v(body, sort_order)
where not exists (select 1 from public.about_points);

-- ---------------------------------------------------------------------------
-- Page copy.
--
-- The three *_image keys are optional media slots: paste a URL (an /assets/…
-- path or an absolute https:// one) and the section switches to a two-column
-- layout. Left empty, the section renders text-only — the page checks for a
-- URL-shaped value rather than a non-empty one, because an empty site_content
-- value falls through to the key name in useContent().
-- ---------------------------------------------------------------------------
insert into public.site_content (key, value, label, multiline) values
  ('omoss.eyebrow',          'FOR YOU BURRITOS',                                     'Om oss: överrubrik',            false),
  ('omoss.title',            'Om oss',                                               'Om oss: rubrik',                false),
  ('omoss.intro_1',          'Vi är passionerade matälskare som älskar att kombinera det bästa från det japanska och internationella köket. Vår resa började med en enkel idé: att skapa en plats där traditionella smaker möter modern kreativitet, och där varje rätt är en smakupplevelse utöver det vanliga.', 'Om oss: intro, stycke 1', true),
  ('omoss.intro_2',          'Som en del av Thai Sushi For You i Västra Hamnen bär vi med oss samma kvalitet och passion för matlagning, men med en unik twist – sushi burritos, sticks och bowls som är både innovativa och smakrika.',                                                                          'Om oss: intro, stycke 2', true),
  ('omoss.intro_image',      '',                                                     'Om oss: bild intro (URL, valfri)',       false),
  ('omoss.philosophy_title', 'Vår filosofi',                                         'Om oss: rubrik filosofi',       false),
  ('omoss.philosophy_intro', 'Vi tror på att mat ska vara mer än bara en måltid – det ska vara en upplevelse. Därför använder vi alltid:', 'Om oss: ingress filosofi', true),
  ('omoss.philosophy_image', '',                                                     'Om oss: bild filosofi (URL, valfri)',    false),
  ('omoss.vision_title',     'Vår vision',                                           'Om oss: rubrik vision',         false),
  ('omoss.vision_body',      'Vår vision är att skapa en mötesplats där mat, gemenskap och glädje står i centrum. Oavsett om du besöker oss för en middag, beställer take-away eller anlitar oss för catering, vill vi att varje tugga ska vara minnesvärd.', 'Om oss: text vision', true),
  -- Closing CTA band — the shared pattern from /meny, kept editable rather than
  -- hardcoded. Not client copy from the live "Om oss" page.
  ('omoss.cta_heading',      'HUNGRIG?',                                             'Om oss: CTA rubrik',            false),
  ('omoss.cta_body',         'Beställ online och hämta i Malmö eller Lund.',          'Om oss: CTA text',              false),
  ('omoss.cta_label',        'BESTÄLL',                                              'Om oss: CTA knapp',             false)
on conflict (key) do nothing;

-- "Om oss" now lives on this site instead of the old WordPress page, so the
-- shared nav entry becomes an internal route.
update public.nav_links set href = '/om-oss' where label = 'OM OSS';

insert into public.schema_migrations (version, name)
values ('0006', 'om_oss') on conflict (version) do nothing;
