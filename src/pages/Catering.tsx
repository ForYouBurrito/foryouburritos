import { useState } from "react";
import {
  ArrowRight,
  Leaf,
  Mail,
  Phone,
  Send,
  SlidersHorizontal,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { CONTACT, NAVY, RED } from "@/lib/site";

const hero = "/assets/hero2.png";
const sushi = "/assets/sushi.png";

const VALUE_PROPS = [
  {
    Icon: Leaf,
    title: "Färska ingredienser",
    copy: "Våra rätter tillagas med noggrant utvalda råvaror för att garantera bästa smak och kvalitet.",
  },
  {
    Icon: UtensilsCrossed,
    title: "Mångsidig meny",
    copy: "Från sushi och wok till poke bowls och thailändska curryrätter – vi har något för alla smaker.",
  },
  {
    Icon: SlidersHorizontal,
    title: "Flexibla lösningar",
    copy: "Vi anpassar menyn efter dina behov, oavsett om det är en liten samling eller ett större event.",
  },
  {
    Icon: Sparkles,
    title: "Professionell service",
    copy: "Vårt team ser till att allt är perfekt, från matens presentation till leveransen.",
  },
];

const OFFERINGS = [
  {
    title: "Sushi-plattor",
    copy: "Perfekta för mingel eller som förrätt, med allt från klassiska makirullar till våra signatur-rullar.",
  },
  {
    title: "Sushi Burrito Sticks",
    copy: "Smidigt, gott och fullt av smak! Perfekt balanserade rullar fyllda med färska ingredienser, serverade i en lättätlig stick-form.",
  },
  {
    title: "Poke Bowls",
    copy: "Fräscha och färgstarka bowls, perfekt för en hälsosam och modern touch.",
  },
  {
    title: "Friterade specialiteter",
    copy: "Krispiga och läckra alternativ som alla älskar.",
  },
  {
    title: "Vegetariska och veganska alternativ",
    copy: "För att se till att alla gäster är nöjda.",
  },
];

const STEPS = [
  {
    title: "Planering",
    copy: "Kontakta oss med information om ditt event, antal gäster och önskemål.",
  },
  { title: "Menyanpassning", copy: "Vi hjälper dig att välja rätter som passar dina behov." },
  {
    title: "Leverans",
    copy: "Vi levererar maten direkt till ditt event – alltid fräsch och redo att serveras.",
  },
  {
    title: "Extra tjänster",
    copy: "Behöver du porslin, serveringspersonal eller något annat? Vi fixar det!",
  },
];

const DISHES = [
  "Sushi-plattor",
  "Poke Bowls",
  "Friterade specialiteter",
  "Sushi Burrito",
  "Sushi Burrito Sticks",
  "Vegetariska och veganska alternativ",
];

const inputClass =
  "w-full rounded-sm border border-border bg-white px-3 py-2.5 text-sm text-[#0a1f44] outline-none transition placeholder:text-muted-foreground focus:border-[#0a1f44] focus:ring-2 focus:ring-[#0a1f44]/10";
const labelClass = "block text-[10px] font-bold tracking-[0.15em] text-[#0a1f44] sm:text-[11px]";

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
          <span className="block cursor-pointer rounded-sm border border-border py-2.5 text-center text-[11px] font-bold tracking-[0.15em] text-[#0a1f44] transition hover:bg-gray-50 peer-checked:border-[#0a1f44] peer-checked:bg-[#0a1f44] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#0a1f44]/20">
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

export default function Catering() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [dishes, setDishes] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof EMPTY_FORM) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleDish = (dish: string) =>
    setDishes((d) => (d.includes(dish) ? d.filter((x) => x !== dish) : [...d, dish]));

  /**
   * There is no backend on this site, so the form hands the filled-in request to the
   * visitor's mail client addressed to the real inbox. Swap this for a Supabase insert
   * (or a form endpoint) once one exists — the field names above are the payload.
   */
  const mailtoHref = () => {
    const rows: [string, string][] = [
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
    const body = rows.map(([k, v]) => `${k}: ${v || "-"}`).join("\n");
    return `mailto:${CONTACT.email}?subject=${encodeURIComponent(
      `Cateringförfrågan – ${form.namn}`,
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.location.href = mailtoHref();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 sm:pt-20 sm:pb-16">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <p className="text-[10px] font-bold tracking-[0.35em] text-muted-foreground sm:text-xs">
              CATERING
            </p>
            <h1
              className="mt-4 leading-[0.9] sm:mt-6"
              style={{ fontFamily: '"Blackhawk", "Arial Black", Impact, sans-serif' }}
            >
              <span className="block text-5xl text-black sm:text-7xl lg:text-8xl">FOR YOU</span>
              <span className="block text-5xl sm:text-7xl lg:text-8xl" style={{ color: RED }}>
                BURRITOS
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-8 sm:text-base">
              Oavsett om du planerar en familjemiddag, företagsevent eller en större fest, erbjuder
              For You Burritos catering fylld med smakrika och kreativa rätter. Våra sushi burritos,
              sticks och bowls är perfekt balanserade och anpassade för alla tillfällen. Med färska
              ingredienser och unika smakkombinationer garanterar vi en upplevelse som överraskar
              och imponerar. Låt oss göra ditt evenemang oförglömligt med mat tillagad med passion
              och kärlek!
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
              <a
                href="#offert"
                style={{ backgroundColor: RED }}
                className="inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3.5 text-xs font-bold tracking-[0.15em] text-white transition hover:opacity-90 sm:px-8 sm:py-4 sm:text-sm"
              >
                BEGÄR OFFERT <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={`tel:${CONTACT.phoneHref}`}
                className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-[#0a1f44] underline-offset-4 transition hover:underline sm:text-sm"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={2} /> {CONTACT.phone}
              </a>
            </div>
          </div>
          <div>
            <img
              src={hero}
              alt="Sushi burrito"
              width={549}
              height={454}
              className="w-full"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-20">
        <div className="grid gap-8 border-t border-border pt-8 sm:grid-cols-2 sm:gap-10 sm:pt-12 lg:grid-cols-4">
          {VALUE_PROPS.map((v) => (
            <div key={v.title}>
              <v.Icon className="h-6 w-6 text-[#0a1f44]" strokeWidth={1.5} />
              <h2 className="mt-4 text-xs font-bold tracking-[0.15em] text-[#0a1f44] sm:text-sm">
                {v.title.toUpperCase()}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {v.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Vad vi erbjuder */}
      <section
        id="erbjudanden"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-12 sm:px-6 sm:pb-20"
      >
        <div className="border-t border-border pt-8 sm:pt-12">
          <div className="flex items-start gap-4 sm:gap-6">
            <span className="text-xs font-bold tracking-[0.2em] sm:text-sm" style={{ color: RED }}>
              01
            </span>
            <div>
              <h2 className="text-xl font-black tracking-wide text-[#0a1f44] sm:text-3xl">
                VAD VI ERBJUDER
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
                Sushi-plattor, sticks, bowls och friterat — anpassat efter ditt tillfälle.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {OFFERINGS.map((o) => (
              <div
                key={o.title}
                className="rounded-xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <h3 className="text-xs font-bold tracking-[0.1em] text-[#0a1f44] sm:text-base">
                  {o.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {o.copy}
                </p>
              </div>
            ))}
            {/* Sixth cell fills the 3-column grid — brand image, no copy of its own. */}
            <div className="hidden overflow-hidden rounded-xl border border-border shadow-sm lg:block">
              <img
                src={sushi}
                alt="Sushi från For You Burritos"
                width={1190}
                height={971}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Så fungerar det */}
      <section
        id="sa-fungerar-det"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-12 sm:px-6 sm:pb-20"
      >
        <div className="border-t border-border pt-8 sm:pt-12">
          <div className="flex items-start gap-4 sm:gap-6">
            <span className="text-xs font-bold tracking-[0.2em] sm:text-sm" style={{ color: RED }}>
              02
            </span>
            <div>
              <h2 className="text-xl font-black tracking-wide text-[#0a1f44] sm:text-3xl">
                SÅ FUNGERAR DET
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
                Fyra steg från första kontakt till serverad mat.
              </p>
            </div>
          </div>

          <ol className="mt-6 grid gap-6 sm:mt-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="border-t-2 border-[#0a1f44]/10 pt-4">
                <span
                  className="text-xs font-bold tracking-[0.2em] sm:text-sm"
                  style={{ color: RED }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-xs font-bold tracking-[0.15em] text-[#0a1f44] sm:text-sm">
                  {s.title.toUpperCase()}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {s.copy}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Cateringförfrågan */}
      <section id="offert" className="scroll-mt-16" style={{ backgroundColor: NAVY }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold tracking-[0.35em] text-white/50 sm:text-xs">
              CATERINGFÖRFRÅGAN
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-wide text-white sm:text-4xl">
              BERÄTTA OM DITT EVENT
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-white/60 sm:text-sm">
              Fyll i formuläret så återkommer vi med ett förslag. Fält märkta med{" "}
              <span style={{ color: RED }}>*</span> är obligatoriska.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-xl bg-white p-5 shadow-sm sm:mt-10 sm:p-8 lg:p-10"
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
                        <span
                          className="block cursor-pointer rounded-full border border-border px-4 py-2 text-[11px] font-semibold text-[#0a1f44] transition hover:bg-gray-50 peer-checked:border-transparent peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#0a1f44]/20 sm:text-xs"
                          style={checked ? { backgroundColor: RED } : undefined}
                        >
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

            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
              <button
                type="submit"
                style={{ backgroundColor: RED }}
                className="inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3.5 text-xs font-bold tracking-[0.15em] text-white transition hover:opacity-90 sm:px-8 sm:py-4 sm:text-sm"
              >
                SKICKA FÖRFRÅGAN <Send className="h-4 w-4" />
              </button>
              <a
                href={`mailto:${CONTACT.email}`}
                className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-[#0a1f44] underline-offset-4 transition hover:underline"
              >
                <Mail className="h-3.5 w-3.5" strokeWidth={2} /> {CONTACT.email}
              </a>
            </div>

            {sent && (
              <p className="mt-4 text-xs text-muted-foreground" role="status">
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
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
