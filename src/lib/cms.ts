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
/**
 * `id` is optional because fallback rows have no database row behind them. The
 * in-place editor keys writes off it, so fallback content is simply not editable
 * — which is correct: there is nothing to write to.
 */
export type NavLinkRow = { id?: string; label: string; href: string };
export type OpeningHourRow = { id?: string; day_label: string; hours: string };
export type FeatureTileRow = { id?: string; title: string; subtitle: string; icon: string };
export type MenuCategoryRow = {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
};
export type LocationRow = {
  id?: string;
  name: string;
  address1: string;
  address2: string;
  map_query: string;
  order_url: string;
  site_url: string;
};
/** One bullet under "Vår filosofi" on /om-oss. */
export type AboutPointRow = { id?: string; body: string };

/**
 * One item on a printed menu sheet. `slug` is the artwork slot it belongs to;
 * layout lives in MenuSheet1/2.tsx, only the words come from here.
 */
export type MenuItemRow = {
  id?: string;
  slug: string;
  name: string;
  price: string;
  description: string;
};

/** A card in one of /catering's three repeating groups. `icon` is only used by 'varden'. */
export type CateringBlockRow = {
  id?: string;
  section: "varden" | "erbjudanden" | "process";
  title: string;
  body: string;
  icon: string;
};
/** A Google review. `rating` is 1-5 and drives how many stars are filled. */
export type TestimonialRow = {
  id?: string;
  quote: string;
  author: string;
  source: string;
  rating: number;
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
  // Mirrors 0009. One restaurant, so no "tre platser" and no choosing between them.
  "locations.subheading":
    "Vi finns på Östergatan 21 i Malmö. Beställ online, ring oss eller kom förbi.",
  "locations.cta_order_label": "BESTÄLL ONLINE",
  "locations.cta_site_label": "VÅR HEMSIDA",
  "reviews.heading": "VAD GÄSTERNA SÄGER",
  "reviews.subheading": "Riktiga omdömen från våra gäster på Google.",
  // Kontakt — verbatim client copy, mirrored from 0010_kontakt.sql. Opening
  // hours are deliberately absent: /kontakt reads the shared `opening_hours`
  // table so this page and the footer cannot drift apart.
  "kontakt.eyebrow": "Vi vill gärna höra från dig",
  "kontakt.title": "Kontakta oss",
  "kontakt.visit_title": "Besöka oss",
  "kontakt.visit_address_line1": "Östergatan 21",
  "kontakt.visit_address_line2": "211 25 Malmö",
  "kontakt.visit_cta_label": "VISA PÅ KARTA",
  "kontakt.contact_title": "Ring/ maila oss",
  "kontakt.email_label": "MAILA OSS",
  "kontakt.hours_title": "Öppettider",
  // Only one of these renders at a time — whichever the live opening_hours row
  // for today says. Added by 0013.
  "kontakt.status_open": "ÖPPET NU",
  "kontakt.status_closed": "STÄNGT JUST NU",
  "kontakt.form_eyebrow": "SKICKA ETT MEDDELANDE",
  "kontakt.form_title": "Hör av dig",
  "kontakt.form_intro": "Fyll i formuläret så återkommer vi så snart vi kan. Fält märkta med",
  "kontakt.form_name": "Namn & Efternamn",
  "kontakt.form_email": "Mail",
  "kontakt.form_phone": "Telefonnummer",
  "kontakt.form_message": "Meddelande",
  "kontakt.form_submit": "SKICKA",
  "kontakt.form_submit_sending": "SKICKAR…",
  "kontakt.form_sent": "Tack! Ditt meddelande är skickat — vi återkommer så snart vi kan.",
  "kontakt.form_mailto":
    "Din e-postklient öppnas med meddelandet ifyllt. Öppnas den inte? Mejla oss direkt på",
  "kontakt.map_address": "Östergatan 21, 211 25 Malmö",
  "kontakt.map_title": "Karta till For You Burritos, Östergatan 21",
  "kontakt.map_cta_label": "ÖPPNA I GOOGLE MAPS",
  "meny.eyebrow": "FOR YOU BURRITOS",
  "meny.title_line1": "VÅR",
  "meny.title_line2": "MENY",
  "meny.intro":
    "Japansk precision, mexikanska vibbar. Hela sortimentet — sushi burritos, poke bowls, nigiri, maki och rolls — finns i menyerna nedan.",
  "meny.cta_order_label": "BESTÄLL ONLINE",
  "meny.cta_scroll_label": "SE MENYN",
  "meny.sheet1_title": "SUSHI BURRITOS",
  "meny.sheet1_sub": "Poke bowls, burrito sticks, lunchlådor & tillägg",
  "meny.sheet2_title": "SUSHI & ROLLS",
  "meny.sheet2_sub": "Sushimenyer, nigiri, maki, inside-out rolls & tillbehör",
  "meny.fullscreen_label": "ÖPPNA I FULLSKÄRM",
  "meny.sheet_cta_title": "Hittat din favorit?",
  "meny.sheet_cta_body": "Beställ direkt online — hämta färdigt i Malmö.",
  "meny.note1_title": "LUNCH BOX 119:–",
  "meny.note1_body": "Måndag–fredag 11–14. Tre lunchlådor med 14 sushibitar var.",
  "meny.note2_title": "ALLERGIER",
  "meny.note2_body": "Fråga personalen — vi hjälper dig hitta rätt.",
  "meny.cta_heading": "HUNGRIG?",
  "meny.cta_body": "Beställ online och hämta i Malmö eller Lund.",
  "meny.cta_button_label": "BESTÄLL",
  "catering.eyebrow": "FOR YOU BURRITOS",
  "catering.title": "CATERING",
  "catering.intro":
    "Oavsett om du planerar en familjemiddag, företagsevent eller en större fest, erbjuder For You Burritos catering fylld med smakrika och kreativa rätter. Våra sushi burritos, sticks och bowls är perfekt balanserade och anpassade för alla tillfällen. Med färska ingredienser och unika smakkombinationer garanterar vi en upplevelse som överraskar och imponerar. Låt oss göra ditt evenemang oförglömligt med mat tillagad med passion och kärlek!",
  "catering.cta_quote_label": "BEGÄR OFFERT",
  "catering.offerings_title": "VAD VI ERBJUDER",
  "catering.offerings_sub":
    "Sushi-plattor, sticks, bowls och friterat — anpassat efter ditt tillfälle.",
  "catering.process_title": "SÅ FUNGERAR DET",
  "catering.process_sub": "Fyra steg från första kontakt till serverad mat.",
  "catering.form_eyebrow": "CATERINGFÖRFRÅGAN",
  "catering.form_title": "BERÄTTA OM DITT EVENT",
  // Om oss — verbatim client copy, mirrored from 0006_om_oss.sql.
  "omoss.eyebrow": "FOR YOU BURRITOS",
  "omoss.title": "Om oss",
  "omoss.intro_1":
    "Vi är passionerade matälskare som älskar att kombinera det bästa från det japanska och internationella köket. Vår resa började med en enkel idé: att skapa en plats där traditionella smaker möter modern kreativitet, och där varje rätt är en smakupplevelse utöver det vanliga.",
  "omoss.intro_2":
    "Som en del av Thai Sushi For You i Västra Hamnen bär vi med oss samma kvalitet och passion för matlagning, men med en unik twist – sushi burritos, sticks och bowls som är både innovativa och smakrika.",
  "omoss.philosophy_title": "Vår filosofi",
  "omoss.philosophy_intro":
    "Vi tror på att mat ska vara mer än bara en måltid – det ska vara en upplevelse. Därför använder vi alltid:",
  "omoss.vision_title": "Vår vision",
  "omoss.vision_body":
    "Vår vision är att skapa en mötesplats där mat, gemenskap och glädje står i centrum. Oavsett om du besöker oss för en middag, beställer take-away eller anlitar oss för catering, vill vi att varje tugga ska vara minnesvärd.",
  "omoss.cta_heading": "HUNGRIG?",
  "omoss.cta_body": "Beställ online och hämta i Malmö eller Lund.",
  "omoss.cta_label": "BESTÄLL",
  // Optional image slots. Set here as well as in 0007 so the page ships with
  // its photos even before the fetch resolves; the owner can point them
  // anywhere from the admin UI. useAboutImage() treats anything that is not
  // URL-shaped as "no image", so clearing a field removes the image entirely.
  //
  // Two of these are the client's transparent cut-outs flattened onto the exact
  // background of the section they sit in (#f6f6f4 / white) — visually
  // identical to a floating PNG, a fraction of the bytes. Changing a section's
  // background means regenerating them.
  "omoss.intro_image": "/assets/omoss-butik.jpg",
  "omoss.philosophy_image": "/assets/omoss-poke.jpg",
  "omoss.vision_image": "/assets/omoss-sushi.jpg",

  // Owner-replaceable images (0020). Each holds the path the page already
  // rendered, so applying that migration changed nothing on screen — the value
  // only moves to a Supabase Storage URL once a replacement is uploaded.
  //
  // These matter more than most fallbacks: they are what visitors see before
  // the fetch resolves, so a stale entry here is a visible flash of the OLD
  // photo on every cold load. Keep them in step with 0020.
  "hero.background_image": "/assets/hero2bg-tight.png",
  "hero.storefront_image": "/assets/omoss-butik.jpg",
  "meny.hero_image": "/assets/IMG_8906-scaled.jpg",
  "meny.masthead_image": "/assets/poke-bowl.png",
  "kontakt.hero_image": "/assets/kontakt-hero.jpg",
  "kontakt.shopfront_image": "/assets/omoss-butik.jpg",
  "catering.hero_image": "/assets/varma.png",
  "catering.poke_image": "/assets/omoss-poke.jpg",
  "omoss.hero_image": "/assets/omoss-hero.jpg",
  // Two keys, not one (0022). The header mark sits on white at 36-48px; the
  // footer mark sits on navy under a feathered wash, in two lockups. One key
  // meant replacing either changed both.
  "brand.logo_header": "/assets/logo.png",
  "brand.logo_footer": "/assets/logo.png",

  // The menu sheet backgrounds (0021). Replaceable, but only by artwork with
  // the same layout — every item and price on /meny is positioned as a
  // percentage of these. See the migration for why.
  "meny.sheet1_artwork": "/assets/Menu1_empty.png",
  "meny.sheet2_artwork": "/assets/Menu2_canvas.png",
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

/** Mirrors 0010_meny_catering.sql. Order matters — it is the rendered order. */
const FALLBACK_CATERING_BLOCKS: CateringBlockRow[] = [
  {
    section: "varden",
    title: "Färska ingredienser",
    body: "Våra rätter tillagas med noggrant utvalda råvaror för att garantera bästa smak och kvalitet.",
    icon: "Leaf",
  },
  {
    section: "varden",
    title: "Mångsidig meny",
    body: "Från sushi och wok till poke bowls och thailändska curryrätter – vi har något för alla smaker.",
    icon: "UtensilsCrossed",
  },
  {
    section: "varden",
    title: "Flexibla lösningar",
    body: "Vi anpassar menyn efter dina behov, oavsett om det är en liten samling eller ett större event.",
    icon: "SlidersHorizontal",
  },
  {
    section: "varden",
    title: "Professionell service",
    body: "Vårt team ser till att allt är perfekt, från matens presentation till leveransen.",
    icon: "Sparkles",
  },
  {
    section: "erbjudanden",
    title: "Sushi-plattor",
    body: "Perfekta för mingel eller som förrätt, med allt från klassiska makirullar till våra signatur-rullar.",
    icon: "",
  },
  {
    section: "erbjudanden",
    title: "Sushi Burrito Sticks",
    body: "Smidigt, gott och fullt av smak! Perfekt balanserade rullar fyllda med färska ingredienser, serverade i en lättätlig stick-form.",
    icon: "",
  },
  {
    section: "erbjudanden",
    title: "Poke Bowls",
    body: "Fräscha och färgstarka bowls, perfekt för en hälsosam och modern touch.",
    icon: "",
  },
  {
    section: "erbjudanden",
    title: "Friterade specialiteter",
    body: "Krispiga och läckra alternativ som alla älskar.",
    icon: "",
  },
  {
    section: "erbjudanden",
    title: "Vegetariska och veganska alternativ",
    body: "För att se till att alla gäster är nöjda.",
    icon: "",
  },
  {
    section: "process",
    title: "Planering",
    body: "Kontakta oss med information om ditt event, antal gäster och önskemål.",
    icon: "",
  },
  {
    section: "process",
    title: "Menyanpassning",
    body: "Vi hjälper dig att välja rätter som passar dina behov.",
    icon: "",
  },
  {
    section: "process",
    title: "Leverans",
    body: "Vi levererar maten direkt till ditt event – alltid fräsch och redo att serveras.",
    icon: "",
  },
  {
    section: "process",
    title: "Extra tjänster",
    body: "Behöver du porslin, serveringspersonal eller något annat? Vi fixar det!",
    icon: "",
  },
];

const FALLBACK_ABOUT_POINTS: AboutPointRow[] = [
  { body: "Färska och högkvalitativa ingredienser" },
  { body: "Autentiska recept från Thailand och Japan" },
  { body: "Noggrann tillagning med kärlek och omtanke" },
];

/**
 * Real Google reviews, mirrored from 0008_testimonials.sql. These are other
 * people's words about a real business — keep them byte-identical to the source
 * rows and never invent, reword or translate one.
 */
const FALLBACK_TESTIMONIALS: TestimonialRow[] = [
  {
    quote:
      "Super nice staff, good customer service as soon as you step inside the door. Great sushi burritos. Will definitely eat there again. Strongly recommend 🤩",
    author: "Matilda Bernelid",
    source: "google reviews",
    rating: 5,
  },
  {
    quote:
      'Nice staff who assured us that we would be full and therefore did not need to buy "waiting food" ....we were really full....so good....so crispy ...so affordable!',
    author: "Jeanette Cabezas",
    source: "google reviews",
    rating: 4,
  },
  {
    quote: "Waawwww new taste new concept",
    author: "Christoffer Fykell",
    source: "google reviews",
    rating: 5,
  },
  {
    quote:
      "One of the most busy Sushi outlet. It is because of their attractive deals mainly. There is a seating arrangement but not for many.",
    author: "Kia",
    source: "google reviews",
    rating: 5,
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
  useRows<NavLinkRow>("nav_links", "id,label,href", NAV_LINKS);

export const useOpeningHours = (): OpeningHourRow[] =>
  useRows<OpeningHourRow>(
    "opening_hours",
    "id,day_label,hours",
    OPENING_HOURS.map((o) => ({ day_label: o.day, hours: o.hours })),
  );

export const useFeatureTiles = (): FeatureTileRow[] =>
  useRows<FeatureTileRow>("feature_tiles", "id,title,subtitle,icon", FALLBACK_FEATURES);

export const useMenuCategories = (): MenuCategoryRow[] =>
  useRows<MenuCategoryRow>(
    "menu_categories",
    "id,title,description,image_url,link_url",
    FALLBACK_MENU,
  );

export const useLocations = (): LocationRow[] =>
  useRows<LocationRow>(
    "locations",
    "id,name,address1,address2,map_query,order_url,site_url",
    FALLBACK_LOCATIONS,
  );

export const useAboutPoints = (): AboutPointRow[] =>
  useRows<AboutPointRow>("about_points", "id,body", FALLBACK_ABOUT_POINTS);

/**
 * Menu-sheet text, keyed by artwork slot.
 *
 * Returns a lookup rather than a list: the component already knows which slots
 * exist and where they sit, and needs the words for a specific one. A slug with
 * no row yet simply falls through to the hardcoded text in the component, so a
 * sheet renders correctly before its migration has been run.
 */
export function useMenuItems(sheet: number): Map<string, MenuItemRow> {
  const { data } = useQuery({
    queryKey: ["cms", "menu_items", sheet],
    queryFn: async (): Promise<MenuItemRow[] | null> => {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from("menu_items")
        .select("id,slug,name,price,description")
        .eq("sheet", sheet)
        .eq("is_active", true);
      if (error) {
        console.warn("[cms] menu_items unavailable, using printed text:", error.message);
        return null;
      }
      return data;
    },
    staleTime: STALE_MS,
    retry: 1,
  });

  return new Map((data ?? []).map((r) => [r.slug, r]));
}

/**
 * All /catering cards in one query, filtered per group in the component. One
 * fetch beats three, and the table is a dozen rows.
 */
export function useCateringBlocks(section: CateringBlockRow["section"]): CateringBlockRow[] {
  const all = useRows<CateringBlockRow>(
    "catering_blocks",
    "id,section,title,body,icon",
    FALLBACK_CATERING_BLOCKS,
  );
  return all.filter((b) => b.section === section);
}

export const useTestimonials = (): TestimonialRow[] =>
  useRows<TestimonialRow>("testimonials", "id,quote,author,source,rating", FALLBACK_TESTIMONIALS);

/**
 * An optional image slot on /om-oss. Returns null unless the stored value looks
 * like a URL.
 *
 * The check is on shape, not emptiness: `useContent()` resolves an empty value
 * to the key name itself (so typos stay visible), which would otherwise reach
 * an <img src>. Leaving the field blank in the admin form must mean "no image".
 */
export function useAboutImage(key: string): string | null {
  const value = useContent()(key);
  return value.startsWith("/") || value.startsWith("http") ? value : null;
}

/**
 * A replaceable image slot (0020).
 *
 * Differs from useAboutImage in what "no value" means. There, an empty slot is
 * a legitimate choice — the section renders without a picture. Here the image
 * is part of the layout, so an empty value must fall back to the file shipped
 * in public/assets/ rather than leaving a hole.
 *
 * `fallback` is that file. useContent() resolves an unknown key to the key
 * name itself, so anything not URL-shaped is treated as absent — which also
 * covers the window before the migration has been applied.
 */
export function useImage(key: string, fallback: string): string {
  const value = useContent()(key);
  return value.startsWith("/") || value.startsWith("http") ? value : fallback;
}

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
