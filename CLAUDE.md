# CLAUDE.md — For You Burritos

Read this instead of scanning the codebase. It is small, and this file covers all of it.

## What this is

A **single-page marketing site** for For You Burritos (sushi + burrito restaurants in
Malmö & Lund, Sweden). Swedish-language copy. Three sections: hero, menu cards,
locations with Google Maps embeds. Every call-to-action links out to Qopla
(external ordering) or `foryouburritos.se`.

It is being extended into a **Supabase-backed CMS** — see "Database" below. The page
copy is migrating from hardcoded consts in `Index.tsx` to rows in Supabase, editable
through an admin dashboard.

## Stack

Plain **Vite 7 + React 19 + TypeScript + Tailwind v4 + shadcn/ui**, `react-router-dom` v7.
`npm` (not bun). Builds to static files in `dist/` — deployable to any static host.

```
npm run dev        # vite dev server on :8080
npm run build      # -> dist/
npm run preview    # serve dist/
npm run typecheck  # tsc --noEmit
npm run lint
```

## History — this was a Lovable export, now de-Lovabled (2026-07-27)

Originally exported from Lovable as a **TanStack Start SSR** app
(template `tanstack_start_ts_2026-05-29`, project `dc690e36-c142-46c5-b6e8-aef5192a4c09`).
It could not run outside Lovable. All of the following were **removed**:

- `@lovable.dev/vite-tanstack-config` — the entire `vite.config.ts` was one closed
  Lovable package that hid the react/tailwind/router/nitro plugins, the `@` alias, and
  `componentTagger` (the plugin stamping `data-lov-id` on JSX for Lovable's visual editor).
  Replaced with an explicit 24-line `vite.config.ts`.
- `src/lib/lovable-error-reporting.ts` — pushed runtime errors to `window.__lovableEvents`.
- `src/assets/*.asset.json` — 7 JSON **stubs** standing in for real binaries (see below).
- `.lovable/project.json`, `bunfig.toml` (which carved a supply-chain-guard exception
  for the Lovable package), `bun.lock`.
- SSR scaffolding, all unused by this page: `server.ts`, `start.ts`, `error-capture.ts`,
  `error-page.ts`, `config.server.ts`, `lib/api/example.functions.ts`, `routeTree.gen.ts`,
  `nitro@3.x-beta` (Cloudflare-pinned), `@tanstack/react-router`, `@tanstack/react-start`.
- Lovable branding in `<head>`: `author: "Lovable"`, `twitter:site: "@Lovable"`, and an
  `og:image` hosted on `storage.googleapis.com/gpt-engineer-file-uploads/…`
  (gpt-engineer = Lovable's former name).

Verified after conversion: `tsc --noEmit` clean, `vite build` clean, `vite preview` serves
200s. **Zero remaining Lovable references** outside `public/assets/README.md`, which only
documents this history.

Do not reintroduce any of the above. If asked to "sync with Lovable," that is a one-way
break — this codebase is now independent.

## Binary assets — RESOLVED (2026-07-27)

Lovable's download stripped every binary asset, leaving JSON metadata pointing at
`/__l5e/assets-v1/…` (a path that only resolves on Lovable's domain). The user recovered
all originals from the Lovable site via browser DevTools → Sources and placed them in
`public/assets/`.

**All present and verified** — byte-exact against the original `.asset.json` manifests,
magic bytes confirmed, and served with correct MIME types from a production build:

| File | Bytes | Dimensions |
| --- | --- | --- |
| `BlackhawkItalic.otf` | 473 640 | OTF/CFF — the headline face |
| `logo.png` | 54 176 | 694×142 |
| `hero2.png` | 513 794 | 549×454 |
| `sushi.png` | 680 448 | 1190×971 |
| `varma.png` | 1 738 043 | 1920×1077 |
| `friterade.png` | 1 755 171 | 1920×1080 |

Do **not** re-add placeholders or treat these as missing. `src/pages/Index.tsx` and
`src/index.css` reference them by plain `/assets/<name>` URL (not by import), so replacing
a file is a drop-in overwrite with no code change.

**Still a placeholder:** `public/assets/og-image.png` (1200×630 grey box) — the social
preview referenced in `index.html`. Harmless, but should be replaced with a real image
before the site is shared on social media. It also needs an **absolute** URL in production
for crawlers to fetch it.

`public/assets/README.md` retains the Lovable asset IDs in case anything needs re-fetching.

### Client photo library (2026-07-28)

The client's own photos were pulled from the old WordPress site into `public/assets/`
under their original names (`sq.png`, `IMG_89*.jpg`, `lax-black.png`, `Hideko-*.png`,
`Kaeng-Ped-*.png`, `s-1-*.png`, `IMG_8725-*.png`). Four of those PNGs are **transparent
cut-outs**, which is why they look black in most previewers.

`/om-oss` uses four derivatives generated from them (~740 KB total, down from ~13 MB):

| Derivative | Source | Note |
| --- | --- | --- |
| `omoss-hero.jpg` | `IMG_8965-scaled.jpg` | hero, sits under a 75% navy tint |
| `omoss-butik.jpg` | `sq.png` | the storefront on Östergatan |
| `omoss-poke.jpg` | `Kaeng-Ped-*.png` | cut-out, flattened on `#f6f6f4` |
| `omoss-sushi.jpg` | `Hideko-*.png` | cut-out, flattened on white |

⚠️ The last two were transparent PNGs **cropped to their alpha bounding box and
flattened onto the exact background colour of the section they sit in**. They read as
floating cut-outs at a quarter of the PNG bytes — but if that section's background
colour changes, the image shows its box and must be regenerated. There is no
ImageMagick/sharp here; these were produced with `System.Drawing` from PowerShell.

`poke-bowl.png` (277×277, `/meny` masthead) is the one derivative that kept its alpha
rather than being flattened, so it is safe on any background. It was cropped from
`plate-removebg-preview.png`, whose 338×737 canvas was 86% empty alpha — an `<img>` of
the uncropped file reserves all that dead height. 277px is the entire asset: it is
capped at `max-w-[277px]` and must not be rendered wider.

The unused originals still ship in `dist/` (`public/` is copied wholesale) — roughly
20 MB of dead weight. Move them out of `public/` if that matters.

### Known issue: image payload

~4.5 MB of images load on first paint, and they are badly oversized for their display
boxes — `varma.png` and `friterade.png` are 1920px wide but render in a `h-20 sm:h-56`
card (~224px tall). This is the single biggest performance problem on the site.
If asked to speed up the page, start here: resize to ~2× display size, convert to WebP,
and add `loading="lazy"` to the menu-card images. Not yet done — the originals are kept
intact deliberately.

## Database — Supabase (free tier)

Project ref `dhmnupckpiukquqnhzpw`, EU region. Credentials in `.env` (gitignored);
`.env.example` documents the shape. Anon key is public by design — RLS is the guard.

### How to know what SQL has actually been applied

SQL is applied **by hand in the Supabase dashboard SQL Editor**, not via the Supabase
CLI. So `supabase/migrations/*.sql` records *intent*. Applied state lives in the
`schema_migrations` table, which is anon-readable specifically so it can be checked
over REST without dashboard access:

```bash
URL=$(grep VITE_SUPABASE_URL .env | cut -d= -f2-)
KEY=$(grep VITE_SUPABASE_ANON_KEY .env | cut -d= -f2-)
curl -sS "$URL/rest/v1/schema_migrations?select=*&order=version" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY"
```

**Check this before writing any migration** — never assume the folder and the database
agree. Every new migration file must end by inserting its own version row.

### Tables

| Table | Purpose |
| --- | --- |
| `site_content` | key/value copy — `hero.title_line1`, `menu.heading`, `seo.*` |
| `feature_tiles` | the 3 badges under the hero (`icon` = lucide-react name) |
| `menu_categories` | the 3 menu cards |
| `locations` | the 3 restaurant cards |
| `about_points` | the "Vår filosofi" bullets on `/om-oss` |
| `nav_links` | header + footer navigation |
| `opening_hours` | footer opening hours |
| `keep_alive` | single-row heartbeat, see below |
| `seo_daily` / `seo_queries` / `seo_pages` / `seo_vitals` / `seo_meta` | Search Console + PageSpeed figures for `/admin/seo`, see below |
| `schema_migrations` | the ledger above |

Content tables carry `sort_order`, `is_active`, and an auto-maintained `updated_at`.
Seeded from the original `Index.tsx` consts by `0002_seed_content.sql`.

### RLS

Enabled everywhere. Content tables: `select` for `anon` + `authenticated`, all writes
`authenticated` only. `keep_alive` has RLS on with **zero policies** — unreachable from
any browser; only `service_role` (which bypasses RLS) touches it.

### Reading content — `src/lib/cms.ts`

All pages read copy through hooks in `cms.ts`, never from Supabase directly:

```tsx
const t = useContent();          // t("hero.title_line1")
const locations = useLocations(); // also: useNavLinks, useOpeningHours,
                                  // useMenuCategories, useFeatureTiles, useContact
```

**Every hook falls back to hardcoded copy** and never throws, never blocks, never
renders empty. Supabase paused, env vars missing, RLS rejection, table not migrated
yet — all degrade to the last-known-good text. This is deliberate: the free tier
cold-starts slowly, and a marketing site must never render blank.

Consequences worth knowing:

- **`FALLBACK_*` in `cms.ts` must be updated alongside seeded content.** They ship in
  the JS bundle and are what visitors see before the fetch resolves. Stale fallbacks
  cause a visible flash of old copy.
- **An empty table is treated as "not configured", not "no content"** — deleting every
  row in the admin UI shows fallbacks rather than blanking a section.
- Multi-line copy is stored with `\n` and rendered with `whitespace-pre-line`, not
  `<br>`. Do not put markup in `site_content.value`.
- `contact.phone` is the only phone value; the `tel:` href is derived by stripping
  spaces in `useContact()`.
- `feature_tiles.icon` is a lucide-react *name*; `Index.tsx` maps it through `ICONS`
  and falls back to `Fish` for anything unrecognised. Adding an icon option to the
  admin UI means adding it to that map too.

`useAboutImage(key)` is the exception to "empty means fallback": the three optional
`omoss.*_image` slots return `null` unless the stored value is URL-shaped, because
`useContent()` resolves an empty value to the key name itself.

**Still hardcoded — not yet migrated:** `src/pages/Meny.tsx`, `src/pages/Catering.tsx`
(562 lines, lots of copy), and the `<head>` meta in `index.html`. Sweep these for
literal Swedish strings when extending the CMS.

### SEO dashboard — `/admin/seo` (2026-07-28)

The admin can see what people searched to reach the site. **The browser never
calls Google** — the Search Console API needs a private credential and everything
the admin page loads is public. Instead the keep-alive workflow (which already
runs on a schedule holding secrets) fetches the numbers and writes them into
Supabase, and `src/lib/seo-stats.ts` reads them like any other table.

```
keep-alive.yml ──> Search Console API ──> Supabase ──> /admin/seo
   (every 2 days, holds the secret)      (authenticated read only)
```

Deliberately **not** built like `cms.ts`: there are no fallbacks. Fabricating a
number would show the client traffic they don't have, so every hook returns an
empty array and the page renders a "Väntar på data från Google" state instead.

**"No data" is the expected state until the site is live and indexed** — days for
the first rows, weeks for useful ones. Do not treat an empty dashboard as a bug
without first checking `seo_meta.last_error`, which is where a failed fetch is
recorded so stale figures are never presented as current.

RLS differs from the content tables: `anon` gets **nothing** (which search terms
convert is competitive information, and the anon key is public), `authenticated`
gets select, and only `service_role` writes.

Optional GitHub secrets — **all three steps skip cleanly when unset**, so the
keep-alive ping is never at risk:

| Secret | Purpose |
| --- | --- |
| `SEARCH_CONSOLE_SITE_URL` | the property, either `https://foryouburritos.se/` or `sc-domain:foryouburritos.se` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | service account key; the account's email must be added as a user on the Search Console property |
| `PAGESPEED_API_KEY` | optional — PageSpeed works without it, just rate-limited |

`seo_queries` / `seo_pages` are a current top-25, replaced wholesale each run.
`seo_daily` is upserted on `day`, so a re-run corrects a day rather than
duplicating it.

### ⚠️ Keep-alive — non-negotiable

Supabase pauses free-tier projects after **7 days without queries**, which would take the
live site's text down. `.github/workflows/keep-alive.yml` calls the `keep_alive_ping()`
RPC every 2 days using `SUPABASE_SERVICE_ROLE_KEY` from GitHub Secrets.

Do not delete this workflow, and do not "optimize" the schedule past 7 days.

Second-order risk: **GitHub disables scheduled workflows after 60 days of no repo
activity.** Once the site stops being committed to, the cron can silently switch off and
the database then pauses. Verify the workflow is still enabled if content ever vanishes.

## Layout

```
index.html               # entry + all SEO/OG meta (single page, so meta lives here)
vite.config.ts           # react + tailwind plugins, "@" -> ./src, dev port 8080
src/
  main.tsx               # createRoot
  App.tsx                # QueryClientProvider + BrowserRouter + 4 routes
  index.css              # Tailwind v4 + @font-face(Blackhawk) + oklch design tokens
  pages/
    Index.tsx            # the landing page "/" — hero, menu cards, locations
    Meny.tsx             # "/meny" — the two menu spreads + order CTAs
    Catering.tsx         # "/catering" — hero, värden, erbjudanden, process, förfrågan
    OmOss.tsx            # "/om-oss" — intro, vår filosofi, vår vision. Fully CMS-driven.
    Kontakt.tsx          # "/kontakt" — masthead + live status, 7/5 bento, form, map
    NotFound.tsx
  components/
    SiteHeader.tsx       # shared header/nav, used by ALL pages
    SiteFooter.tsx       # shared footer — tagline, nav, öppettider, kontakt
    MenuThai.tsx         # /meny's Thai category — no printed sheet, one responsive view
    ui/                  # 50 shadcn components — ALL UNUSED, see below
  hooks/use-mobile.tsx   # unused
  pages/admin/
    AdminSeo.tsx         # "/admin/seo" — Search Console figures, read-only
  lib/
    seo-stats.ts         # read layer for the SEO tables. NO fallbacks, by design
    site.ts              # RED / NAVY / ORDER_HEADER / MENU_LINK / NAV_LINKS
                         # + TAGLINE / CONTACT / OPENING_HOURS
    utils.ts             # cn()
public/
  favicon.ico
  assets/                # recovered originals + Lovable asset-ID README
supabase/
  migrations/            # numbered .sql, applied by hand in the dashboard
.github/workflows/
  keep-alive.yml         # 2-day Supabase ping — do not remove
```

## Things worth knowing before editing

- **Brand + link constants live in `src/lib/site.ts`**, not per-page: `RED` (`#ac1136`),
  `NAVY` (`#0a1f44`), `ORDER_HEADER` (the one Qopla order URL every "Beställ" button uses),
  `MENU_LINK`, `NAV_LINKS`. Change an order link here and it changes everywhere.
  **These consts are being replaced by Supabase reads (Phase 3).** Until that lands, the
  DB rows and the consts are duplicates — edit both, or the CMS and the page disagree.
  `Index.tsx` still owns the `locations` array locally.
- **Real contact details live in `CONTACT` in `src/lib/site.ts`** (`info@foryouburritos.se`,
  `+46 431 31 14 14`, Östergatan 21). The old catering page printed these as text but linked
  them to `contact@mysite.com` / `123-456-7890` placeholders — always build `mailto:`/`tel:`
  hrefs from `CONTACT`, never retype them.
- **The catering form posts to a webhook placeholder.** `src/lib/catering-webhook.ts` owns
  the payload shape and the POST; `VITE_CATERING_WEBHOOK_URL` (optional, documented in
  `.env.example`) is the endpoint. Unset, down, timed out or CORS-rejected — every failure
  path falls through to the `mailto:` handoff to `CONTACT.email`, so a request is never
  silently dropped. In dev with no URL set, the payload is logged to the console.
  The URL **ships in the client bundle and is public**: use a catch hook, not an
  authenticated API, and rate-limit on the receiving end.
- **Redesign in progress (2026-07-27).** The new visual direction is negative-space /
  minimalistic / franchise, and `src/pages/Meny.tsx` is the first page built to it —
  generous vertical rhythm, a single large Blackhawk headline, hairline `border-border`
  rules instead of cards, one navy CTA band. Use it as the reference when converting the
  remaining sections; `/` is still the older denser layout.
- **`/meny`: both sheets are real text over blanked artwork.**
  `src/components/MenuSheet1.tsx` lays every item, price and descriptor over
  `public/assets/Menu1_empty.png` (the printed spread with the item lines erased), so
  sheet 01 is selectable, searchable and editable in code. Editing an item = editing the
  `POKE` / `STICKS` / `TILLAGG` / `BURRITOS` / `LUNCH` arrays in that file, **not** an
  image swap. Coordinates are original 1024x724 design pixels; positions are `%` and
  every size is `cqw`, so the sheet scales as one unit at any width.
  - The category banners, the burrito-stick price block, the LUNCH BOX banner and
    "ALLERGI ?" are part of the artwork, not text — don't re-add them.
  - `Menu1_empty.png` carries a burrito-stick photo in the LUNCH BOX card that the print
    does not have, sitting exactly where the numerals belong. `MenuSheet1` paints it out
    with a white div. If that background is ever regenerated without the stray photo,
    delete the mask.
  - The two faces (Lato, Montserrat) are self-hosted in `public/assets/fonts/` and
    declared in `index.css`. Sizes in `MenuSheet1` are calibrated to them — changing the
    font means recalibrating. `BASE` is the global baseline nudge.
  - To re-verify fidelity: render the component at 1024px and diff ink positions against
    `Menu1.png` (the original print, a **JPEG** despite the `.png` name).

- **⚠️ Every menu sheet has a second, reflowed rendering — edit the data, not one view.**
  `src/components/MenuList.tsx` stacks the same items in one column for narrow screens.
  It **imports the item arrays from the sheet components** and resolves every row under
  the *same* `menu_items` slug, so the two views cannot disagree — but that only holds
  while the copy stays in those arrays. Move an item's text into `MenuList.tsx` and you
  have created the duplicate this design exists to avoid.
  - The two swap at the width where that sheet's smallest type is still legible, and
    **that width differs per sheet**: 01 needs ~860px and switches at `lg`, 02 needs
    ~1100px (denser spread, 1440 design px against 01's 1024) and switches only at `xl`.
    Written out as full class strings in `SECTIONS`, since Tailwind scans source text
    and would never generate `` `hidden ${bp}:block` ``.
  - The page used to pan both sheets sideways below `md` instead. That put half of every
    spread off-screen on a phone, and left sheet 02 unreadable on tablets too. Don't
    reintroduce the pan container.
  - The print's own group headings and price blocks (`POKE BOWLS`, the 59:-/99:- stick
    block, `LUNCH BOX 119:-`, `MÅN-FRE 11-14`) are **artwork, not rows**, so they have no
    slug to read. `MenuList` restates them as `title` / `note` — re-export a sheet and
    they need checking by eye.
  - Both views are in the DOM at once. The hidden sheet's artwork is a `loading="lazy"`
    `<img>` inside `display:none`, which browsers don't fetch, so phones skip ~950 KB per
    sheet. Swapping `hidden` for a class that keeps a layout box would silently undo that.
  - In-place editing (`<T>`) is wired up in the **sheets only**. Two contentEditables
    bound to one row would share a draft slot, and `/admin/edit` is used at desktop width
    where the sheet is what renders.

- **The THAI category on `/meny` is the one section with no sheet** (added 2026-08-19,
  migration `0024`). It was never printed, so `src/components/MenuThai.tsx` is the whole
  of it: one responsive grid, 3 columns at `lg` down to 1 below `sm`. Everything above
  about pairing a sheet with a list does **not** apply to it — there is nothing to swap,
  its `SECTIONS` entry has no `Sheet`, and `listClass` is deliberately empty.
  - **It sits between the two spreads, not after them.** Placed last it read as an
    appendix rather than part of the menu, and the page closed on its plainest section.
    Section order in `SECTIONS` is `burritos` → `thai` → `sushi`.
  - **It carries a red banner for a reason.** Hairline rules on white made it look like
    a page of text dropped between two colour-saturated scans. Every group on the
    printed sheets is a bordered panel under a red banner of white tracked caps
    (`POKE BOWLS`, `TILLÄGG`), and `MenuList`'s `Group` already restates that device
    for phones — so this uses it too rather than inventing a third look. Don't flatten
    it back to plain rules.
  - The banner repeats the section's `<h2>` from the **same** `meny.thai_title` key and
    is deliberately **not** wrapped in `<T>` — two contentEditables on one key would
    share a draft slot. The `<h2>` is the editable one; the banner follows it on save,
    so it lags by one save inside `/admin/edit`.
  - Rows live under `sheet = 3` in `menu_items`, slugs `s3.thai.N`. The sheet number is
    only a grouping key for the fetch there; it does not name a scan.
  - Because nothing renders these rows twice, `<T>` **is** wired up on the items — so
    names, prices and descriptions are editable at `/admin/edit?page=meny`, and unlike
    the sheets, items can be added or removed by INSERT/DELETE rather than being pinned
    to a fixed slot in artwork.
  - Fallback copy lives in the `THAI` array in that file (deliberately not exported, so
    a second view cannot be built off it); the heading is `meny.thai_title` /
    `meny.thai_sub` in `site_content`, mirrored in `FALLBACK_CONTENT`.
  - No per-item photos, by choice. Prices are stored in the site's `119:-` form, not the
    ordering system's `119 kr`, so they match every other price on the page.
- **`/meny` needs an SPA rewrite on the host.** `vite preview` falls back to `index.html`
  automatically; a plain static host does not. Deep-linking `/meny` 404s without a
  `/* -> /index.html 200` rule.
- **All 50 files in `components/ui/` are unused.** `Index.tsx` imports nothing from them —
  only `lucide-react` icons. They are kept as scaffolding, which is why ~27 Radix packages
  are still in `dependencies`. Safe to delete the folder + those deps if slimming down;
  don't assume they are load-bearing.
- **Styling is mostly inline/arbitrary Tailwind, not the design system.** Navy `#0a1f44`
  and red `#ac1136` are hardcoded throughout `Index.tsx`. The full oklch token set in
  `index.css` (`--primary`, `--sidebar-*`, `--chart-*`, `.dark` block) is shadcn default
  scaffolding and is barely used — `border-border`, `text-muted-foreground`, `bg-background`
  only. **There is no dark mode toggle**; the `.dark` block is inert.
- **Tailwind v4**, configured in CSS (`@theme inline` in `index.css`). There is no
  `tailwind.config.js` and there should not be one.
- **`/` is now responsive (2026-07-28).** It used to hold `grid-cols-3` / `grid-cols-2`
  at every breakpoint with `text-[8px]`/`text-[9px]` type, which was documented here as
  intentional. The client reported the phone view as broken, so that is reverted: the
  hero, menu cards and location cards stack to one column below `sm:` and mobile type
  starts at `text-sm`/`text-xs`. Do not reintroduce the squeeze.
  Two things caused the page to render *panned sideways* on phones — worth knowing,
  because either is easy to recreate:
  1. The hero headline (`text-4xl` Blackhawk) sat in a half-width grid cell. Grid tracks
     are `minmax(auto, 1fr)`, so the overflowing word widened the track and pushed the
     whole document past the viewport.
  2. The header row (logo + phone + `BESTÄLL ONLINE` + burger) measured ~337px of
     content in the ~288px available at 320px. Resolved by the bottom bar below.
  `html { overflow-x: clip; overflow-y: auto }` in `index.css` is the backstop. Keep both
  axes spelled out: with `overflow-y` left `visible`, a non-visible x-axis makes it
  compute to `clip` too and the page stops scrolling vertically. `clip` not `hidden`,
  so the sticky header and the sticky order bar keep working.
- **⚠️ `MobileActionBar` and `SiteHeader` are a pair.** Below `md:` the header carries
  only the logo and the burger — order and call are deliberately *not* there, because
  `src/components/MobileActionBar.tsx` pins both to the bottom of the screen for the
  whole scroll, and duplicating them in the header is what overflowed the row above.
  **Any page rendering `<SiteHeader>` must also render `<MobileActionBar>` as its last
  child**, or that page has no order and no call action on mobile at all. All four
  public pages (`/`, `/meny`, `/catering`, `/om-oss`, `/kontakt`) do. It is `sticky`, not `fixed`,
  so it parks at the foot of the viewport while scrolling and then settles under the
  footer — no page needs compensating bottom padding.
- **Every route change lands at the top of the page.** `src/components/ScrollToTop.tsx`
  is rendered once inside `<BrowserRouter>` in `App.tsx` and covers all routes, so no
  page scrolls itself. It deliberately does *not* fire on back/forward (`POP`), which
  keeps its place, and a fragment in the URL (`/catering#offert`) wins over the top —
  the browser only resolves fragments on a full load, so that case is handled there.
  Same-page `<a href="#…">` links (`#offert`, `#burritos`) never reach it.
- **`/kontakt` reads `opening_hours` as data, not just text.** Its masthead badge says
  ÖPPET NU / STÄNGT JUST NU, computed in the browser from that table in
  `Europe/Stockholm` — the day is matched by the first three letters of `day_label`
  (`Tors` → `tor`) and `hours` is parsed as `H[:MM]–H[:MM]`. It fails *silent*: if
  today's label doesn't resolve to exactly one row, or the hours don't parse, no badge
  renders and today's row is simply not highlighted. So regrouping the rows into
  "Måndag till torsdag", or writing "Stängt" in an `hours` cell, turns the feature off
  rather than making the page lie. Nothing else on the site parses these values.
- **Any `<input>`/`<textarea>` must be ≥16px on phones** (`text-base sm:text-sm`). iOS
  Safari zooms the page in on focus for anything smaller and never zooms back out —
  this was the literal "stuck zoomed in" complaint on `/catering` and `/admin`.
- **Known typo in the design:** the hero reads `SHUSHI` (not `SUSHI`). It is in the
  original Lovable design. Leave it unless asked.
- Swedish copy — preserve `å ä ö` and don't translate section headings.
