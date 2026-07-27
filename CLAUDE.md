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
| `keep_alive` | single-row heartbeat, see below |
| `schema_migrations` | the ledger above |

Content tables carry `sort_order`, `is_active`, and an auto-maintained `updated_at`.
Seeded from the original `Index.tsx` consts by `0002_seed_content.sql`.

### RLS

Enabled everywhere. Content tables: `select` for `anon` + `authenticated`, all writes
`authenticated` only. `keep_alive` has RLS on with **zero policies** — unreachable from
any browser; only `service_role` (which bypasses RLS) touches it.

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
  App.tsx                # QueryClientProvider + BrowserRouter + 2 routes
  index.css              # Tailwind v4 + @font-face(Blackhawk) + oklch design tokens
  pages/
    Index.tsx            # THE ENTIRE SITE — one file, ~150 lines
    NotFound.tsx
  components/ui/         # 50 shadcn components — ALL UNUSED, see below
  hooks/use-mobile.tsx   # unused
  lib/utils.ts           # cn()
public/
  favicon.ico
  assets/                # recovered originals + Lovable asset-ID README
supabase/
  migrations/            # numbered .sql, applied by hand in the dashboard
.github/workflows/
  keep-alive.yml         # 2-day Supabase ping — do not remove
```

## Things worth knowing before editing

- **`src/pages/Index.tsx` is the whole site.** Data lives in module-scope consts at the
  top: `RED` (`#ac1136`), `ORDER_HEADER`, `MENU_LINK`, and the `locations` array.
  **These consts are being replaced by Supabase reads (Phase 3).** Until that lands, the
  DB rows and the consts are duplicates — edit both, or the CMS and the page disagree.
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
- **The page is deliberately `grid-cols-3` / `grid-cols-2` at every breakpoint**, with
  tiny mobile type (`text-[8px]`, `text-[9px]`). Squeezed-looking mobile layout is
  intentional, not a bug — confirm before "fixing" it.
- **Known typo in the design:** the hero reads `SHUSHI` (not `SUSHI`). It is in the
  original Lovable design. Leave it unless asked.
- Swedish copy — preserve `å ä ö` and don't translate section headings.
