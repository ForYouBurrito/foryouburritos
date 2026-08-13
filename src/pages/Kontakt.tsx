import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";

import EditableImage from "@/components/EditableImage";
import MobileActionBar from "@/components/MobileActionBar";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { useContact, useContent, useOpeningHours, type OpeningHourRow } from "@/lib/cms";
import {
  buildContactPayload,
  buildSummary,
  hasContactWebhook,
  sendContactRequest,
} from "@/lib/contact-webhook";
import { T } from "@/lib/editing";
import { NAVY, RED } from "@/lib/site";

/**
 * "/kontakt" — same vocabulary as /catering and /om-oss (navy bands, large
 * Blackhawk type, alternating white / #f6f6f4 / navy surfaces, the full-bleed
 * map closing into the footer), but each block gets its own treatment rather
 * than three identical white cards in a row:
 *
 *   Ring/maila  -> a navy slab where the phone number IS the headline
 *   Öppettider  -> a departure board, with today's row picked out live
 *   Besöka oss  -> the storefront photo itself, address set in Blackhawk over it
 *
 * The masthead opens on a tinted photo, same as /om-oss and /catering. It is a
 * different photograph from the shopfront further down the page — that one is
 * shown as itself in the "Besöka oss" tile and would read as a repeat here.
 *
 * The page holds no copy of its own. Every string comes from `site_content`
 * under the `kontakt.` prefix and is wrapped in <T> so it is editable in place at
 * /admin/edit?page=kontakt — including the form's field labels and the address
 * the map is pinned to.
 *
 * Opening hours are the ONE exception, and deliberately so: they are read from
 * the shared `opening_hours` table that the footer already uses, not from a
 * `kontakt.hours` list of their own. The spec asked for a single source of truth
 * so the two can never drift, and this is it — regrouping the rows ("Måndag till
 * torsdag") is an edit to that table, not a second copy of the data.
 */

const shopfront = { src: "/assets/omoss-butik.jpg", width: 1200, height: 1059 };

// Derived from the client's IMG_8906 at 1800px/q74, the same recipe as
// /assets/omoss-hero.jpg. It sits under a heavy navy tint, so it can take more
// compression than an image shown as itself.
const heroBg = { src: "/assets/kontakt-hero.jpg", width: 1800, height: 1010 };

const DISPLAY = { fontFamily: '"Blackhawk", "Arial Black", Impact, sans-serif' } as const;
const BODY = "text-[#0a1f44]/70";
/** Brand red is ~1.9:1 on navy — unreadable as text. This tint reads 5.3:1. */
const RED_ON_NAVY = "#ff5a78";

/** Small all-caps label used above each block. */
const EYEBROW = "text-[11px] font-bold tracking-[0.28em] uppercase sm:text-xs";

// text-base below sm: iOS Safari zooms the whole page in when a focused field is
// under 16px, and never zooms back out. py-3 keeps every control >=44px tall.
const inputClass =
  "w-full rounded-sm border border-border bg-white px-3.5 py-3 text-base sm:text-sm text-[#0a1f44] outline-none transition placeholder:text-muted-foreground focus:border-[#0a1f44] focus:ring-2 focus:ring-[#0a1f44]/15";
const labelClass = "block text-[11px] font-bold tracking-[0.14em] text-[#0a1f44] sm:text-xs";

/* ── Open right now? ──────────────────────────────────────────────────────── */

/** "11–21", "11:00 – 21:00", "11.00-21" — anything else is treated as unparsable. */
const HOURS_RANGE = /^\s*(\d{1,2})(?:[:.](\d{2}))?\s*[–—-]\s*(\d{1,2})(?:[:.](\d{2}))?\s*$/;

/** Lowercased, letters only, first three: "Tors", "tors." and "Torsdag" -> "tor". */
const dayKey = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-zåäö]/g, "")
    .slice(0, 3);

/** Wall-clock time in Malmö, not in the visitor's timezone. */
function stockholmNow() {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: dayKey(part("weekday")),
    minutes: (Number(part("hour")) % 24) * 60 + Number(part("minute")),
  };
}

/**
 * Which `opening_hours` row is today, and whether we are inside it.
 *
 * Deliberately conservative. Those rows are CMS-editable free text: a label can
 * become "Måndag till torsdag" and an `hours` value can become "Stängt". When
 * today's label doesn't resolve to exactly one row, or the hours don't parse as
 * a range, this returns null and the page simply renders no status — announcing
 * "STÄNGT" because a string failed to parse would be worse than saying nothing.
 */
function useOpenNow(rows: OpeningHourRow[]) {
  const [now, setNow] = useState(stockholmNow);

  useEffect(() => {
    const id = window.setInterval(() => setNow(stockholmNow()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => {
    const today = rows.filter((r) => dayKey(r.day_label) === now.day);
    if (today.length !== 1) return null;

    const m = HOURS_RANGE.exec(today[0].hours);
    if (!m) return null;

    const opens = Number(m[1]) * 60 + Number(m[2] ?? 0);
    const closes = Number(m[3]) * 60 + Number(m[4] ?? 0);
    const isOpen =
      closes > opens
        ? now.minutes >= opens && now.minutes < closes
        : now.minutes >= opens || now.minutes < closes; // a range past midnight

    return { key: today[0].id ?? today[0].day_label, isOpen };
  }, [rows, now]);
}

/* ── Form pieces ──────────────────────────────────────────────────────────── */

/** Label + control. Labels are visible, not placeholder-only, and CMS-editable. */
function Field({
  labelKey,
  htmlFor,
  required = false,
  children,
  className = "",
}: {
  labelKey: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClass}>
        <T k={labelKey} />
        {required && (
          <span style={{ color: RED }} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

const EMPTY_FORM = { namn: "", mail: "", telefon: "", meddelande: "" };

/** idle → sending → sent (webhook took it) | mailto (handed to the mail client). */
type SubmitStatus = "idle" | "sending" | "sent" | "mailto";

export default function Kontakt() {
  const t = useContent();
  const contact = useContact();
  const openingHours = useOpeningHours();
  const openNow = useOpenNow(openingHours);

  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const set = (key: keyof typeof EMPTY_FORM) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  /** The fallback: hand the filled-in message to the visitor's mail client. */
  const mailtoHref = () =>
    `mailto:${contact.email}?subject=${encodeURIComponent(
      `Meddelande via foryouburritos.se – ${form.namn}`,
    )}&body=${encodeURIComponent(buildSummary(form))}`;

  /**
   * POST to VITE_CONTACT_WEBHOOK_URL when configured. Until it is — and whenever
   * the endpoint is down, times out or rejects CORS — the message falls through
   * to `mailto:` rather than being dropped on the floor.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const payload = buildContactPayload(form);

    if (hasContactWebhook) {
      const result = await sendContactRequest(payload);
      if (result.ok) {
        setForm(EMPTY_FORM);
        setStatus("sent");
        return;
      }
      console.warn("[kontakt] webhook failed, falling back to mailto:", result.reason);
    } else if (import.meta.env.DEV) {
      console.info("[kontakt] no VITE_CONTACT_WEBHOOK_URL set. Payload:", payload);
    }

    window.location.href = mailtoHref();
    setStatus("mailto");
  };

  // The address the map is pinned to is a CMS value, so the pin can be re-pointed
  // without a deploy if the restaurant ever moves.
  const mapAddress = t("kontakt.map_address");
  const mapsHref = `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}`;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* ── Masthead ──────────────────────────────────────────────────────────
          A food shot under a 75% navy tint, then pure type over it — the same
          construction and the same tint as the /om-oss hero, deliberately, so
          the three inner pages open identically. The live status sits directly
          under the headline: the first thing a visitor to a contact page wants
          to know is whether anyone is there right now. */}
      <section className="relative isolate overflow-hidden" style={{ backgroundColor: NAVY }}>
        <EditableImage
          variant="corner"
          imageKey="kontakt.hero_image"
          fallback={heroBg.src}
          alt=""
          ariaHidden
          width={heroBg.width}
          height={heroBg.height}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          hint="Liggande bild — ligger under en mörk ton"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundColor: NAVY, opacity: 0.75 }} />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-16 sm:px-6 sm:pt-24 sm:pb-28">
          <T as="p" k="kontakt.eyebrow" className={`${EYEBROW} text-white/70`} />
          <div
            className="mt-6 h-1.5 w-16 sm:w-24"
            style={{ backgroundColor: RED_ON_NAVY }}
            aria-hidden="true"
          />
          {/* uppercase via CSS, not .toUpperCase() — editing writes back the stored
              casing ("Kontakta oss"), not the shouted display form. */}
          <h1 className="mt-6" style={DISPLAY}>
            <T
              k="kontakt.title"
              className="block text-6xl leading-[0.85] text-white uppercase sm:text-8xl lg:text-[8.5rem]"
            />
          </h1>

          {/* Only one of the two keys renders at a time, so in /admin/edit the
              editable one is whichever currently applies. */}
          {openNow && (
            <p
              className={`mt-8 inline-flex items-center gap-2.5 rounded-full px-4 py-2 ${EYEBROW} ${
                openNow.isOpen ? "bg-white/15 text-white" : "border border-white/25 text-white/60"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${openNow.isOpen ? "animate-pulse" : ""}`}
                style={{ backgroundColor: openNow.isOpen ? RED_ON_NAVY : "rgba(255,255,255,0.4)" }}
                aria-hidden="true"
              />
              <T k={openNow.isOpen ? "kontakt.status_open" : "kontakt.status_closed"} />
            </p>
          )}
        </div>
      </section>

      {/* ── The three blocks ──────────────────────────────────────────────────
          A 7/5 bento rather than three equal cards: the phone slab and the
          shopfront stack down the left, the hours board runs the full height of
          both on the right, which is exactly the shape seven rows want. */}
      <section className="bg-[#f6f6f4]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24">
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-12">
            {/* Ring / maila — the number set as a headline, and tappable as one. */}
            <div
              className="rounded-lg p-7 sm:p-10 lg:col-span-7 lg:col-start-1 lg:row-start-1"
              style={{ backgroundColor: NAVY }}
            >
              <div className="flex items-center gap-3">
                <Phone
                  className="h-4 w-4 shrink-0"
                  style={{ color: RED_ON_NAVY }}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <T as="h2" k="kontakt.contact_title" className={`${EYEBROW} text-white/70`} />
              </div>

              {/* The number carries spaces, so it wraps at them rather than
                  overflowing the panel at 320px. */}
              <a
                href={`tel:${contact.phoneHref}`}
                aria-label={`Ring oss på ${contact.phone}`}
                className="mt-6 block text-[1.9rem] leading-[0.95] text-white uppercase transition hover:opacity-80 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a1f44] focus-visible:outline-none sm:mt-8 sm:text-5xl lg:text-6xl"
                style={DISPLAY}
              >
                {contact.phone}
              </a>

              <div className="mt-8 border-t border-white/15 pt-6">
                <T as="p" k="kontakt.email_label" className={`${EYEBROW} text-white/50`} />
                <a
                  href={`mailto:${contact.email}`}
                  className="mt-2 inline-flex min-h-11 items-center gap-2.5 text-base break-all text-white/90 transition hover:text-white sm:text-lg"
                >
                  <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  {contact.email}
                </a>
              </div>
            </div>

            {/* Öppettider — a board, with leader rules carrying the eye across.
                The shared table, not a second copy: editing a row here changes
                the footer too, which is the point. */}
            <div className="flex flex-col rounded-lg border border-[#0a1f44]/10 bg-white p-7 shadow-[0_8px_30px_rgba(10,31,68,0.06)] sm:p-10 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
              <div className="flex items-center gap-3">
                <Clock
                  className="h-4 w-4 shrink-0"
                  style={{ color: RED }}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <T as="h2" k="kontakt.hours_title" className={`${EYEBROW} text-[#0a1f44]`} />
              </div>

              <dl className="mt-7 flex flex-1 flex-col justify-center">
                {openingHours.map((o) => {
                  const isToday = openNow?.key === (o.id ?? o.day_label);
                  return (
                    <div
                      key={o.id ?? o.day_label}
                      className={`-mx-3 flex items-center gap-3 rounded-sm px-3 py-2.5 text-base sm:text-lg ${
                        isToday ? "bg-[#0a1f44]/5 font-bold text-[#0a1f44]" : BODY
                      }`}
                    >
                      <dt className="shrink-0">
                        <T row={o} table="opening_hours" field="day_label" />
                      </dt>
                      <span
                        className="min-w-4 flex-1 border-b border-dotted border-[#0a1f44]/25"
                        aria-hidden="true"
                      />
                      <dd className="shrink-0 tabular-nums">
                        <T row={o} table="opening_hours" field="hours" />
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            {/* Besöka oss — the shopfront itself, address set over it. */}
            <div
              className="relative isolate overflow-hidden rounded-lg lg:col-span-7 lg:col-start-1 lg:row-start-2"
              style={{ backgroundColor: NAVY }}
            >
              <EditableImage
                variant="corner"
                imageKey="kontakt.shopfront_image"
                fallback={shopfront.src}
                alt=""
                ariaHidden
                width={shopfront.width}
                height={shopfront.height}
                loading="lazy"
                decoding="async"
                hint="Bild på butiken — ligger under en mörk ton"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0" style={{ backgroundColor: NAVY, opacity: 0.72 }} />

              <div className="relative p-7 sm:p-10">
                <div className="flex items-center gap-3">
                  <MapPin
                    className="h-4 w-4 shrink-0"
                    style={{ color: RED_ON_NAVY }}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <T as="h2" k="kontakt.visit_title" className={`${EYEBROW} text-white/70`} />
                </div>

                <address className="mt-6 not-italic sm:mt-8" style={DISPLAY}>
                  <T
                    as="span"
                    k="kontakt.visit_address_line1"
                    className="block text-3xl leading-[0.95] text-white uppercase sm:text-4xl lg:text-5xl"
                  />
                  <T
                    as="span"
                    k="kontakt.visit_address_line2"
                    className="mt-1 block text-3xl leading-[0.95] text-white/60 uppercase sm:text-4xl lg:text-5xl"
                  />
                </address>

                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex min-h-11 items-center gap-2 text-xs font-bold tracking-[0.15em] text-white underline-offset-4 transition hover:underline"
                >
                  <T k="kontakt.visit_cta_label" />
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form ──────────────────────────────────────────────────────────────
          Split band: the headline holds the left third so the white card is one
          element in a composition rather than a slab dropped in the middle. */}
      <section style={{ backgroundColor: NAVY }}>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <T as="p" k="kontakt.form_eyebrow" className={`${EYEBROW} text-white/70`} />
              <div
                className="mt-6 h-1.5 w-16"
                style={{ backgroundColor: RED_ON_NAVY }}
                aria-hidden="true"
              />
              <div style={DISPLAY}>
                <T
                  as="h2"
                  k="kontakt.form_title"
                  className="mt-6 block text-4xl leading-[0.9] text-white uppercase sm:text-5xl lg:text-6xl"
                />
              </div>
              <p className="mt-5 text-sm leading-relaxed text-white/80 sm:text-base">
                <T as="span" k="kontakt.form_intro" /> <span style={{ color: RED_ON_NAVY }}>*</span>
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-xl bg-white p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)] sm:p-8 lg:col-span-8 lg:p-10"
            >
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                {/* Namn spans the full width; Mail and Telefonnummer share row two. */}
                <Field
                  labelKey="kontakt.form_name"
                  htmlFor="kontakt-namn"
                  required
                  className="sm:col-span-2"
                >
                  <input
                    id="kontakt-namn"
                    name="namn"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.namn}
                    onChange={(e) => set("namn")(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field labelKey="kontakt.form_email" htmlFor="kontakt-mail">
                  <input
                    id="kontakt-mail"
                    name="mail"
                    type="email"
                    autoComplete="email"
                    value={form.mail}
                    onChange={(e) => set("mail")(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field labelKey="kontakt.form_phone" htmlFor="kontakt-telefon">
                  <input
                    id="kontakt-telefon"
                    name="telefon"
                    type="tel"
                    autoComplete="tel"
                    value={form.telefon}
                    onChange={(e) => set("telefon")(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field
                  labelKey="kontakt.form_message"
                  htmlFor="kontakt-meddelande"
                  className="sm:col-span-2"
                >
                  <textarea
                    id="kontakt-meddelande"
                    name="meddelande"
                    rows={6}
                    value={form.meddelande}
                    onChange={(e) => set("meddelande")(e.target.value)}
                    className={inputClass + " resize-y"}
                  />
                </Field>
              </div>

              {/* SKICKA centred below the fields, per the spec's layout note. */}
              <div className="mt-10 flex flex-col items-center gap-4 border-t border-border pt-8">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{ backgroundColor: RED }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-sm px-8 py-4 text-xs font-bold tracking-[0.15em] text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#ac1136] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm"
                >
                  {status === "sending" ? (
                    <>
                      <T k="kontakt.form_submit_sending" />{" "}
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <T k="kontakt.form_submit" /> <Send className="h-4 w-4" />
                    </>
                  )}
                </button>

                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex min-h-11 items-center gap-2 text-xs font-bold tracking-[0.15em] text-[#0a1f44] underline-offset-4 transition hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" strokeWidth={2} /> {contact.email}
                </a>
              </div>

              {/* aria-live so the outcome is announced without stealing focus. */}
              <div aria-live="polite">
                {status === "sent" && (
                  <p
                    className="mt-6 flex items-start gap-2 rounded-sm bg-[#0a1f44]/5 p-4 text-sm text-[#0a1f44]"
                    role="status"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                    <T k="kontakt.form_sent" />
                  </p>
                )}
                {status === "mailto" && (
                  <p className={`mt-6 rounded-sm bg-[#0a1f44]/5 p-4 text-sm ${BODY}`} role="status">
                    <T as="span" k="kontakt.form_mailto" />{" "}
                    <a
                      href={`mailto:${contact.email}`}
                      className="font-semibold text-[#0a1f44] underline underline-offset-2"
                    >
                      {contact.email}
                    </a>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── Map — the page's closing element, full width ──────────────────
          Same construction as "/": the address sits in a navy gradient rising off
          the bottom edge, in the footer's exact #0a1f44, so the band and the
          footer read as one continuous block. pointer-events-none keeps the map
          pannable everywhere except the text itself.
          hidden below sm: SiteFooter now carries its own CAROLI map band on
          mobile, so this one would otherwise repeat directly above it. */}
      <section className="relative hidden sm:block">
        <iframe
          title={t("kontakt.map_title")}
          src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`}
          className="block h-72 w-full border-0 sm:h-96"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-2/3 flex-col justify-end bg-gradient-to-t from-[#0a1f44] via-[#0a1f44]/90 to-transparent px-4 pb-6 text-center sm:pb-10">
          <div className="pointer-events-auto mx-auto max-w-7xl">
            <h2 className="text-base font-bold tracking-wide text-white sm:text-lg">
              <T k="kontakt.visit_title" className="uppercase" />
            </h2>
            <p className="mt-1.5 text-sm text-white/80">
              <T as="span" k="kontakt.map_address" />
            </p>
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-xs font-bold tracking-[0.15em] text-white underline-offset-4 transition hover:underline"
            >
              <T k="kontakt.map_cta_label" />
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />

      <MobileActionBar />
    </div>
  );
}
