-- Google reviews, shown on "/", "/catering" and "/om-oss".
--
-- Review text is verbatim from the customer's Google listing. It is other
-- people's words about a real business, so do not reword, translate, shorten or
-- invent entries — only the owner may add or remove rows, through /admin/edit.
--
-- NOTE: the reviews were supplied in English (the Google-translated form). If
-- the originals were written in Swedish, replace `quote` with the Swedish text —
-- everything else on the site is Swedish.
--
-- Run in SQL Editor after 0007. (0007 was still unapplied when this was written;
-- check schema_migrations before running either.)

-- ---------------------------------------------------------------------------
-- testimonials: same shape as every other content table, so cms.ts reads it
-- with useRows(). `rating` drives how many stars are filled, 1-5.
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  quote       text not null,
  author      text not null,
  source      text not null default 'google reviews',
  rating      smallint not null default 5 check (rating between 1 and 5),
  sort_order  smallint not null default 0,
  is_active   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create index if not exists testimonials_sort_idx on public.testimonials (sort_order);

create trigger testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;

create policy "public read testimonials"  on public.testimonials for select to anon, authenticated using (true);
create policy "admin write testimonials"  on public.testimonials for all    to authenticated using (true) with check (true);

insert into public.testimonials (quote, author, source, rating, sort_order)
select * from (values
  ('Super nice staff, good customer service as soon as you step inside the door. Great sushi burritos. Will definitely eat there again. Strongly recommend 🤩',
   'Matilda Bernelid', 'google reviews', 5::smallint, 1::smallint),
  ('Nice staff who assured us that we would be full and therefore did not need to buy "waiting food" ....we were really full....so good....so crispy ...so affordable!',
   'Jeanette Cabezas', 'google reviews', 4::smallint, 2::smallint),
  ('Waawwww new taste new concept',
   'Christoffer Fykell', 'google reviews', 5::smallint, 3::smallint),
  ('One of the most busy Sushi outlet. It is because of their attractive deals mainly. There is a seating arrangement but not for many.',
   'Kia', 'google reviews', 5::smallint, 4::smallint)
) as v(quote, author, source, rating, sort_order)
where not exists (select 1 from public.testimonials);

-- Section chrome. Authored here, not client copy — the reviews themselves are
-- the client's, the heading around them is ours and stays editable.
insert into public.site_content (key, value, label, multiline) values
  ('reviews.heading',    'VAD GÄSTERNA SÄGER',                        'Omdömen: rubrik',     false),
  ('reviews.subheading', 'Riktiga omdömen från våra gäster på Google.', 'Omdömen: underrubrik', false)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Fill the three optional /om-oss image slots that 0006 and 0007 created empty.
-- These are plain updates, not inserts: leaving them blank is a valid state, so
-- only rows still holding the empty seed value are touched.
-- ---------------------------------------------------------------------------
update public.site_content set value = '/assets/IMG_8906-scaled.jpg'
  where key = 'omoss.intro_image'      and coalesce(value, '') = '';
update public.site_content set value = '/assets/IMG_8965-scaled.jpg'
  where key = 'omoss.philosophy_image' and coalesce(value, '') = '';

insert into public.schema_migrations (version, name)
values ('0008', 'testimonials') on conflict (version) do nothing;
