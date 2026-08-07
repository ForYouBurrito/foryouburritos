import { ArrowRight, Clock, Info } from "lucide-react";

import { InfoBlock, InfoGrid } from "@/components/InfoBlock";
import { MenuList1, MenuList2 } from "@/components/MenuList";
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
 * Each sheet ships in two forms: `Sheet`, the spread itself, and `List`, the same
 * rows reflowed into a single column — see MenuList.tsx for why the spread cannot
 * simply be scaled down.
 *
 * They swap at the width where that sheet's smallest type is still legible, which
 * differs per sheet: 02 is a denser spread on a wider canvas (1440 design px against
 * 01's 1024), so the same physical type height costs it more layout width. Allowing
 * for the container's `max-w-7xl` and padding, 01 clears its ~860px at `lg` and 02
 * its ~1100px only at `xl`. A single shared breakpoint is what left sheet 02
 * unreadable on tablets.
 *
 * The classes are written out in full rather than composed from a breakpoint name —
 * Tailwind scans source text, so `` `hidden ${bp}:block` `` would never be generated.
 */
const SHEETS = [
  {
    id: "burritos",
    n: "01",
    titleKey: "meny.sheet1_title",
    subKey: "meny.sheet1_sub",
    Sheet: MenuSheet1,
    List: MenuList1,
    listClass: "lg:hidden",
    sheetClass: "hidden lg:block",
  },
  {
    id: "sushi",
    n: "02",
    titleKey: "meny.sheet2_title",
    subKey: "meny.sheet2_sub",
    Sheet: MenuSheet2,
    List: MenuList2,
    listClass: "xl:hidden",
    sheetClass: "hidden xl:block",
  },
];

// The masthead photo, matching the tinted-navy device on /catering and /om-oss.
// NOTE: still the client's original — it wants the same resize/re-encode pass the
// omoss-*.jpg derivatives got.
const heroBg = { src: "/assets/IMG_8906-scaled.jpg", width: 2560, height: 1437 };
// The masthead's product shot. Cropped from `plate-removebg-preview.png`, whose
// 338x737 canvas was 86% empty alpha — the bowl's ink is a 277x277 square, and
// an <img> of the uncropped file would have reserved all that dead height.
// 277px is the whole asset, so never render it wider (see max-w on the <img>).
const pokeBowl = { src: "/assets/poke-bowl.png", width: 277, height: 277 };

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

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pt-12 pb-14 sm:px-6 sm:pt-20 sm:pb-20 lg:grid-cols-12">
          {/* min-w-0: grid tracks are minmax(auto, 1fr), so a Blackhawk headline
              that outgrew its cell would widen the track and push the whole
              document past the viewport — the bug that panned "/" sideways. */}
          <div className="min-w-0 lg:col-span-7">
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
              <T
                k="meny.title_line1"
                className="block text-6xl text-white sm:text-8xl lg:text-9xl"
              />
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

          {/* One dish, floating on the tinted photo — the masthead's right half
              was empty at desktop widths, and on the menu page the argument for
              filling it is the food itself.

              Desktop only, and hidden rather than scaled: a `loading="lazy"`
              <img> inside `display:none` is never fetched, so phones skip the
              192 KB entirely and the fold still lands on the first sheet.
              max-w caps it at its native 277px — the cut-out has no more pixels
              than that, and stretching it would only show them. The shadow is
              what separates a dark bowl rim from the navy behind it. */}
          <div className="hidden lg:col-span-5 lg:block">
            <img
              src={pokeBowl.src}
              alt="Poke bowl med tonfisk, avokado, mango, gurka och rödlök"
              width={pokeBowl.width}
              height={pokeBowl.height}
              loading="lazy"
              decoding="async"
              className="mx-auto block h-auto w-full max-w-[277px] drop-shadow-[0_28px_50px_rgba(0,0,0,0.5)]"
            />
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

          {/* The sheet is one rigid unit — shrunk to phone width its smallest type
              is ~4px. It used to pan sideways instead, which put half of every
              spread off-screen. Narrow, the artwork is dropped and the same rows
              stack in one column; wide, the sheet renders unchanged.

              Both are in the DOM, but the hidden one costs nothing that matters:
              its artwork is a `loading="lazy"` <img> inside `display:none`, which
              browsers do not fetch — so phones skip ~950 KB per sheet. */}
          <div className={`mt-8 ${s.listClass}`}>
            <s.List />
          </div>
          <div className={`mt-10 ${s.sheetClass}`}>
            <s.Sheet />
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
        <InfoGrid className="sm:grid-cols-2">
          {[
            { Icon: Clock, titleKey: "meny.note1_title", copyKey: "meny.note1_body" },
            { Icon: Info, titleKey: "meny.note2_title", copyKey: "meny.note2_body" },
          ].map((note) => (
            <InfoBlock key={note.titleKey} Icon={note.Icon}>
              <T
                as="h3"
                k={note.titleKey}
                className="text-sm font-bold tracking-[0.14em] text-[#0a1f44] sm:text-base"
              />
              <T
                as="p"
                k={note.copyKey}
                className={`mt-3 text-sm leading-relaxed sm:text-base ${BODY}`}
              />
            </InfoBlock>
          ))}
        </InfoGrid>
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
