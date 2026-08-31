-- Storage for the two public forms: /kontakt and /catering.
--
-- WHY A TABLE AT ALL, GIVEN THE n8n WEBHOOK
-- Each form now delivers to two places at once, on purpose:
--
--   form ──┬──> Supabase (these tables)  ──> /admin/forms   (the panel)
--          └──> n8n webhook              ──> Google Sheet   (the spreadsheet)
--
-- They are independent. n8n going down, its CORS header being wrong, or the
-- workflow being deactivated must not lose a lead — the row is already here.
-- Equally, Supabase pausing on the free tier must not lose one either — n8n
-- already has it. Only when BOTH fail does the page fall back to `mailto:`.
-- That is why the browser writes here directly instead of Supabase forwarding
-- to n8n with a Database Webhook: a chain has one point of failure, two
-- parallel sends have none.
--
-- RLS IS DELIBERATELY LOPSIDED
-- These tables are the one place on the site where `anon` can WRITE. A contact
-- form that only a logged-in user can submit is not a contact form. So:
--   * `anon` may insert and NOTHING else. It cannot read back what it wrote,
--     which matters — the anon key is public, and these rows are other
--     people's names, phone numbers and email addresses.
--   * `authenticated` may select and update (marking a row handled).
--   * No delete policy at all: only `service_role` can remove rows. An admin
--     cannot destroy a lead by mis-clicking, and a bot certainly cannot.
--
-- SPAM
-- A publicly-insertable table can be flooded. The length checks below cap the
-- damage per row rather than preventing it; real rate limiting belongs in front
-- of the site. If it ever becomes a problem the fix is a Turnstile/hCaptcha
-- token verified in an Edge Function, not tightening these constraints.
--
-- Run in SQL Editor after 0024_menu_items_thai.sql. It does not actually depend on
-- 0024 (or 0018) and can be applied while those are still outstanding.
--
-- Every statement is re-runnable. Postgres has no `create policy if not exists`, so
-- each policy is dropped first — this is pasted into the dashboard by hand, and a
-- half-applied paste that then refuses to re-run is the worst failure mode there is.

-- ---------------------------------------------------------------------------
-- /kontakt — the "Kontakta oss" message form.
--
-- Columns mirror ContactWebhookPayload in src/lib/contact-webhook.ts exactly,
-- so the same object is POSTed to n8n and inserted here with no remapping.
-- `submitted_at` is the visitor's clock (it comes from the payload and can be
-- wrong or spoofed); `received_at` is the server's and is what the panel sorts
-- on. Keep both — the difference has explained more than one "missing" lead.
-- ---------------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id            uuid primary key default gen_random_uuid(),
  submitted_at  timestamptz not null default now(),
  received_at   timestamptz not null default now(),
  name          text not null check (length(name) between 1 and 200),
  email         text        check (email is null or length(email) <= 320),
  phone         text        check (phone is null or length(phone) <= 60),
  message       text        check (message is null or length(message) <= 5000),
  page_url      text        check (page_url is null or length(page_url) <= 500),
  is_handled    boolean not null default false,
  handled_at    timestamptz
);

-- ---------------------------------------------------------------------------
-- /catering — the "Cateringförfrågan" survey.
--
-- Mirrors CateringWebhookPayload in src/lib/catering-webhook.ts.
--
-- `event_date` is a real `date` and `event_time` a real `time` because the form
-- uses <input type="date"> / <input type="time">, which the browser guarantees
-- to be ISO 'YYYY-MM-DD' / 'HH:MM'. That is what makes "vilka bokningar kommer
-- härnäst" sortable in the panel and in the sheet. If either input is ever
-- changed to free text, change these to `text` in the same commit or the insert
-- starts rejecting rows.
--
-- `staff` and `delivery` are nullable booleans, not `not null default false`:
-- the Ja/Nej controls start untouched, and "did not answer" is a different fact
-- from "answered Nej" when someone rings the customer back.
--
-- `dishes` is a text[] rather than a join table. The options are a hardcoded
-- list of six in Catering.tsx, nobody queries across them, and an array survives
-- the list changing without orphaning rows.
-- ---------------------------------------------------------------------------
create table if not exists public.catering_submissions (
  id            uuid primary key default gen_random_uuid(),
  submitted_at  timestamptz not null default now(),
  received_at   timestamptz not null default now(),
  name          text not null check (length(name) between 1 and 200),
  email         text        check (email is null or length(email) <= 320),
  phone         text        check (phone is null or length(phone) <= 60),
  event_type    text        check (event_type is null or length(event_type) <= 200),
  event_date    date,
  event_time    time,
  guests        integer     check (guests is null or guests between 0 and 100000),
  staff         boolean,
  delivery      boolean,
  dishes        text[] not null default '{}',
  comment       text        check (comment is null or length(comment) <= 5000),
  page_url      text        check (page_url is null or length(page_url) <= 500),
  is_handled    boolean not null default false,
  handled_at    timestamptz
);

-- ---------------------------------------------------------------------------
-- RLS. See the header — anon writes, authenticated reads.
-- ---------------------------------------------------------------------------
alter table public.contact_submissions  enable row level security;
alter table public.catering_submissions enable row level security;

drop policy if exists "anyone can submit contact form"   on public.contact_submissions;
drop policy if exists "anyone can submit catering form"  on public.catering_submissions;
drop policy if exists "admin read contact_submissions"   on public.contact_submissions;
drop policy if exists "admin read catering_submissions"  on public.catering_submissions;
drop policy if exists "admin update contact_submissions" on public.contact_submissions;
drop policy if exists "admin update catering_submissions" on public.catering_submissions;

-- A visitor may drop a message in the box. They may not look inside it: insert
-- and no select, so the public anon key cannot read back other people's names,
-- phone numbers and email addresses. supabase-js `.insert()` without `.select()`
-- sends PostgREST's default `return=minimal`, so it never tries to.
create policy "anyone can submit contact form"
  on public.contact_submissions for insert to anon, authenticated with check (true);
create policy "anyone can submit catering form"
  on public.catering_submissions for insert to anon, authenticated with check (true);

create policy "admin read contact_submissions"
  on public.contact_submissions for select to authenticated using (true);
create policy "admin read catering_submissions"
  on public.catering_submissions for select to authenticated using (true);

-- Update exists only so the panel can flag a lead as dealt with.
create policy "admin update contact_submissions"
  on public.contact_submissions for update to authenticated using (true) with check (true);
create policy "admin update catering_submissions"
  on public.catering_submissions for update to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- The panel opens on "newest first, unhandled first", and the catering list can
-- be flipped to "next event first". These are the three orderings it uses.
-- ---------------------------------------------------------------------------
create index if not exists contact_submissions_received_idx
  on public.contact_submissions (received_at desc);
create index if not exists catering_submissions_received_idx
  on public.catering_submissions (received_at desc);
create index if not exists catering_submissions_event_idx
  on public.catering_submissions (event_date);

insert into public.schema_migrations (version, name)
values ('0025', 'form_submissions') on conflict (version) do nothing;
