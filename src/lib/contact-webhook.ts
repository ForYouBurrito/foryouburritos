/**
 * Kontakt form → webhook.
 *
 * Same contract as `catering-webhook.ts`, and the same PLACEHOLDER state: point
 * `VITE_CONTACT_WEBHOOK_URL` at anything that accepts a JSON POST and the form
 * starts delivering there. While it is unset the page keeps working — Kontakt.tsx
 * falls back to the `mailto:` handoff to CONTACT.email and logs the payload in dev.
 *
 * ⚠️ This URL ships in the client bundle and is therefore public — anyone can
 * POST to it. Use an endpoint that is safe to expose (a catch hook, not an
 * authenticated API), and put rate limiting / spam filtering on the receiving end.
 */

const rawUrl = import.meta.env.VITE_CONTACT_WEBHOOK_URL as string | undefined;

/** The configured endpoint, or null while the placeholder is unset. */
export const CONTACT_WEBHOOK_URL = rawUrl && rawUrl.trim() ? rawUrl.trim() : null;

export const hasContactWebhook = CONTACT_WEBHOOK_URL !== null;

/** How long to wait before giving up and falling back to `mailto:`. */
const TIMEOUT_MS = 10_000;

/** The form as the page holds it — Swedish keys, every value a string. */
export type ContactFormValues = {
  namn: string;
  mail: string;
  telefon: string;
  meddelande: string;
};

/**
 * What gets POSTed. Flat and English-keyed so a webhook consumer can map fields
 * without knowing Swedish; `summary` is the same block the `mailto:` fallback
 * sends, so an inbox-forwarding step needs no templating.
 */
export type ContactWebhookPayload = {
  form: "kontakt";
  submitted_at: string;
  page_url: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  summary: string;
};

/** Empty strings mean "not filled in" — send null rather than "". */
const orNull = (v: string) => {
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
};

/** Field-order labels, shared by the summary text and the `mailto:` body. */
export const summaryRows = (form: ContactFormValues): [string, string][] => [
  ["Namn & Efternamn", form.namn],
  ["Mail", form.mail],
  ["Telefonnummer", form.telefon],
  ["Meddelande", form.meddelande],
];

export const buildSummary = (form: ContactFormValues) =>
  summaryRows(form)
    .map(([label, value]) => `${label}: ${value || "-"}`)
    .join("\n");

export function buildContactPayload(form: ContactFormValues): ContactWebhookPayload {
  return {
    form: "kontakt",
    submitted_at: new Date().toISOString(),
    page_url: typeof window === "undefined" ? "" : window.location.href,
    name: form.namn.trim(),
    email: orNull(form.mail),
    phone: orNull(form.telefon),
    message: orNull(form.meddelande),
    summary: buildSummary(form),
  };
}

export type ContactSendResult =
  | { ok: true }
  /** `reason` is for the dev console, never for the visitor. */
  | { ok: false; reason: string };

/**
 * POST the payload. Never throws — the caller decides what to show, and every
 * failure path ends at the `mailto:` fallback so a message is never simply lost.
 */
export async function sendContactRequest(
  payload: ContactWebhookPayload,
): Promise<ContactSendResult> {
  if (!CONTACT_WEBHOOK_URL) {
    return { ok: false, reason: "VITE_CONTACT_WEBHOOK_URL is not set" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(CONTACT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    return { ok: true };
  } catch (err) {
    // Also covers the abort above and any CORS rejection.
    return { ok: false, reason: err instanceof Error ? err.message : "network error" };
  } finally {
    clearTimeout(timer);
  }
}
