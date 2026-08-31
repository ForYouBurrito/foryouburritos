# Form delivery — the two n8n webhooks

Two public forms, two webhooks, two spreadsheets. Nothing is shared between them:
a broken catering workflow cannot stop a contact message, and vice versa.

```
/kontakt   ──┬──> Supabase contact_submissions  ──> /admin/forms
             └──> VITE_CONTACT_WEBHOOK_URL      ──> n8n ──> Sheet "Kontakt"

/catering  ──┬──> Supabase catering_submissions ──> /admin/forms
             └──> VITE_CATERING_WEBHOOK_URL     ──> n8n ──> Sheet "Catering"
```

## Why both destinations, and what happens when one dies

The browser fires both at once (`Promise.all` in `Kontakt.tsx` / `Catering.tsx`)
and treats **either one succeeding as delivered**. This is deliberate — it is why
the site does not forward from Supabase to n8n with a Database Webhook, which
would put the two in a chain and give the chain a single point of failure.

| Situation | Panel | Sheet | Visitor sees |
| --- | --- | --- | --- |
| Both fine | row | row | "Tack, vi hör av oss" |
| n8n down / deactivated / CORS wrong | row | — | success (fault logged to console) |
| Supabase paused or unreachable | — | row | success (fault logged to console) |
| Both down | — | — | mail client opens, prefilled |
| Webhook URLs not set at all | row | — | success |

So the **spreadsheet and the panel can legitimately disagree**, and neither is a
copy of the other. A row in one but not the other means the other destination
failed at that moment — check the browser console, not a sync job. There isn't one.

## Setting up a workflow (do this twice)

1. **Webhook node**
   - Method `POST`
   - Path: something unguessable, e.g. `fyb-kontakt-9f2c` / `fyb-catering-9f2c`.
     The URL ships in the public JS bundle, so anyone can read it and POST to it.
   - Respond: `Immediately` (the site ignores the body, it only reads the status).
   - **Options → Allowed Origins (CORS): `https://foryouburritos.se`**
     ⚠️ This is the step that gets missed. The site sends
     `Content-Type: application/json`, which makes the browser send a `OPTIONS`
     preflight first. Without this setting n8n rejects the preflight, the POST is
     never sent at all, and the failure is invisible except in the console.
     Use `*` while testing, then narrow it.
2. **Google Sheets node** — operation `Append Row`, mapped per the tables below.
3. **Activate the workflow.** An inactive workflow's production URL returns 404.
4. Copy the **Production URL** (`https://…/webhook/fyb-kontakt-9f2c`) — *not* the
   Test URL (`/webhook-test/`), which only works while you have the editor open —
   into `.env`, then rebuild. These are `VITE_` vars: they are baked in at build
   time, so changing `.env` does nothing until `npm run build` runs again.

## Sheet columns

Header row for each sheet, in order. Field names are exactly the JSON keys the
site POSTs, so mapping is one-to-one except where noted.

### Kontakt

| Column | JSON field | Note |
| --- | --- | --- |
| Inkom | `submitted_at` | ISO 8601 UTC. For Swedish local time: `{{ DateTime.fromISO($json.submitted_at).setZone("Europe/Stockholm").toFormat("yyyy-MM-dd HH:mm") }}` |
| Namn | `name` | |
| Mail | `email` | may be null |
| Telefon | `phone` | may be null |
| Meddelande | `message` | may be null |
| Sida | `page_url` | which URL it was sent from |

### Catering

| Column | JSON field | Note |
| --- | --- | --- |
| Inkom | `submitted_at` | as above |
| Namn | `name` | |
| Mail | `email` | |
| Telefon | `phone` | |
| Evenemangstyp | `event_type` | |
| Datum | `date` | `YYYY-MM-DD`, browser-guaranteed |
| Tid | `time` | `HH:MM` |
| Antal gäster | `guests` | a real number, or null |
| Serveringspersonal | `staff` | **`true` / `false` / `null`** — null means they never touched the control, which is not the same as "Nej". Render it: `{{ $json.staff === null ? "" : ($json.staff ? "Ja" : "Nej") }}` |
| Leverans | `delivery` | same three-state rule |
| Maträtter | `dishes` | an **array**. Sheets needs a string: `{{ $json.dishes.join(", ") }}` |
| Önskemål | `comment` | |
| Sida | `page_url` | |

Both payloads also carry:

- `form` — `"kontakt"` or `"catering"`. Constant per workflow; useful only if you
  ever merge both into one sheet.
- `summary` — the whole submission already formatted as a labelled Swedish text
  block, one field per line. This is what the `mailto:` fallback sends. Drop it
  into a "Send Email" node and no templating is needed.

## Testing

With the workflow active and the URL in `.env`:

```bash
curl -i -X POST "$VITE_CONTACT_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"form":"kontakt","submitted_at":"2026-08-31T10:00:00.000Z","page_url":"https://foryouburritos.se/kontakt","name":"Test Testsson","email":"test@example.com","phone":"+46 70 000 00 00","message":"Testmeddelande","summary":"Namn & Efternamn: Test Testsson"}'
```

A 200 with a row in the sheet means the n8n half works. `curl` does **not** test
CORS — only a real browser submit does. Submit the form on the deployed site and
watch the console: `[kontakt] n8n webhook failed: …` is the CORS setting.

## Spam

`contact_submissions` / `catering_submissions` are the only tables on the site
`anon` can write to, and the n8n paths are public. The column length checks in
`0025_form_submissions.sql` cap the size of a junk row but do not prevent one.

If it becomes a problem, the fix is a Turnstile/hCaptcha token verified in a
Supabase Edge Function — not tightening the constraints, and not removing anon
insert, which would break the forms entirely.
