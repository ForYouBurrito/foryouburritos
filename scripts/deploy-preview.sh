#!/usr/bin/env bash
#
# Publish a client-preview build to https://foryouburrito.github.io/
#
#   bash scripts/deploy-preview.sh
#
# This is a TEMPORARY preview for showing the client, not the production deploy.
# It is noindexed and lives on a throwaway address; the real site goes to
# foryouburritos.se on a host with proper rewrite support.
#
# ---------------------------------------------------------------------------
# Why a separate repo rather than Pages on this one
# ---------------------------------------------------------------------------
# GitHub Pages serves a project repo from /<repo>/. This site links 23 assets as
# absolute "/assets/…" paths across 12 files (Index, Meny, Kontakt, OmOss,
# Catering, both MenuSheets, menuSheetKit, SiteHeader, SiteFooter, cms.ts,
# index.html) — every one of them would 404 under a sub-path. A <user>.github.io
# repo serves from the ROOT, so the build works untouched: no vite `base`, no
# router basename, no edits to those files.
#
# Only the BUILT OUTPUT is pushed there. Source stays in this repo.
# ---------------------------------------------------------------------------
set -euo pipefail

REMOTE="https://ForYouBurrito@github.com/ForYouBurrito/ForYouBurrito.github.io.git"

cd "$(dirname "$0")/.."

echo "==> Building"
npx vite build

cd dist

# --- Keep the preview out of Google ---------------------------------------
# A temporary address indexed by Google competes with the real domain later and
# splits the ranking between two copies of the same site. Injected into the
# build rather than into the source index.html, so the source stays clean and
# the real deploy can never be accidentally shipped noindexed.
#
# MUST run before the route copies below, or every copy but "/" ships without it.
node -e '
const fs = require("fs");
const tag = `<meta name="robots" content="noindex, nofollow" />`;
let s = fs.readFileSync("index.html", "utf8");
if (!s.includes(tag)) fs.writeFileSync("index.html", s.replace("<head>", `<head>\n    ${tag}`), "utf8");
'

# --- GitHub Pages has no SPA rewrite rule ---------------------------------
# Pages looks for a FILE at /meny. A plain SPA has none, so every route except
# "/" 404s. Two layers deal with that:
#
#   1. A real index.html at each route's own path, so Pages serves /meny with a
#      200 like any other page. The app renders in the browser, so the same HTML
#      works for every route — only the URL differs, and the router reads that
#      at runtime.
#   2. 404.html as a catch-all, so a typo or a route added later still boots the
#      app (landing on NotFound) instead of GitHub's own 404 page.
#
# KEEP THIS LIST IN STEP WITH src/App.tsx. A route missing here still works via
# 404.html, but answers with a 404 status.
ROUTES="meny catering om-oss kontakt admin admin/login admin/edit admin/settings admin/seo"
for r in $ROUTES; do
  mkdir -p "$r"
  cp index.html "$r/index.html"
done

cp index.html 404.html

cat > robots.txt <<'EOF'
# Temporary client preview. The real site lives at foryouburritos.se.
User-agent: *
Disallow: /
EOF

# Pages runs Jekyll by default, which strips paths beginning with an underscore.
# Vite emits none today, but this costs nothing and fails silently otherwise.
touch .nojekyll

echo "==> Publishing"
# dist/ is gitignored in this repo, so a .git of its own cannot confuse it.
rm -rf .git
git init -q -b main
git config user.name  "ForYouBurrito"
git config user.email "diaabarri@gmail.com"
git add -A
git commit -q -m "Preview build $(date -u +%Y-%m-%d\ %H:%M) UTC"
# Force: this repo only ever holds the current build, never a history to keep.
git push -q --force "$REMOTE" main

echo
echo "==> Live at https://foryouburrito.github.io/"
echo "    Takes 1-2 minutes to appear."
