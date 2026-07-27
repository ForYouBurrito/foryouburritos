import { Link } from "react-router-dom";
import { ArrowRight, Fish, Hand, Flame, UtensilsCrossed } from "lucide-react";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { useContent, useFeatureTiles, useLocations, useMenuCategories } from "@/lib/cms";
import { RED } from "@/lib/site";

// Served straight from public/assets/ — drop the real files in there and they
// appear at these URLs. See public/assets/README.md for the exact filenames.
const hero = "/assets/hero2.png";

/**
 * feature_tiles.icon holds a lucide-react name, since the CMS stores text, not
 * components. Only the icons actually offered in the admin UI are listed —
 * anything unrecognised falls back rather than crashing the render.
 */
const ICONS = { Fish, Hand, Flame, UtensilsCrossed } as const;

export default function Index() {
  const t = useContent();
  const features = useFeatureTiles();
  const menuCategories = useMenuCategories();
  const locations = useLocations();

  const btnRed =
    "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 text-sm font-bold tracking-wider text-white transition hover:opacity-90";
  const btnOutline =
    "inline-flex items-center justify-center gap-2 rounded-sm border-2 border-[#0a1f44] bg-white px-5 py-3 text-sm font-bold tracking-wider text-[#0a1f44] transition hover:bg-gray-50";

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-12">
        <div className="grid grid-cols-2 items-center gap-3 sm:gap-8">
          <div>
            <h1
              className="leading-none"
              style={{ fontFamily: '"Blackhawk", "Arial Black", Impact, sans-serif' }}
            >
              <span className="block text-4xl sm:text-7xl md:text-8xl text-black">
                {t("hero.title_line1")}
              </span>
              <span className="block text-4xl sm:text-7xl md:text-8xl" style={{ color: RED }}>
                {t("hero.title_line2")}
              </span>
            </h1>
            {/* whitespace-pre-line: the CMS stores the line break as \n, not markup. */}
            <p className="mt-2 sm:mt-6 whitespace-pre-line text-[10px] sm:text-lg font-semibold tracking-wide text-[#0a1f44]">
              {t("hero.tagline")}
            </p>
            <div className="mt-3 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
              <a
                href={t("header.cta_url")}
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: RED }}
                className={btnRed + " text-[10px] sm:text-sm px-3 py-2 sm:px-5 sm:py-3"}
              >
                {t("hero.cta_order_label")} <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </a>
              <Link
                to="/meny"
                className={btnOutline + " text-[10px] sm:text-sm px-3 py-2 sm:px-5 sm:py-3"}
              >
                {t("hero.cta_menu_label")}
              </Link>
            </div>
          </div>
          <div>
            <img src={hero} alt="Sushi burrito" className="w-full" />
          </div>
        </div>
        <div className="mt-4 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4 border-t border-border pt-4 sm:pt-6">
          {features.map((f) => {
            const Icon = ICONS[f.icon as keyof typeof ICONS] ?? Fish;
            return (
              <div key={f.title} className="text-center">
                <Icon className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-[#0a1f44]" strokeWidth={1.5} />
                <p className="mt-1 text-[9px] sm:text-xs font-bold tracking-wider text-[#0a1f44]">
                  {f.title}
                </p>
                <p className="text-[8px] sm:text-xs text-muted-foreground">{f.subtitle}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Meny */}
      <section id="meny" className="mx-auto max-w-7xl scroll-mt-4 px-4 py-6 sm:px-6 sm:py-16">
        <h2 className="text-center text-xl sm:text-4xl font-black tracking-wide text-[#0a1f44]">
          {t("menu.heading")}
        </h2>
        <p className="mt-1 text-center text-[10px] sm:text-sm text-muted-foreground">
          {t("menu.subheading")}
        </p>
        <div className="mt-4 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-6">
          {menuCategories.map((c) => (
            <div
              key={c.title}
              className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
            >
              <div className="h-20 sm:h-56 overflow-hidden">
                <img src={c.image_url} alt={c.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-2 sm:p-6">
                <h3 className="text-[10px] sm:text-lg font-bold tracking-wide text-[#0a1f44]">
                  {c.title}
                </h3>
                <p className="mt-1 whitespace-pre-line text-[8px] sm:text-sm text-muted-foreground">
                  {c.description}
                </p>
                <Link
                  to="/meny"
                  className="mt-2 inline-flex items-center gap-1 text-[9px] sm:text-sm font-bold tracking-wider hover:underline"
                  style={{ color: RED }}
                >
                  {t("menu.card_cta_label")} <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Besök oss */}
      <section id="besok-oss" className="mx-auto max-w-7xl scroll-mt-4 px-4 py-6 sm:px-6 sm:py-16">
        <h2 className="text-center text-xl sm:text-4xl font-black tracking-wide text-[#0a1f44]">
          {t("locations.heading")}
        </h2>
        <p className="mt-1 text-center text-[10px] sm:text-sm text-muted-foreground">
          {t("locations.subheading")}
        </p>
        <div className="mt-4 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-6">
          {locations.map((loc, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
            >
              <iframe
                title={`${loc.name} karta`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(loc.map_query)}&output=embed`}
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
                    href={loc.order_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 rounded-sm px-1 py-1.5 sm:px-4 sm:py-2.5 text-[8px] sm:text-sm font-bold tracking-wider text-white transition hover:opacity-90"
                    style={{ backgroundColor: RED }}
                  >
                    {t("locations.cta_order_label")}{" "}
                    <ArrowRight className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                  </a>
                  <a
                    href={loc.site_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 rounded-sm border-2 border-[#0a1f44] bg-white px-1 py-1.5 sm:px-4 sm:py-2.5 text-[8px] sm:text-sm font-bold tracking-wider text-[#0a1f44] transition hover:bg-gray-50"
                  >
                    {t("locations.cta_site_label")}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
