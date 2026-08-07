import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Leaf,
  Loader2,
  Mail,
  Phone,
  Send,
  SlidersHorizontal,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import { InfoBlock, InfoGrid } from "@/components/InfoBlock";
import MobileActionBar from "@/components/MobileActionBar";
import Reviews from "@/components/Reviews";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  buildCateringPayload,
  buildSummary,
  hasCateringWebhook,
  sendCateringRequest,
} from "@/lib/catering-webhook";
import { useCateringBlocks } from "@/lib/cms";
import { T } from "@/lib/editing";
import { CONTACT, NAVY, RED } from "@/lib/site";

const heroBg = "/assets/varma.png";
/**
 * The client's transparent cut-out, pre-flattened onto #f6f6f4 — the exact
 * background of the offerings band it sits on. Identical on screen to compositing
 * the PNG live, at 65 KB instead of 534 KB. Regenerate it if that band's colour
 * ever changes, or it will show as a grey rectangle.
 */
const pokeBowl = { src: "/assets/omoss-poke.jpg", width: 900, height: 506 };

// Brand red on navy is ~1.9:1 — fine for a decorative rule, unreadable as text.
// The form's required-field asterisk uses this brightened tint instead (5.3:1).
const RED_ON_NAVY = "#ff5a78";

/** Blackhawk carries the brand voice. With no hero image, the type does that work. */
const DISPLAY = { fontFamily: '"Blackhawk", "Arial Black", Impact, sans-serif' } as const;

// The värden / erbjudanden / process cards now come from `catering_blocks`.
// Their fallback copy lives in cms.ts (FALLBACK_CATERING_BLOCKS) so it ships in
// the bundle; duplicating it here would guarantee the two drift apart.

const DISHES = [
  "Sushi-plattor",
  "Poke Bowls",
  "Friterade specialiteter",
  "Sushi Burrito",
  "Sushi Burrito Sticks",
  "Vegetariska och veganska alternativ",
];

/** Body copy. Navy at 70% reads ~6.4:1 on white — the grey token only managed 4.7:1. */
const BODY = "text-[#0a1f44]/70";

// text-base below sm: iOS Safari zooms the whole page in when a focused field is
// under 16px, and never zooms back out. Keep 16px on phones, 14px from sm up.
// py-3 puts every control at >=44px tall, the minimum comfortable touch target.
const inputClass =
  "w-full rounded-sm border border-border bg-white px-3.5 py-3 text-base sm:text-sm text-[#0a1f44] outline-none transition placeholder:text-muted-foreground focus:border-[#0a1f44] focus:ring-2 focus:ring-[#0a1f44]/15";
const labelClass = "block text-[11px] font-bold tracking-[0.14em] text-[#0a1f44] sm:text-xs";

/** Section heading — Blackhawk title over a one-line summary. */
function SectionHead({ titleKey, subKey }: { titleKey: string; subKey: string }) {
  return (
    <div>
      <T
        as="h2"
        k={titleKey}
        className="text-3xl leading-none text-[#0a1f44] sm:text-5xl lg:text-6xl"
        style={DISPLAY}
      />
      <T as="p" k={subKey} className={`mt-3 max-w-2xl text-sm sm:text-base ${BODY}`} />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required = false,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
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

/** Ja/Nej segmented control — used for both Serveringspersonal and Leverans. */
function YesNo({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {["Ja", "Nej"].map((option) => (
        <label key={option} className="flex-1">
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
            className="peer sr-only"
          />
          <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-sm border border-border text-[11px] font-bold tracking-[0.14em] text-[#0a1f44] transition hover:bg-gray-50 peer-checked:border-[#0a1f44] peer-checked:bg-[#0a1f44] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#0a1f44]/30 peer-focus-visible:ring-offset-2">
            {option.toUpperCase()}
          </span>
        </label>
      ))}
    </div>
  );
}

const EMPTY_FORM = {
  namn: "",
  mail: "",
  telefon: "",
  evenemangstyp: "",
  datum: "",
  tid: "",
  gaster: "",
  personal: "",
  leverans: "",
  kommentar: "",
};

/** idle → sending → sent (webhook took it) | mailto (handed to the mail client). */
type SubmitStatus = "idle" | "sending" | "sent" | "mailto";

/** catering_blocks.icon holds a lucide name; the CMS stores text, not components. */
const VALUE_ICONS = { Leaf, UtensilsCrossed, SlidersHorizontal, Sparkles } as const;

export default function Catering() {
  const valueProps = useCateringBlocks("varden");
  const offerings = useCateringBlocks("erbjudanden");
  const steps = useCateringBlocks("process");

  const [form, setForm] = useState(EMPTY_FORM);
  const [dishes, setDishes] = useState<string[]>([]);
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const set = (key: keyof typeof EMPTY_FORM) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleDish = (dish: string) =>
    setDishes((d) => (d.includes(dish) ? d.filter((x) => x !== dish) : [...d, dish]));

  /** The fallback: hand the filled-in request to the visitor's mail client. */
  const mailtoHref = () =>
    `mailto:${CONTACT.email}?subject=${encodeURIComponent(
      `Cateringförfrågan – ${form.namn}`,
    )}&body=${encodeURIComponent(buildSummary(form, dishes))}`;

  /**
   * POST to VITE_CATERING_WEBHOOK_URL when it is configured. Until it is — and
   * whenever the endpoint is down, times out or rejects CORS — the request falls
   * through to `mailto:` rather than being dropped on the floor.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const payload = buildCateringPayload(form, dishes);

    if (hasCateringWebhook) {
      const result = await sendCateringRequest(payload);
      if (result.ok) {
        setForm(EMPTY_FORM);
        setDishes([]);
        setStatus("sent");
        return;
      }
      console.warn("[catering] webhook failed, falling back to mailto:", result.reason);
    } else if (import.meta.env.DEV) {
      // No endpoint yet — show what would have been sent.
      console.info("[catering] no VITE_CATERING_WEBHOOK_URL set. Payload:", payload);
    }

    window.location.href = mailtoHref();
    setStatus("mailto");
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────────────────
          Food photo under a 75% navy tint — deliberately not "/"'s hero2.png.
          varma.png is the right shot for this: wide, close-up, and already dark
          behind the subject, so it survives a heavy overlay instead of flattening
          the way a top-down plate on white marble would. The extra bottom padding
          is the runway the value-prop cards overlap into. */}
      <section className="relative isolate overflow-hidden" style={{ backgroundColor: NAVY }}>
        <img
          src={heroBg}
          alt=""
          width={1920}
          height={1077}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* The tint. 75% navy over the image's brightest region still leaves white
            text at ~7.3:1, so the headline holds up wherever the photo crops to. */}
        <div className="absolute inset-0" style={{ backgroundColor: NAVY, opacity: 0.75 }} />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-16 sm:px-6 sm:pt-24 sm:pb-24">
          <T
            as="p"
            k="catering.eyebrow"
            className="text-[11px] font-bold tracking-[0.35em] text-white/80 sm:text-xs"
          />

          {/* Same red as the BEGÄR OFFERT button below it. */}
          <div
            className="mt-6 h-1.5 w-16 sm:w-24"
            style={{ backgroundColor: RED }}
            aria-hidden="true"
          />

          <T
            as="h1"
            k="catering.title"
            className="mt-6 text-6xl leading-[0.85] text-white sm:text-8xl lg:text-[8.5rem]"
            style={DISPLAY}
          />

          <T
            as="p"
            k="catering.intro"
            className="mt-8 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base"
          />

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <a
              href="#offert"
              style={{ backgroundColor: RED }}
              className="inline-flex items-center justify-center gap-2 rounded-sm px-8 py-4 text-xs font-bold tracking-[0.15em] text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1f44] focus-visible:outline-none sm:text-sm"
            >
              <T k="catering.cta_quote_label" /> <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-white/25 px-6 text-xs font-bold tracking-[0.15em] text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1f44] focus-visible:outline-none sm:min-h-14 sm:text-sm"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={2} /> {CONTACT.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ── Value props ──────────────────────────────────────────────────────
          No longer lifted cards: the overlap only worked because each block had
          an opaque white fill, and these are containerless now. They sit on plain
          white below the hero instead, separated by whitespace rather than by
          borders. */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <InfoGrid className="sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((v) => {
            const Icon = VALUE_ICONS[v.icon as keyof typeof VALUE_ICONS] ?? Leaf;
            return (
              <InfoBlock key={v.id ?? v.title} Icon={Icon}>
                {/* uppercase via CSS so editing writes back the stored casing. */}
                <T
                  as="h2"
                  row={v}
                  table="catering_blocks"
                  field="title"
                  className="text-sm font-bold tracking-[0.14em] text-[#0a1f44] uppercase sm:text-base"
                />
                <T
                  as="p"
                  row={v}
                  table="catering_blocks"
                  field="body"
                  className={`mt-3 text-sm leading-relaxed sm:text-base ${BODY}`}
                />
              </InfoBlock>
            );
          })}
        </InfoGrid>
      </section>

      {/* ── Vad vi erbjuder ──────────────────────────────────────────────────
          Menu-board list, not a card grid: numbered rows scan top-to-bottom in
          one pass, which is how a fast-food board is read. */}
      <section
        id="erbjudanden"
        className="mt-16 scroll-mt-20 bg-[#f6f6f4] sm:mt-24 sm:scroll-mt-28"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24">
          <SectionHead titleKey="catering.offerings_title" subKey="catering.offerings_sub" />

          <div className="mt-10 grid gap-10 sm:mt-14 lg:grid-cols-12 lg:gap-12">
            <ol className="lg:col-span-7">
              {offerings.map((o, i) => (
                <li
                  key={o.id ?? o.title}
                  className="flex gap-4 border-b border-[#0a1f44]/12 py-5 last:border-b-0 sm:gap-6 sm:py-6"
                >
                  <span
                    className="w-7 shrink-0 pt-0.5 text-sm font-black tabular-nums sm:text-base"
                    style={{ color: RED }}
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <T
                      as="h3"
                      row={o}
                      table="catering_blocks"
                      field="title"
                      className="text-base font-bold text-[#0a1f44] sm:text-lg"
                    />
                    <T
                      as="p"
                      row={o}
                      table="catering_blocks"
                      field="body"
                      className={`mt-1.5 text-sm leading-relaxed ${BODY}`}
                    />
                  </div>
                </li>
              ))}
            </ol>

            {/* Appetite appeal, desktop only. A cut-out rather than a framed photo:
                object-contain and no rounding, so the bowl sits directly on the
                #f6f6f4 band with nothing boxing it in. */}
            <div className="hidden lg:col-span-5 lg:block">
              <img
                src={pokeBowl.src}
                alt="Poke bowl från For You Burritos"
                width={pokeBowl.width}
                height={pokeBowl.height}
                loading="lazy"
                decoding="async"
                className="sticky top-28 h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Så fungerar det ──────────────────────────────────────────────────
          A connected stepper rather than four floating columns, so the four
          steps read as one sequence. */}
      <section
        id="sa-fungerar-det"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:scroll-mt-28 sm:px-6 sm:py-24"
      >
        <SectionHead titleKey="catering.process_title" subKey="catering.process_sub" />

        <ol className="mt-10 grid gap-8 sm:mt-14 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-6">
          {steps.map((s, i) => (
            <li key={s.id ?? s.title}>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums text-white"
                  style={{ backgroundColor: NAVY }}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* Rail linking each step to the next — desktop row only. */}
                {i < steps.length - 1 && (
                  <span
                    className="hidden h-px flex-1 bg-[#0a1f44]/15 lg:block"
                    aria-hidden="true"
                  />
                )}
              </div>
              <T
                as="h3"
                row={s}
                table="catering_blocks"
                field="title"
                className="mt-5 text-xs font-bold tracking-[0.14em] text-[#0a1f44] uppercase sm:text-sm"
              />
              <T
                as="p"
                row={s}
                table="catering_blocks"
                field="body"
                className={`mt-2.5 text-sm leading-relaxed ${BODY}`}
              />
            </li>
          ))}
        </ol>
      </section>

      {/* Proof immediately before the form — the last thing read before deciding
          whether this kitchen is worth trusting with an event. */}
      <Reviews className="bg-[#f6f6f4]" />

      {/* ── Cateringförfrågan ────────────────────────────────────────────── */}
      <section
        id="offert"
        className="scroll-mt-20 sm:scroll-mt-28"
        style={{ backgroundColor: NAVY }}
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <T
              as="p"
              k="catering.form_eyebrow"
              className="text-[11px] font-bold tracking-[0.35em] text-white/70 sm:text-xs"
            />
            <T
              as="h2"
              k="catering.form_title"
              className="mt-5 text-3xl leading-none text-white sm:text-5xl lg:text-6xl"
              style={DISPLAY}
            />
            <p className="mt-5 text-sm leading-relaxed text-white/80 sm:text-base">
              Fyll i formuläret så återkommer vi med ett förslag. Fält märkta med{" "}
              <span style={{ color: RED_ON_NAVY }}>*</span> är obligatoriska.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10 rounded-xl bg-white p-5 shadow-[0_16px_50px_rgba(0,0,0,0.25)] sm:mt-14 sm:p-8 lg:p-12"
          >
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              <Field label="Fullständigt namn" htmlFor="namn" required className="sm:col-span-2">
                <input
                  id="namn"
                  name="namn"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.namn}
                  onChange={(e) => set("namn")(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Mail" htmlFor="mail">
                <input
                  id="mail"
                  name="mail"
                  type="email"
                  autoComplete="email"
                  value={form.mail}
                  onChange={(e) => set("mail")(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Telefonnummer" htmlFor="telefon">
                <input
                  id="telefon"
                  name="telefon"
                  type="tel"
                  autoComplete="tel"
                  value={form.telefon}
                  onChange={(e) => set("telefon")(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Evenemangstyp" htmlFor="evenemangstyp">
                <input
                  id="evenemangstyp"
                  name="evenemangstyp"
                  type="text"
                  value={form.evenemangstyp}
                  onChange={(e) => set("evenemangstyp")(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Antal gäster" htmlFor="gaster">
                <input
                  id="gaster"
                  name="gaster"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={form.gaster}
                  onChange={(e) => set("gaster")(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Datum" htmlFor="datum">
                <input
                  id="datum"
                  name="datum"
                  type="date"
                  value={form.datum}
                  onChange={(e) => set("datum")(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Tid" htmlFor="tid">
                <input
                  id="tid"
                  name="tid"
                  type="time"
                  value={form.tid}
                  onChange={(e) => set("tid")(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Serveringspersonal" htmlFor="personal">
                <YesNo name="personal" value={form.personal} onChange={set("personal")} />
              </Field>

              {/* The source page rendered "Leverans" twice; it is one Ja/Nej question. */}
              <Field label="Leverans" htmlFor="leverans">
                <YesNo name="leverans" value={form.leverans} onChange={set("leverans")} />
              </Field>

              {/* Maträtter — multi-select */}
              <fieldset className="sm:col-span-2">
                <legend className={labelClass}>Maträtter</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {DISHES.map((dish) => {
                    const checked = dishes.includes(dish);
                    return (
                      <label key={dish}>
                        <input
                          type="checkbox"
                          name="ratter"
                          value={dish}
                          checked={checked}
                          onChange={() => toggleDish(dish)}
                          className="peer sr-only"
                        />
                        {/* Selected state carries a checkmark as well as the red fill —
                            colour alone is not a reliable signal. */}
                        <span
                          className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-border px-4 text-xs font-semibold text-[#0a1f44] transition hover:bg-gray-50 peer-checked:border-transparent peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#0a1f44]/30 peer-focus-visible:ring-offset-2 sm:text-sm"
                          style={checked ? { backgroundColor: RED } : undefined}
                        >
                          {checked && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />}
                          {dish}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <Field label="Önskemål / kommentar" htmlFor="kommentar" className="sm:col-span-2">
                <textarea
                  id="kommentar"
                  name="kommentar"
                  rows={5}
                  value={form.kommentar}
                  onChange={(e) => set("kommentar")(e.target.value)}
                  className={inputClass + " resize-y"}
                />
              </Field>
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
              <button
                type="submit"
                disabled={status === "sending"}
                style={{ backgroundColor: RED }}
                className="inline-flex items-center justify-center gap-2 rounded-sm px-8 py-4 text-xs font-bold tracking-[0.15em] text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#ac1136] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
              >
                {status === "sending" ? (
                  <>
                    SKICKAR… <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    SKICKA FÖRFRÅGAN <Send className="h-4 w-4" />
                  </>
                )}
              </button>
              <a
                href={`mailto:${CONTACT.email}`}
                className="inline-flex min-h-11 items-center gap-2 text-xs font-bold tracking-[0.15em] text-[#0a1f44] underline-offset-4 transition hover:underline sm:text-sm"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={2} /> {CONTACT.email}
              </a>
            </div>

            {/* Submit outcome. aria-live so it is announced without stealing focus. */}
            <div aria-live="polite">
              {status === "sent" && (
                <p
                  className="mt-6 flex items-start gap-2 rounded-sm bg-[#0a1f44]/5 p-4 text-sm text-[#0a1f44]"
                  role="status"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                  Tack! Din förfrågan är skickad — vi återkommer så snart vi kan.
                </p>
              )}

              {status === "mailto" && (
                <p className={`mt-6 rounded-sm bg-[#0a1f44]/5 p-4 text-sm ${BODY}`} role="status">
                  Din e-postklient öppnas med förfrågan ifylld. Öppnas den inte? Mejla oss direkt på{" "}
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="font-semibold text-[#0a1f44] underline underline-offset-2"
                  >
                    {CONTACT.email}
                  </a>
                  .
                </p>
              )}
            </div>
          </form>
        </div>
      </section>

      <SiteFooter />

      <MobileActionBar />
    </div>
  );
}
