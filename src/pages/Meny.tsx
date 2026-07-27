import { ArrowRight, Clock, Info, Maximize2 } from "lucide-react";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { NAVY, ORDER_HEADER, RED } from "@/lib/site";

// The whole menu is these two spreads. Replacing a menu = overwriting the file.
// (Menu1 is a JPEG carrying a .png name — browsers sniff it, so it renders fine.)
const SHEETS = [
  {
    id: "burritos",
    n: "01",
    title: "SUSHI BURRITOS",
    sub: "Poke bowls, burrito sticks, lunchlådor & tillägg",
    src: "/assets/Menu1.png",
    alt: "Meny: sushi burritos, poke bowls, burrito sticks, lunchlådor och tillägg",
    width: 1024,
    height: 724,
  },
  {
    id: "sushi",
    n: "02",
    title: "SUSHI & ROLLS",
    sub: "Sushimenyer, nigiri, maki, inside-out rolls & tillbehör",
    src: "/assets/Menu2.png",
    alt: "Meny: sushimenyer, nigiri, maki, for you rolls, inside-out rolls och tillbehör",
    width: 1217,
    height: 864,
  },
];

/** Red primary action. Every one of these goes to the same Qopla order link as "/" does. */
function OrderButton({
  className = "",
  label = "BESTÄLL",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={ORDER_HEADER}
      target="_blank"
      rel="noopener noreferrer"
      style={{ backgroundColor: RED }}
      className={
        "inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3.5 text-xs font-bold tracking-[0.15em] text-white transition hover:opacity-90 sm:px-8 sm:py-4 sm:text-sm " +
        className
      }
    >
      {label} <ArrowRight className="h-4 w-4" />
    </a>
  );
}

export default function Meny() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Intro — deliberately airy, this is the page's only large type */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 sm:pt-24 sm:pb-16">
        <p className="text-[10px] font-bold tracking-[0.35em] text-muted-foreground sm:text-xs">
          FOR YOU BURRITOS
        </p>
        <h1
          className="mt-4 leading-[0.9] sm:mt-6"
          style={{ fontFamily: '"Blackhawk", "Arial Black", Impact, sans-serif' }}
        >
          <span className="block text-5xl text-black sm:text-8xl md:text-9xl">VÅR</span>
          <span className="block text-5xl sm:text-8xl md:text-9xl" style={{ color: RED }}>
            MENY
          </span>
        </h1>

        <div className="mt-8 max-w-xl sm:mt-12">
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Japansk precision, mexikanska vibbar. Hela sortimentet — sushi burritos, poke bowls,
            nigiri, maki och rolls — finns i menyerna nedan.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
            <OrderButton label="BESTÄLL ONLINE" />
            <a
              href="#burritos"
              className="text-xs font-bold tracking-[0.15em] text-[#0a1f44] underline-offset-4 transition hover:underline sm:text-sm"
            >
              SE MENYN
            </a>
          </div>
        </div>
      </section>

      {/* Menu sheets */}
      {SHEETS.map((s) => (
        <section
          key={s.id}
          id={s.id}
          className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-14 sm:px-6 sm:pb-24"
        >
          <div className="border-t border-border pt-8 sm:pt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-start gap-4 sm:gap-6">
                <span
                  className="text-xs font-bold tracking-[0.2em] sm:text-sm"
                  style={{ color: RED }}
                >
                  {s.n}
                </span>
                <div>
                  <h2 className="text-xl font-black tracking-wide text-[#0a1f44] sm:text-3xl">
                    {s.title}
                  </h2>
                  <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">{s.sub}</p>
                </div>
              </div>
              <a
                href={s.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-[#0a1f44] transition hover:opacity-70 sm:text-xs"
              >
                <Maximize2 className="h-3.5 w-3.5" /> ÖPPNA I FULLSKÄRM
              </a>
            </div>

            {/* No frame, no crop: the whole spread scales down to the page width at every size. */}
            <img
              src={s.src}
              alt={s.alt}
              width={s.width}
              height={s.height}
              loading="lazy"
              decoding="async"
              className="mt-6 block h-auto w-full sm:mt-10"
            />
          </div>
        </section>
      ))}

      {/* Practical notes */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-24">
        <div className="grid gap-6 border-t border-border pt-8 sm:grid-cols-2 sm:gap-10 sm:pt-12">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#0a1f44]" strokeWidth={1.5} />
            <div>
              <h3 className="text-xs font-bold tracking-[0.15em] text-[#0a1f44] sm:text-sm">
                LUNCH BOX 119:–
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
                Måndag–fredag 11–14. Tre lunchlådor med 14 sushibitar var.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0a1f44]" strokeWidth={1.5} />
            <div>
              <h3 className="text-xs font-bold tracking-[0.15em] text-[#0a1f44] sm:text-sm">
                ALLERGIER
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
                Fråga personalen — vi hjälper dig hitta rätt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section style={{ backgroundColor: NAVY }}>
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-24">
          <h2 className="text-2xl font-black tracking-wide text-white sm:text-4xl">HUNGRIG?</h2>
          <p className="mx-auto mt-3 max-w-md text-xs text-white/70 sm:text-sm">
            Beställ online och hämta i Malmö eller Lund.
          </p>
          <div className="mt-8 flex justify-center sm:mt-10">
            <OrderButton />
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* Sticky order bar — small screens only, where the header CTA scrolls away slower than the page */}
      <div className="sticky bottom-0 z-20 border-t border-border bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <OrderButton className="w-full" label="BESTÄLL ONLINE" />
      </div>
    </div>
  );
}
