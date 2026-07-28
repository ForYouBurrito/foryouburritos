/**
 * Catering form → webhook.
 *
 * PLACEHOLDER: no endpoint is wired yet. Point `VITE_CATERING_WEBHOOK_URL` at
 * anything that accepts a JSON POST — a Zapier/Make/n8n catch hook, a Supabase
 * Edge Function, a Formspree endpoint — and the form starts delivering there.
 * While it is unset the page keeps working: `Catering.tsx` falls back to the
 * `mailto:` handoff and logs the payload in dev so you can see the exact shape.
 *
 * ⚠️ This URL ships in the client bundle and is therefore public — anyone can
 * POST to it. Use an endpoint that is safe to expose (a catch hook, not an
 * authenticated API), and put rate limiting / spam filtering on the receiving
 * end rather than here.
 */

const rawUrl = import.meta.env.VITE_CATERING_WEBHOOK_URL as string | undefined;

/** The configured endpoint, or null while the placeholder is unset. */
export const CATERING_WEBHOOK_URL = rawUrl && rawUrl.trim() ? rawUrl.trim() : null;

export const hasCateringWebhook = CATERING_WEBHOOK_URL !== null;

/** How long to wait before giving up and falling back to `mailto:`. */
const TIMEOUT_MS = 10_000;

/** The form as the page holds it — Swedish keys, every value a string. */
export type CateringFormValues = {
  namn: string;
  mail: string;
  telefon: string;
  evenemangstyp: string;
  datum: string;
  tid: string;
  gaster: string;
  personal: string;
  leverans: string;
  kommentar: string;
};

/**
 * What gets POSTed. Deliberately flat and English-keyed: webhook consumers map
 * fields by name, and "Ja"/"Nej" becomes a real boolean so a receiver can branch
 * on it without knowing Swedish. `summary` is the same human-readable block the
 * `mailto:` fallback sends, so an inbox-forwarding step needs no templating.
 */
export type CateringWebhookPayload = {
  form: "catering";
  submitted_at: string;
  page_url: string;
  name: string;
  email: string | null;
  phone: string | null;
  event_type: string | null;
  date: string | null;
  time: string | null;
  guests: number | null;
  staff: boolean | null;
  delivery: boolean | null;
  dishes: string[];
  comment: string | null;
  summary: string;
};

/** Empty strings mean "not filled in" — send null rather than "". */
const orNull = (v: string) => {
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
};

/** The Ja/Nej controls are unset until touched, so the third state is null. */
const yesNo = (v: string) => (v === "Ja" ? true : v === "Nej" ? false : null);

/** Field-order labels, shared by the summary text and the `mailto:` body. */
export const summaryRows = (form: CateringFormValues, dishes: string[]): [string, string][] => [
  ["Fullständigt namn", form.namn],
  ["Mail", form.mail],
  ["Telefonnummer", form.telefon],
  ["Evenemangstyp", form.evenemangstyp],
  ["Datum", form.datum],
  ["Tid", form.tid],
  ["Antal gäster", form.gaster],
  ["Serveringspersonal", form.personal],
  ["Leverans", form.leverans],
  ["Maträtter", dishes.join(", ")],
  ["Önskemål / kommentar", form.kommentar],
];

export const buildSummary = (form: CateringFormValues, dishes: string[]) =>
  summaryRows(form, dishes)
    .map(([label, value]) => `${label}: ${value || "-"}`)
    .join("\n");

export function buildCateringPayload(
  form: CateringFormValues,
  dishes: string[],
): CateringWebhookPayload {
  const guests = Number.parseInt(form.gaster, 10);

  return {
    form: "catering",
    submitted_at: new Date().toISOString(),
    page_url: typeof window === "undefined" ? "" : window.location.href,
    name: form.namn.trim(),
    email: orNull(form.mail),
    phone: orNull(form.telefon),
    event_type: orNull(form.evenemangstyp),
    date: orNull(form.datum),
    time: orNull(form.tid),
    guests: Number.isFinite(guests) ? guests : null,
    staff: yesNo(form.personal),
    delivery: yesNo(form.leverans),
    dishes,
    comment: orNull(form.kommentar),
    summary: buildSummary(form, dishes),
  };
}

export type CateringSendResult =
  | { ok: true }
  /** `reason` is for the dev console, never for the visitor. */
  | { ok: false; reason: string };

/**
 * POST the payload. Never throws — the caller decides what to show, and any
 * failure path ends at the `mailto:` fallback so a request is never simply lost.
 */
export async function sendCateringRequest(
  payload: CateringWebhookPayload,
): Promise<CateringSendResult> {
  if (!CATERING_WEBHOOK_URL) {
    return { ok: false, reason: "VITE_CATERING_WEBHOOK_URL is not set" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(CATERING_WEBHOOK_URL, {
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
