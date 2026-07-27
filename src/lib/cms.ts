/**
 * CMS read layer.
 *
 * Every hook here returns content immediately, from the hardcoded fallbacks
 * below, and swaps in Supabase rows once they arrive. Nothing ever renders
 * empty, blocks on the network, or throws when the database is unreachable.
 *
 * That matters more than usual here: the project runs on Supabase's free tier,
 * which pauses after 7 days idle and cold-starts slowly. A visitor who lands
 * mid-cold-start sees the fallback copy, not a blank page.
 *
 * The fallbacks are the last-known-good copy. Keep them in sync when changing
 * seeded content — they are what ships in the JS bundle.
 */
import { useQuery } from "@tanstack/react-query";

import { supabase } from "./supabase";
import { CONTACT, MENU_LINK, NAV_LINKS, OPENING_HOURS, ORDER_HEADER, TAGLINE } from "./site";

// Content changes rarely and is edited by one admin, so a long stale time keeps
// the free-tier database quiet without making edits feel unreasonably delayed.
const STALE_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// Types — mirror the tables in supabase/migrations/
// ---------------------------------------------------------------------------
export type NavLinkRow = { label: string; href: string };
export type OpeningHourRow = { day_label: string; hours: string };
export type FeatureTileRow = { title: string; subtitle: string; icon: string };
export type MenuCategoryRow = {
  title: string;
  description: string;
  image_url: string;
  link_url: string;
};
export type LocationRow = {
  name: string;
  address1: string;
  address2: string;
  map_query: string;
  order_url: string;
  site_url: string;
};

// ---------------------------------------------------------------------------
// Fallbacks
// ---------------------------------------------------------------------------
const FALLBACK_CONTENT: Record<string, string> = {
  "brand.tagline": TAGLINE,
  "contact.email": CONTACT.email,
  "contact.phone": CONTACT.phone,
  "contact.address": CONTACT.address,
  "footer.links_heading": "SNABBLÄNKAR",
  "footer.hours_heading": "ÖPPETTIDER",
  "footer.contact_heading": "HÖR AV DIG",
  "header.cta_label": "BESTÄLL ONLINE",
  "header.cta_url": ORDER_HEADER,
  "hero.title_line1": "SHUSHI",
  "hero.title_line2": "BURRITO",
  "hero.tagline": "JAPANESE PRECISION.\nMEXICAN VIBES.",
  "hero.cta_order_label": "BESTÄLL ONLINE",
  "hero.cta_menu_label": "VÅR MENY",
  "menu.heading": "UPPTÄCK VÅR MENY",
  "menu.subheading": "Sushi möter burrito. Tre kategorier, oändliga möjligheter.",
  "menu.card_cta_label": "SE MENYN",
  "locations.heading": "BESÖK OSS",
  "locations.subheading":
    "Tre platser. Samma passion. Välj din favorit och beställ eller besök oss idag.",
  "locations.cta_order_label": "BESTÄLL ONLINE",
  "locations.cta_site_label": "VÅR HEMSIDA",
};

const FALLBACK_FEATURES: FeatureTileRow[] = [
  { title: "FÄRSKA RÅVAROR", subtitle: "Varje dag", icon: "Fish" },
  { title: "HANDRULLADE", subtitle: "Med passion", icon: "Hand" },
  { title: "DJÄRVA SMAKER", subtitle: "Som sticker ut", icon: "Flame" },
];

const FALLBACK_MENU: MenuCategoryRow[] = [
  {
    title: "SUSHI",
    description: "Klassiska smaker.\nJapansk tradition.",
    image_url: "/assets/sushi.png",
    link_url: MENU_LINK,
  },
  {
    title: "VARMA THAIRÄTTER",
    description: "Kryddstarka favoriter.\nLagade på beställning.",
    image_url: "/assets/varma.png",
    link_url: MENU_LINK,
  },
  {
    title: "FRITERADE THAIRÄTTER",
    description: "Krispigt, smakrikt\noch alltid mättande.",
    image_url: "/assets/friterade.png",
    link_url: MENU_LINK,
  },
];

const FALLBACK_LOCATIONS: LocationRow[] = [
  {
    name: "Västra Hamnen",
    address1: "Einar Hansens Esplanad 31,",
    address2: "211 75 Malmö",
    map_query: "Einar Hansens Esplanad 31, 211 75 Malmö",
    order_url:
      "https://foryou.qopla.com/restaurant/thai-n-sushi-for-you---vastra-hamnen/qomYBBd13K/order",
    site_url: MENU_LINK,
  },
  {
    name: "Caroli",
    address1: "Östergatan 21,",
    address2: "211 25 Malmö",
    map_query: "Östergatan 21, 211 25 Malmö",
    order_url: ORDER_HEADER,
    site_url: MENU_LINK,
  },
  {
    name: "Caroli",
    address1: "Kyrkogatan 21,",
    address2: "222 22 Lund, Sweden",
    map_query: "Kyrkogatan 21, 222 22 Lund",
    order_url: ORDER_HEADER,
    site_url: "https://www.thaisushiforyou.se/",
  },
];

// ---------------------------------------------------------------------------
// Shared fetch helper
// ---------------------------------------------------------------------------
/**
 * Returns null on any failure — missing client, network error, RLS rejection —
 * so callers fall through to their fallback rather than surfacing an error.
 */
async function fetchRows<T>(table: string, columns: string): Promise<T[] | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(table)
    .select(columns)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn(`[cms] ${table} unavailable, using fallback:`, error.message);
    return null;
  }
  return (data as T[]) ?? null;
}

function useRows<T>(table: string, columns: string, fallback: T[]): T[] {
  const { data } = useQuery({
    queryKey: ["cms", table],
    queryFn: () => fetchRows<T>(table, columns),
    staleTime: STALE_MS,
    retry: 1,
  });

  // An empty table is treated as "not configured" rather than "no content",
  // so deleting every row in the admin UI cannot blank a section of the site.
  return data && data.length > 0 ? data : fallback;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Returns `t(key, fallback?)` for keyed copy.
 *
 * Resolution order: Supabase row -> explicit fallback argument ->
 * FALLBACK_CONTENT -> the key itself (so a typo is visible rather than blank).
 */
export function useContent() {
  const { data } = useQuery({
    queryKey: ["cms", "site_content"],
    queryFn: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase.from("site_content").select("key,value");
      if (error) {
        console.warn("[cms] site_content unavailable, using fallback:", error.message);
        return null;
      }
      return Object.fromEntries(data.map((r) => [r.key, r.value])) as Record<string, string>;
    },
    staleTime: STALE_MS,
    retry: 1,
  });

  return (key: string, fallback?: string): string =>
    data?.[key] || fallback || FALLBACK_CONTENT[key] || key;
}

export const useNavLinks = (): NavLinkRow[] =>
  useRows<NavLinkRow>("nav_links", "label,href", NAV_LINKS);

export const useOpeningHours = (): OpeningHourRow[] =>
  useRows<OpeningHourRow>(
    "opening_hours",
    "day_label,hours",
    OPENING_HOURS.map((o) => ({ day_label: o.day, hours: o.hours })),
  );

export const useFeatureTiles = (): FeatureTileRow[] =>
  useRows<FeatureTileRow>("feature_tiles", "title,subtitle,icon", FALLBACK_FEATURES);

export const useMenuCategories = (): MenuCategoryRow[] =>
  useRows<MenuCategoryRow>(
    "menu_categories",
    "title,description,image_url,link_url",
    FALLBACK_MENU,
  );

export const useLocations = (): LocationRow[] =>
  useRows<LocationRow>(
    "locations",
    "name,address1,address2,map_query,order_url,site_url",
    FALLBACK_LOCATIONS,
  );

/** Contact details, with the `tel:` href derived so only one value needs editing. */
export function useContact() {
  const t = useContent();
  const phone = t("contact.phone");
  return {
    email: t("contact.email"),
    phone,
    phoneHref: phone.replace(/\s/g, ""),
    address: t("contact.address"),
  };
}
