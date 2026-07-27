-- Phase 3: the shared chrome (header nav, footer, contact details, opening hours).
-- These were added to src/lib/site.ts after 0001 was written, so the original schema
-- never covered them.
--
-- Run in SQL Editor after 0004.

-- ---------------------------------------------------------------------------
-- nav_links: header + footer navigation. An href starting with "/" or "#" is
-- treated as internal by SiteHeader/SiteFooter; anything else opens in a new tab.
-- ---------------------------------------------------------------------------
create table if not exists public.nav_links (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  href        text not null,
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create index if not exists nav_links_sort_idx on public.nav_links (sort_order);

create trigger nav_links_updated_at
  before update on public.nav_links
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- opening_hours
-- ---------------------------------------------------------------------------
create table if not exists public.opening_hours (
  id          uuid primary key default gen_random_uuid(),
  day_label   text not null,          -- 'Mån' — short form, as the footer renders it
  hours       text not null,          -- '11–21', free text so "Stängt" also works
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create index if not exists opening_hours_sort_idx on public.opening_hours (sort_order);

create trigger opening_hours_updated_at
  before update on public.opening_hours
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: same rule as every other content table
-- ---------------------------------------------------------------------------
alter table public.nav_links     enable row level security;
alter table public.opening_hours enable row level security;

create policy "public read nav_links"     on public.nav_links     for select to anon, authenticated using (true);
create policy "public read opening_hours" on public.opening_hours for select to anon, authenticated using (true);

create policy "admin write nav_links"     on public.nav_links     for all to authenticated using (true) with check (true);
create policy "admin write opening_hours" on public.opening_hours for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Seed from src/lib/site.ts
-- ---------------------------------------------------------------------------
insert into public.nav_links (label, href, sort_order)
select * from (values
  ('MENY',          '/meny',                      1::smallint),
  ('CATERING',      '/catering',                  2::smallint),
  ('OM OSS',        'https://foryouburritos.se/', 3::smallint),
  ('KONTAKTA OSS',  '/#besok-oss',                4::smallint)
) as v(label, href, sort_order)
where not exists (select 1 from public.nav_links);

insert into public.opening_hours (day_label, hours, sort_order)
select * from (values
  ('Mån',  '11–21', 1::smallint),
  ('Tis',  '11–21', 2::smallint),
  ('Ons',  '11–21', 3::smallint),
  ('Tors', '11–21', 4::smallint),
  ('Fre',  '11–23', 5::smallint),
  ('Lör',  '12–23', 6::smallint),
  ('Sön',  '12–21', 7::smallint)
) as v(day_label, hours, sort_order)
where not exists (select 1 from public.opening_hours);

-- Brand + contact strings. contact.phone is the display form; the tel: href is
-- derived in the client by stripping spaces, so only edit this one value.
insert into public.site_content (key, value, label, multiline) values
  ('brand.tagline',    'Där tradition möter innovation i varje tugga.',                         'Varumärke: slogan (sidfot)', true),
  ('contact.email',    'info@foryouburritos.se',                                                'Kontakt: e-post',            false),
  ('contact.phone',    '+46 431 31 14 14',                                                      'Kontakt: telefon',           false),
  ('contact.address',  'Östergatan 21, 211 25 Malmö',                                           'Kontakt: adress',            false),
  ('footer.links_heading',   'SNABBLÄNKAR',                                                     'Sidfot: rubrik länkar',      false),
  ('footer.hours_heading',   'ÖPPETTIDER',                                                      'Sidfot: rubrik öppettider',  false),
  ('footer.contact_heading', 'HÖR AV DIG',                                                      'Sidfot: rubrik kontakt',     false)
on conflict (key) do nothing;

insert into public.schema_migrations (version, name)
values ('0005', 'site_chrome') on conflict (version) do nothing;
