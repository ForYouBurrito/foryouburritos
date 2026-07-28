import { Link } from "react-router-dom";
import { ArrowRight, Fish, Flame, Hand, Phone, UtensilsCrossed } from "lucide-react";

import MobileActionBar from "@/components/MobileActionBar";
import Reviews from "@/components/Reviews";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  useContact,
  useContent,
  useFeatureTiles,
  useLocations,
  useMenuCategories,
} from "@/lib/cms";
import { T } from "@/lib/editing";
import { NAVY, RED } from "@/lib/site";

// Served straight from public/assets/ — drop the real files in there and they
// appear at these URLs. See public/assets/README.md for the exact filenames.
// 1098x908 — exactly 2x the old hero2.png, so it renders at the same size but
// stays sharp on retina. Display size comes from the classes on the <img>
// (w-full / max-w-xs), never from the intrinsic pixels.
const hero = "/assets/hero2bg_upscayl_2x_remacri-4x.png";
// The shopfront, from the same derivative /om-oss uses for its intro slot — the
// `omoss-` prefix is just where it was first generated, not where it belongs.
// 229 KB against the 9.3 MB original it was cut from.
const storefront = { src: "/assets/omoss-butik.jpg", width: 1200, height: 1059 };

/**
 * feature_tiles.icon holds a lucide-react name, since the CMS stores text, not
 * components. Only the icons actually offered in the admin UI are listed —
 * anything unrecognised falls back rather than crashing the render.
 */
const ICONS = { Fish, Hand, Flame, UtensilsCrossed } as const;

/** Blackhawk carries the brand voice. <T> takes no style prop, so it is set on a
 *  wrapper and inherited. */
const DISPLAY = { fontFamily: '"Blackhawk", "Arial Black", Impact, sans-serif' } as const;

/** Body copy at ~6.4:1 on white; the grey token only managed 4.7:1. */
const BODY = "text-[#0a1f44]/70";

export default function Index() {
  const t = useContent();
  const contact = useContact();
  const features = useFeatureTiles();
  const menuCategories = useMenuCategories();
  const locations = useLocations();

  // The map band shows a single restaurant — Caroli on Östergatan. Matched on the
  // address rather than the name, since two rows are called "Caroli". Falls back
  // to the first row if that one is ever removed.
  const mainLocation =
    locations.find((l) => l.address1.toLowerCase().includes("östergatan")) ?? locations[0];

  const btnRed =
    "inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3.5 text-xs font-bold tracking-[0.15em] text-white transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#ac1136] focus-visible:ring-offset-2 focus-visible:outline-none sm:text-sm";
  // Circular, label-less outline button. Fixed h/w rather than padding, so
  // it stays a true circle instead of a rounded oval.
  const btnIconOutline =
    "inline-flex h-12 w-12 shrink-0 items-center justify-center self-start rounded-full border-2 border-[#0a1f44] bg-white text-[#0a1f44] transition hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#0a1f44] focus-visible:ring-offset-2 focus-visible:outline-none";
  // The "Besök oss" pair sits on a photo, so it is scaled up and re-coloured for
  // a dark ground rather than reusing the buttons above. The ring offset is navy,
  // not the default white, so focus rings read against the tinted image.
  const btnOnPhoto =
    "inline-flex w-full items-center justify-center gap-2.5 rounded-sm px-8 py-5 text-sm font-bold tracking-[0.15em] transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1f44] focus-visible:outline-none sm:w-auto sm:text-base";
  const btnPhotoRed = btnOnPhoto + " text-white hover:opacity-90 focus-visible:ring-white";
  const btnPhotoOutline =
    btnOnPhoto +
    " border-2 border-white text-white hover:bg-white hover:text-[#0a1f44] focus-visible:ring-white";

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────────────────
          Unchanged in idea — headline, product shot, two CTAs — but the whole
          site exists to get an order or a call, so those are now the two buttons
          and "vår meny" steps back to a text link. */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:px-6 sm:pt-16 sm:pb-20">
        <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2 sm:gap-10">
          {/* The headline needs the full column width: a display face at this size
              overflows a half-width grid cell and drags the page wider than the
              viewport. */}
          <div className="min-w-0">
            <h1 className="leading-[0.85]" style={DISPLAY}>
              <T
                k="hero.title_line1"
                className="block text-[4.125rem] text-black sm:text-[4.95rem] md:text-[6.6rem]"
              />
              <span className="block" style={{ color: RED }}>
                <T
                  k="hero.title_line2"
                  className="block text-[4.125rem] sm:text-[4.95rem] md:text-[6.6rem]"
                />
              </span>
            </h1>

            {/* whitespace-pre-line: the CMS stores the line break as \n, not markup. */}
            <T
              as="p"
              k="hero.tagline"
              className="mt-5 whitespace-pre-line text-[1.1rem] font-semibold tracking-wide text-[#0a1f44] sm:mt-7 sm:text-[1.375rem]"
            />

            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href={t("header.cta_url")}
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: RED }}
                className={btnRed}
              >
                <T k="hero.cta_order_label" /> <ArrowRight className="h-4 w-4" />
              </a>
              {/* The second half of the goal. Icon only — the number is carried by
                  the href, and printing it as a label made a wide button that
                  competed with the order CTA next to it. aria-label and title keep
                  it announced and hoverable, so nothing is lost by dropping it. */}
              <a
                href={`tel:${contact.phoneHref}`}
                aria-label={`Ring oss på ${contact.phone}`}
                title={contact.phone}
                className={btnIconOutline}
              >
                <Phone className="h-5 w-5" strokeWidth={2} />
              </a>
            </div>

            <Link
              to="/meny"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.15em] text-[#0a1f44] underline-offset-4 transition hover:underline sm:text-sm"
            >
              <T k="hero.cta_menu_label" /> <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="min-w-0">
            {/* +10%: scaled rather than widened, so the grid track keeps its
                measured width and the headline column can't be squeezed. */}
            <img
              src={hero}
              alt="Sushi burrito"
              width={1098}
              height={908}
              decoding="async"
              className="mx-auto w-full max-w-xs scale-110 sm:max-w-none"
            />
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────────────────
          The same three feature tiles, still 3-up at every width, but on navy and
          at a readable size instead of 10px grey on white. */}
      <section style={{ backgroundColor: NAVY }}>
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-3 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10">
          {features.map((f) => {
            const Icon = ICONS[f.icon as keyof typeof ICONS] ?? Fish;
            return (
              <div key={f.title} className="min-w-0 text-center">
                <Icon
                  className="mx-auto h-6 w-6 text-white sm:h-7 sm:w-7"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <T
                  as="p"
                  row={f}
                  table="feature_tiles"
                  field="title"
                  className="mt-3 text-[11px] font-bold tracking-[0.12em] text-white sm:text-sm"
                />
                <T
                  as="p"
                  row={f}
                  table="feature_tiles"
                  field="subtitle"
                  className="mt-1 text-[10px] text-white/70 sm:text-xs"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Meny ─────────────────────────────────────────────────────────────
          Three solid-navy cards. The photo's navy gradient bottoms out on the
          exact card colour, so tint and panel read as one block with the title
          floating between them — the same device the map band below uses, which
          is this page's own signature rather than anything borrowed from
          /catering or /om-oss. The CTA is `#ff5a78`, not brand RED: #ac1136 on
          navy is ~1.9:1 and unreadable. */}
      <section id="meny" className="mx-auto max-w-7xl scroll-mt-4 px-4 py-14 sm:px-6 sm:py-24">
        <div className="text-center" style={DISPLAY}>
          <T
            as="h2"
            k="menu.heading"
            className="text-4xl leading-none text-[#0a1f44] sm:text-6xl lg:text-7xl"
          />
        </div>
        <T
          as="p"
          k="menu.subheading"
          className={`mx-auto mt-4 max-w-xl text-center text-sm sm:text-base ${BODY}`}
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-3 sm:gap-6">
          {menuCategories.map((c) => (
            <div
              key={c.title}
              className="group min-w-0 overflow-hidden rounded-xl bg-[#0a1f44] shadow-[0_8px_30px_rgba(10,31,68,0.14)] transition hover:shadow-[0_14px_40px_rgba(10,31,68,0.28)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={c.image_url}
                  alt={c.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a1f44] via-[#0a1f44]/70 to-transparent px-4 pt-12 pb-4">
                  <T
                    as="p"
                    row={c}
                    table="menu_categories"
                    field="title"
                    className="pointer-events-auto text-lg font-bold tracking-wide text-white sm:text-xl"
                  />
                </div>
              </div>
              <div className="px-5 pt-1 pb-5 sm:px-6 sm:pb-6">
                <T
                  as="p"
                  row={c}
                  table="menu_categories"
                  field="description"
                  className="whitespace-pre-line text-sm leading-relaxed text-white/80 sm:text-base"
                />
                <Link
                  to="/meny"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.15em] text-[#ff5a78] hover:underline sm:text-sm"
                >
                  <T k="menu.card_cta_label" /> <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Omdömen ──────────────────────────────────────────────────────────
          Social proof sits between "here is the food" and "here is where we
          are" — the point in the page where someone is deciding. */}
      <Reviews className="bg-[#f6f6f4]" />

      {/* ── Besök oss ────────────────────────────────────────────────────────
          One restaurant, one map. There is only Caroli — the other `locations`
          rows are stale data, so nothing here iterates the table; the single row
          is picked below and the map band is the whole section.

          The order/call pair closes the page the way /meny and /om-oss close on a
          navy CTA band, without repeating that band's layout. */}
      {/* bg-navy on the section itself, not just the tint layer: white type has a
          ground to sit on for the moment before the photo decodes, and if the
          image ever 404s the band degrades to a solid navy panel, not white-on-white. */}
      <section id="besok-oss" className="relative isolate scroll-mt-4 overflow-hidden bg-[#0a1f44]">
        {/* The shopfront on Östergatan is the ground the whole band stands on:
            object-cover crops it to whatever the copy needs in height, and the
            navy wash carries it into the map + footer below. aria-hidden with an
            empty alt — the section heading already says what this is. */}
        <img
          src={storefront.src}
          alt=""
          aria-hidden="true"
          width={storefront.width}
          height={storefront.height}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
        />
        {/* Solid enough that white type clears AA over the photo's bright patches
            (the doorway glass), and it is the footer's exact navy so the band and
            the map gradient below read as one block. */}
        <div className="absolute inset-0 -z-10 bg-[#0a1f44]/80" aria-hidden="true" />

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32">
          <div className="text-center" style={DISPLAY}>
            <T
              as="h2"
              k="locations.heading"
              className="text-6xl leading-none text-white sm:text-8xl lg:text-9xl"
            />
          </div>
          <T
            as="p"
            k="locations.subheading"
            className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-white sm:mt-8 sm:text-2xl"
          />

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row sm:gap-5">
            <a
              href={t("header.cta_url")}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: RED }}
              className={btnPhotoRed}
            >
              <T k="locations.cta_order_label" /> <ArrowRight className="h-5 w-5" />
            </a>
            <a href={`tel:${contact.phoneHref}`} className={btnPhotoOutline}>
              <Phone className="h-5 w-5" strokeWidth={2} /> {contact.phone}
            </a>
          </div>
        </div>

        {/* No top margin on the map: a white gap here would cut the photo band
            away from it, and the two are one navy block now. */}
        {mainLocation && (
          <div className="relative">
            <iframe
              title={`${mainLocation.name} karta`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(mainLocation.map_query)}&output=embed`}
              className="block h-72 w-full border-0 sm:h-96"
              loading="lazy"
            />
            {/* The address is unreadable straight on top of map tiles, so it sits
                in a navy gradient rising off the bottom edge — the same #0a1f44 as
                the footer, so the band reads as one continuous block with it.
                pointer-events-none keeps the map pannable everywhere except the
                text block itself. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-2/3 flex-col justify-end bg-gradient-to-t from-[#0a1f44] via-[#0a1f44]/90 to-transparent px-4 pb-6 text-center sm:pb-10">
              <div className="pointer-events-auto mx-auto max-w-7xl">
                <h3 className="text-base font-bold tracking-wide text-white sm:text-lg">
                  <T row={mainLocation} table="locations" field="name" className="uppercase" />
                </h3>
                <p className="mt-1.5 text-sm text-white/80">
                  <T row={mainLocation} table="locations" field="address1" />{" "}
                  <T row={mainLocation} table="locations" field="address2" />
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* seamless: the map band above already fades to the footer's navy, so the
          footer's usual top hairline would cut the transition in half. */}
      <SiteFooter seamless />

      <MobileActionBar />
    </div>
  );
}
