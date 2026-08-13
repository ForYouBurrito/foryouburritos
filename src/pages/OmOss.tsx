import { ArrowRight } from "lucide-react";

import EditableImage from "@/components/EditableImage";
import MobileActionBar from "@/components/MobileActionBar";
import Reviews from "@/components/Reviews";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { useAboutImage, useAboutPoints, useContent } from "@/lib/cms";
import { T } from "@/lib/editing";
import { NAVY, RED } from "@/lib/site";

/**
 * "/om-oss" — built to the same language as "/catering": a navy band over a
 * tinted food photo, large Blackhawk headlines, and alternating white / #f6f6f4
 * / navy surfaces instead of hairline rules.
 *
 * Where /catering is a conversion page (offer, process, form), this is a story
 * page, so the composition differs even though the vocabulary is shared:
 * a lead paragraph rather than a CTA row, the Thai Sushi For You parentage as a
 * pull-quote, the three principles as big-numeral cards, and the vision as a
 * centred statement.
 *
 * The page holds no copy of its own. Every string comes from `site_content`
 * under the `omoss.` prefix, or from `about_points`, and is wrapped in <T> so it
 * is editable in place at /admin/edit?page=om-oss.
 */

// Not "/" and not /catering: hero2.png and varma.png are already spoken for.
// Derived from the client's IMG_8965 at 1800px/q74 — it sits under a 75% navy
// tint, so it can take heavier compression than an image shown as itself.
const heroBg = { src: "/assets/omoss-hero.jpg", width: 1800, height: 1010 };

/** Blackhawk carries the brand voice. <T> takes no style prop, so it is set on a
 *  wrapper and inherited — which also keeps the uppercase purely in CSS. */
const DISPLAY = { fontFamily: '"Blackhawk", "Arial Black", Impact, sans-serif' } as const;

/** Body copy. Navy at 70% reads ~6.4:1 on white; the grey token only managed 4.7:1. */
const BODY = "text-[#0a1f44]/70";

/** The red rule that opens the hero and recurs under the vision heading. */
function RedRule({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-1.5 w-16 sm:w-24 ${className}`}
      style={{ backgroundColor: RED }}
      aria-hidden="true"
    />
  );
}

/** Optional per-section media. Renders nothing until a URL is set in the CMS. */
function SectionImage({ k, alt }: { k: string; alt: string }) {
  const src = useAboutImage(k);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="block h-auto w-full rounded-lg object-cover"
    />
  );
}

export default function OmOss() {
  const t = useContent();
  const points = useAboutPoints();

  const introImage = useAboutImage("omoss.intro_image");
  const philosophyImage = useAboutImage("omoss.philosophy_image");
  const visionImage = useAboutImage("omoss.vision_image");

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────────────────
          Same device as /catering — photo under a 75% navy tint — which is what
          ties the two pages together. Shorter here, and with no CTA row: this
          page is not selling, it is introducing. */}
      <section className="relative isolate overflow-hidden" style={{ backgroundColor: NAVY }}>
        <EditableImage
          variant="corner"
          imageKey="omoss.hero_image"
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
          <T
            as="p"
            k="omoss.eyebrow"
            className="text-[11px] font-bold tracking-[0.35em] text-white/80 sm:text-xs"
          />
          <RedRule className="mt-6" />
          {/* uppercase via CSS, not .toUpperCase() — editing writes back the stored
              casing ("Om oss"), not the shouted display form. */}
          <h1 className="mt-6" style={DISPLAY}>
            <T
              k="omoss.title"
              className="block text-6xl leading-[0.85] text-white uppercase sm:text-8xl lg:text-[8.5rem]"
            />
          </h1>
        </div>
      </section>

      {/* ── Intro ────────────────────────────────────────────────────────────
          intro_1 as a proper lead — large and navy, not small and grey. intro_2
          is the business's standing (part of Thai Sushi For You in Västra
          Hamnen), so it gets a red-ruled pull-quote rather than being a second
          paragraph nobody reaches. */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24">
        {/* items-center: the storefront photo is taller than the copy beside it,
            and top-aligning leaves a hole under the pull-quote. */}
        <div className={introImage ? "grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16" : ""}>
          <div className={introImage ? "lg:col-span-7" : "max-w-3xl"}>
            <T
              as="p"
              k="omoss.intro_1"
              className="text-lg leading-relaxed text-[#0a1f44] sm:text-2xl sm:leading-relaxed"
            />
            <div className="mt-8 border-l-4 pl-5 sm:mt-10 sm:pl-7" style={{ borderColor: RED }}>
              <T
                as="p"
                k="omoss.intro_2"
                className={`text-base leading-relaxed sm:text-lg ${BODY}`}
              />
            </div>
          </div>
          {introImage && (
            <div className="lg:col-span-5">
              <SectionImage k="omoss.intro_image" alt="For You Burritos" />
            </div>
          )}
        </div>
      </section>

      {/* ── Vår filosofi ─────────────────────────────────────────────────────
          philosophy_intro ends in a colon, so the points have to read as its
          continuation. Big Blackhawk numerals make them the section's visual
          anchor instead of three anonymous bullet rows. */}
      <section className="bg-[#f6f6f4]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24">
          <div
            className={
              philosophyImage ? "grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16" : ""
            }
          >
            <div className={philosophyImage ? "lg:col-span-7" : ""}>
              <div style={DISPLAY}>
                <T
                  as="h2"
                  k="omoss.philosophy_title"
                  className="text-3xl leading-none text-[#0a1f44] uppercase sm:text-5xl lg:text-6xl"
                />
              </div>
              <T
                as="p"
                k="omoss.philosophy_intro"
                className={`mt-5 max-w-2xl text-base leading-relaxed sm:text-lg ${BODY}`}
              />
            </div>
            {philosophyImage && (
              <div className="lg:col-span-5">
                <SectionImage k="omoss.philosophy_image" alt={t("omoss.philosophy_title")} />
              </div>
            )}
          </div>

          {/* grid-cols degrade sensibly if the owner adds or removes a point. */}
          <ul className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {points.map((p, i) => (
              <li
                key={p.id ?? i}
                className="rounded-lg border border-[#0a1f44]/10 bg-white p-6 shadow-[0_8px_30px_rgba(10,31,68,0.06)] sm:p-7"
              >
                <span
                  className="block text-4xl leading-none sm:text-5xl"
                  style={{ ...DISPLAY, color: RED }}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <T
                  row={p}
                  table="about_points"
                  field="body"
                  className="mt-4 block text-base font-semibold text-[#0a1f44] sm:text-lg"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Vår vision ───────────────────────────────────────────────────────
          One paragraph, so it is treated as a statement: centred, large, with
          the hero's red rule returning under the heading. */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div style={DISPLAY}>
            <T
              as="h2"
              k="omoss.vision_title"
              className="text-3xl leading-none text-[#0a1f44] uppercase sm:text-5xl lg:text-6xl"
            />
          </div>
          <RedRule className="mx-auto mt-6" />
          <T
            as="p"
            k="omoss.vision_body"
            className="mt-8 text-lg leading-relaxed text-[#0a1f44]/80 sm:mt-10 sm:text-2xl sm:leading-relaxed"
          />
        </div>
        {/* Constrained: full max-w-7xl width would make the platter dwarf the
            statement it is meant to punctuate. */}
        {visionImage && (
          <div className="mx-auto mt-10 max-w-3xl sm:mt-14">
            <SectionImage k="omoss.vision_image" alt={t("omoss.vision_title")} />
          </div>
        )}
      </section>

      {/* The story is ours; this is other people confirming it. */}
      <Reviews className="bg-[#f6f6f4]" />

      {/* ── Closing CTA — the navy band every page ends on ───────────────── */}
      <section style={{ backgroundColor: NAVY }}>
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-24">
          <div style={DISPLAY}>
            <T
              as="h2"
              k="omoss.cta_heading"
              className="text-4xl leading-none text-white uppercase sm:text-6xl lg:text-7xl"
            />
          </div>
          <T
            as="p"
            k="omoss.cta_body"
            className="mx-auto mt-5 max-w-md text-sm text-white/80 sm:text-base"
          />
          <div className="mt-8 flex justify-center sm:mt-10">
            <a
              href={t("header.cta_url")}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: RED }}
              className="inline-flex items-center justify-center gap-2 rounded-sm px-8 py-4 text-xs font-bold tracking-[0.15em] text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1f44] focus-visible:outline-none sm:text-sm"
            >
              <T k="omoss.cta_label" /> <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />

      <MobileActionBar />
    </div>
  );
}
