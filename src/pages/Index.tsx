import { useState } from "react";
import { ArrowRight, Fish, Hand, Flame, Menu, X } from "lucide-react";

// Served straight from public/assets/ — drop the real files in there and they
// appear at these URLs. See public/assets/README.md for the exact filenames.
const logo = "/assets/logo.png";
const hero = "/assets/hero2.png";
const sushi = "/assets/sushi.png";
const varma = "/assets/varma.png";
const friterade = "/assets/friterade.png";

const RED = "#ac1136";
const ORDER_HEADER = "https://foryou.qopla.com/restaurant/for-you-burritos-/qRbQ9pebDD/order";
const MENU_LINK = "https://foryouburritos.se/";

// Nav items. `href` starting with "#" scrolls to a section on this page; the rest
// point at foryouburritos.se until those sections exist here.
const NAV_LINKS = [
  { label: "MENY", href: "#meny" },
  { label: "CATERING", href: MENU_LINK },
  { label: "OM OSS", href: MENU_LINK },
  { label: "KONTAKTA OSS", href: "#besok-oss" },
];

const locations = [
  {
    name: "Västra Hamnen",
    address1: "Einar Hansens Esplanad 31,",
    address2: "211 75 Malmö",
    order:
      "https://foryou.qopla.com/restaurant/thai-n-sushi-for-you---vastra-hamnen/qomYBBd13K/order",
    site: "https://foryouburritos.se/",
    mapQ: "Einar Hansens Esplanad 31, 211 75 Malmö",
  },
  {
    name: "Caroli",
    address1: "Östergatan 21,",
    address2: "211 25 Malmö",
    order: "https://foryou.qopla.com/restaurant/for-you-burritos-/qRbQ9pebDD/order",
    site: "https://foryouburritos.se/",
    mapQ: "Östergatan 21, 211 25 Malmö",
  },
  {
    name: "Caroli",
    address1: "Kyrkogatan 21,",
    address2: "222 22 Lund, Sweden",
    order: "https://foryou.qopla.com/restaurant/for-you-burritos-/qRbQ9pebDD/order",
    site: "https://www.thaisushiforyou.se/",
    mapQ: "Kyrkogatan 21, 222 22 Lund",
  },
];

export default function Index() {
  const [navOpen, setNavOpen] = useState(false);
  const btnRed =
    "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 text-sm font-bold tracking-wider text-white transition hover:opacity-90";
  const btnOutline =
    "inline-flex items-center justify-center gap-2 rounded-sm border-2 border-[#0a1f44] bg-white px-5 py-3 text-sm font-bold tracking-wider text-[#0a1f44] transition hover:bg-gray-50";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">
          <img src={logo} alt="For You Burritos" className="h-8 w-auto shrink-0 sm:h-12" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                {...(l.href.startsWith("#")
                  ? {}
                  : { target: "_blank", rel: "noopener noreferrer" })}
                className="whitespace-nowrap text-xs font-bold tracking-wider text-[#0a1f44] transition hover:opacity-70"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={ORDER_HEADER}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: RED }}
              className={
                btnRed +
                " shrink-0 whitespace-nowrap gap-1 text-[9px] px-2 py-1.5 sm:gap-2 sm:text-xs sm:px-4 sm:py-2.5"
              }
            >
              BESTÄLL ONLINE <ArrowRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
            </a>
            <button
              type="button"
              aria-label={navOpen ? "Stäng menyn" : "Öppna menyn"}
              aria-expanded={navOpen}
              onClick={() => setNavOpen((o) => !o)}
              className="md:hidden shrink-0 rounded-sm p-1.5 text-[#0a1f44] transition hover:bg-gray-100"
            >
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {navOpen && (
          <nav className="md:hidden border-t border-border px-4 py-2">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                {...(l.href.startsWith("#")
                  ? {}
                  : { target: "_blank", rel: "noopener noreferrer" })}
                onClick={() => setNavOpen(false)}
                className="block py-2 text-[11px] font-bold tracking-wider text-[#0a1f44]"
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-12">
        <div className="grid grid-cols-2 items-center gap-3 sm:gap-8">
          <div>
            <h1
              className="leading-none"
              style={{ fontFamily: '"Blackhawk", "Arial Black", Impact, sans-serif' }}
            >
              <span className="block text-4xl sm:text-7xl md:text-8xl text-black">SHUSHI</span>
              <span className="block text-4xl sm:text-7xl md:text-8xl" style={{ color: RED }}>
                BURRITO
              </span>
            </h1>
            <p className="mt-2 sm:mt-6 text-[10px] sm:text-lg font-semibold tracking-wide text-[#0a1f44]">
              JAPANESE PRECISION.
              <br />
              MEXICAN VIBES.
            </p>
            <div className="mt-3 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
              <a
                href={ORDER_HEADER}
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: RED }}
                className={btnRed + " text-[10px] sm:text-sm px-3 py-2 sm:px-5 sm:py-3"}
              >
                BESTÄLL ONLINE <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </a>
              <a
                href={MENU_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={btnOutline + " text-[10px] sm:text-sm px-3 py-2 sm:px-5 sm:py-3"}
              >
                VÅR MENY
              </a>
            </div>
          </div>
          <div>
            <img src={hero} alt="Sushi burrito" className="w-full" />
          </div>
        </div>
        <div className="mt-4 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4 border-t border-border pt-4 sm:pt-6">
          {[
            { t: "FÄRSKA RÅVAROR", s: "Varje dag", Icon: Fish },
            { t: "HANDRULLADE", s: "Med passion", Icon: Hand },
            { t: "DJÄRVA SMAKER", s: "Som sticker ut", Icon: Flame },
          ].map((f) => (
            <div key={f.t} className="text-center">
              <f.Icon className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-[#0a1f44]" strokeWidth={1.5} />
              <p className="mt-1 text-[9px] sm:text-xs font-bold tracking-wider text-[#0a1f44]">
                {f.t}
              </p>
              <p className="text-[8px] sm:text-xs text-muted-foreground">{f.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Meny */}
      <section id="meny" className="mx-auto max-w-7xl scroll-mt-4 px-4 py-6 sm:px-6 sm:py-16">
        <h2 className="text-center text-xl sm:text-4xl font-black tracking-wide text-[#0a1f44]">
          UPPTÄCK VÅR MENY
        </h2>
        <p className="mt-1 text-center text-[10px] sm:text-sm text-muted-foreground">
          Sushi möter burrito. Tre kategorier, oändliga möjligheter.
        </p>
        <div className="mt-4 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-6">
          {[
            { img: sushi, title: "SUSHI", d1: "Klassiska smaker.", d2: "Japansk tradition." },
            {
              img: varma,
              title: "VARMA THAIRÄTTER",
              d1: "Kryddstarka favoriter.",
              d2: "Lagade på beställning.",
            },
            {
              img: friterade,
              title: "FRITERADE THAIRÄTTER",
              d1: "Krispigt, smakrikt",
              d2: "och alltid mättande.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
            >
              <div className="h-20 sm:h-56 overflow-hidden">
                <img src={c.img} alt={c.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-2 sm:p-6">
                <h3 className="text-[10px] sm:text-lg font-bold tracking-wide text-[#0a1f44]">
                  {c.title}
                </h3>
                <p className="mt-1 text-[8px] sm:text-sm text-muted-foreground">
                  {c.d1}
                  <br />
                  {c.d2}
                </p>
                <a
                  href={MENU_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[9px] sm:text-sm font-bold tracking-wider hover:underline"
                  style={{ color: RED }}
                >
                  SE MENYN <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Besök oss */}
      <section id="besok-oss" className="mx-auto max-w-7xl scroll-mt-4 px-4 py-6 sm:px-6 sm:py-16">
        <h2 className="text-center text-xl sm:text-4xl font-black tracking-wide text-[#0a1f44]">
          BESÖK OSS
        </h2>
        <p className="mt-1 text-center text-[10px] sm:text-sm text-muted-foreground">
          Tre platser. Samma passion. Välj din favorit och beställ eller besök oss idag.
        </p>
        <div className="mt-4 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-6">
          {locations.map((loc, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
            >
              <iframe
                title={`${loc.name} karta`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(loc.mapQ)}&output=embed`}
                className="h-20 sm:h-48 w-full border-0"
                loading="lazy"
              />
              <div className="p-2 sm:p-6">
                <h3 className="text-[10px] sm:text-lg font-bold tracking-wide text-[#0a1f44]">
                  {i + 1}. {loc.name.toUpperCase()}
                </h3>
                <p className="mt-1 text-[8px] sm:text-sm text-muted-foreground">
                  {loc.address1}
                  <br />
                  {loc.address2}
                </p>
                <div className="mt-2 flex flex-col gap-1 sm:gap-2">
                  <a
                    href={loc.order}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 rounded-sm px-1 py-1.5 sm:px-4 sm:py-2.5 text-[8px] sm:text-sm font-bold tracking-wider text-white transition hover:opacity-90"
                    style={{ backgroundColor: RED }}
                  >
                    BESTÄLL ONLINE <ArrowRight className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                  </a>
                  <a
                    href={loc.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 rounded-sm border-2 border-[#0a1f44] bg-white px-1 py-1.5 sm:px-4 sm:py-2.5 text-[8px] sm:text-sm font-bold tracking-wider text-[#0a1f44] transition hover:bg-gray-50"
                  >
                    VÅR HEMSIDA
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
