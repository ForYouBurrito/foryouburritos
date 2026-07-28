import { ArrowRight, Clock, Info } from "lucide-react";

import MenuSheet1 from "@/components/MenuSheet1";
import MenuSheet2 from "@/components/MenuSheet2";
import MobileActionBar from "@/components/MobileActionBar";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { useContent } from "@/lib/cms";
import { T } from "@/lib/editing";
import { NAVY, ORDER_HEADER, RED } from "@/lib/site";

/**
 * Neither sheet is a flat picture any more: both lay real text over the blanked
 * artwork, so every item and price is selectable, searchable and indexable.
 *
 * The printed scans (`Menu1.png`, `Menu2.png`) are deliberately not offered as a
 * "fullscreen" link. Their copy no longer matches what is rendered — the print
 * carries typos, and three of its sheet-02 prices were transcription errors that
 * are corrected here.
 *
 * `minW` is the width below which that sheet's smallest type stops being legible,
 * so it is the width the mobile pan-container holds it at. Sheet 02 needs more
 * than 01: it is a denser spread on a wider canvas, so the same pixel height of
 * type costs more layout width.
 */
const SHEETS = [
  {
    id: "burritos",
    n: "01",
    titleKey: "meny.sheet1_title",
    subKey: "meny.sheet1_sub",
    Sheet: MenuSheet1,
    minW: "min-w-[860px]",
  },
  {
    id: "sushi",
    n: "02",
    titleKey: "meny.sheet2_title",
    subKey: "meny.sheet2_sub",
    Sheet: MenuSheet2,
    minW: "min-w-[1100px]",
  },
];

// The masthead photo, matching the tinted-navy device on /catering and /om-oss.
// NOTE: still the client's original — it wants the same resize/re-encode pass the
// omoss-*.jpg derivatives got.
const heroBg = { src: "/assets/IMG_8906-scaled.jpg", width: 2560, height: 1437 };

const DISPLAY = { fontFamily: '"Blackhawk", "Arial Black", Impact, sans-serif' } as const;
const BODY = "text-[#0a1f44]/70";
/** Brand red is ~1.9:1 on navy. This tint reads 5.3:1 and carries the same colour. */
const RED_ON_NAVY = "#ff5a78";

/** Red primary action. Every one of these goes to the same Qopla order link as "/" does. */
function OrderButton({
  className = "",
  labelKey = "meny.cta_button_label",
}: {
  className?: string;
  labelKey?: string;
}) {
  return (
    <a
      href={ORDER_HEADER}
      target="_blank"
      rel="noopener noreferrer"
      style={{ backgroundColor: RED }}
      className={
        "inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3.5 text-xs font-bold tracking-[0.15em] text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#ac1136] focus-visible:ring-offset-2 focus-visible:outline-none sm:px-8 sm:py-4 sm:text-sm " +
        className
      }
    >
      <T k={labelKey} /> <ArrowRight className="h-4 w-4" />
    </a>
  );
}

export default function Meny() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* ── Masthead ─────────────────────────────────────────────────────────
          Photo under a 75% navy tint, the same device /catering and /om-oss use.
          Kept shorter than theirs on purpose: on this page the menu is the point,
          so the fold should land on the first sheet, not on the headline. */}
      <section className="relative isolate overflow-hidden" style={{ backgroundColor: NAVY }}>
        <img
          src={heroBg.src}
          alt=""
          width={heroBg.width}
          height={heroBg.height}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundColor: NAVY, opacity: 0.75 }} />

        <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-14 sm:px-6 sm:pt-20 sm:pb-20">
          <T
            as="p"
            k="meny.eyebrow"
            className="text-[11px] font-bold tracking-[0.35em] text-white/80 sm:text-xs"
          />
          <div
            className="mt-6 h-1.5 w-16 sm:w-24"
            style={{ backgroundColor: RED }}
            aria-hidden="true"
          />

          {/* Two-tone as before, but "MENY" takes the brightened red — the brand
              red on this navy is 1.9:1 and would sink into the background. */}
          <h1 className="mt-6 leading-[0.85]" style={DISPLAY}>
            <T k="meny.title_line1" className="block text-6xl text-white sm:text-8xl lg:text-9xl" />
            <span className="block" style={{ color: RED_ON_NAVY }}>
              <T k="meny.title_line2" className="block text-6xl sm:text-8xl lg:text-9xl" />
            </span>
          </h1>

          <T
            as="p"
            k="meny.intro"
            className="mt-8 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base"
          />

          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
            <OrderButton labelKey="meny.cta_order_label" />
            <a
              href="#burritos"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-white/25 px-6 text-xs font-bold tracking-[0.15em] text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1f44] focus-visible:outline-none sm:min-h-14 sm:text-sm"
            >
              <T k="meny.cta_scroll_label" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Menu sheets ──────────────────────────────────────────────────────
          The sheets themselves are untouched. What changed is what frames them:
          a Blackhawk heading above, and an order prompt directly below — reading
          a menu is exactly the moment someone is ready to order, so the action is
          there rather than only at the foot of the page. */}
      {SHEETS.map((s) => (
        <section
          key={s.id}
          id={s.id}
          className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-12 pb-14 sm:px-6 sm:pt-20 sm:pb-24"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <T
                as="h2"
                k={s.titleKey}
                className="text-3xl leading-none text-[#0a1f44] sm:text-5xl lg:text-6xl"
                style={DISPLAY}
              />
              <T as="p" k={s.subKey} className={`mt-3 max-w-2xl text-sm sm:text-base ${BODY}`} />
            </div>
          </div>

          {/* Real text, so shrinking it to phone width would make it unreadable —
              pan it sideways below md instead, at a width the type survives. */}
          <div className="mt-6 -mx-4 overflow-x-auto px-4 sm:mt-10 md:mx-0 md:overflow-visible md:px-0">
            <div className={`${s.minW} md:min-w-0`}>
              <s.Sheet />
            </div>
          </div>

          {/* Order prompt, one per sheet. Light rather than navy: the closing band
              is the page's navy moment, and three of them would flatten it. */}
          <div className="mt-8 flex flex-col gap-5 rounded-xl border border-[#0a1f44]/10 bg-[#f6f6f4] p-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <T
                as="p"
                k="meny.sheet_cta_title"
                className="text-base font-bold text-[#0a1f44] sm:text-lg"
              />
              <T as="p" k="meny.sheet_cta_body" className={`mt-1.5 text-sm sm:text-base ${BODY}`} />
            </div>
            <OrderButton className="w-full shrink-0 sm:w-auto" labelKey="meny.cta_order_label" />
          </div>
        </section>
      ))}

      {/* ── Practical notes ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-24">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {[
            { Icon: Clock, titleKey: "meny.note1_title", copyKey: "meny.note1_body" },
            { Icon: Info, titleKey: "meny.note2_title", copyKey: "meny.note2_body" },
          ].map((note) => (
            <div
              key={note.titleKey}
              className="rounded-lg border border-[#0a1f44]/10 bg-white p-6 shadow-[0_8px_30px_rgba(10,31,68,0.06)] sm:p-7"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-sm"
                style={{ backgroundColor: NAVY }}
                aria-hidden="true"
              >
                <note.Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
              </div>
              <T
                as="h3"
                k={note.titleKey}
                className="mt-5 text-xs font-bold tracking-[0.14em] text-[#0a1f44] sm:text-sm"
              />
              <T as="p" k={note.copyKey} className={`mt-2.5 text-sm leading-relaxed ${BODY}`} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: NAVY }}>
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-24">
          <T
            as="h2"
            k="meny.cta_heading"
            className="text-4xl leading-none text-white sm:text-6xl lg:text-7xl"
            style={DISPLAY}
          />
          <T
            as="p"
            k="meny.cta_body"
            className="mx-auto mt-5 max-w-md text-sm text-white/80 sm:text-base"
          />
          <div className="mt-8 flex justify-center sm:mt-10">
            <OrderButton labelKey="meny.cta_order_label" />
          </div>
        </div>
      </section>

      <SiteFooter />

      <MobileActionBar />
    </div>
  );
}
