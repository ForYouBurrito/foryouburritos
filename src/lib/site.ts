// Shared brand + link constants. Both pages read from here so the header,
// buttons and order links can never drift apart.
//
// NOTE: these are the same values that still live at the top of Index.tsx's
// history — when Supabase content lands (Phase 3), these move to site_content.

export const RED = "#ac1136";
export const NAVY = "#0a1f44";

/** The one Qopla order link every "Beställ" button points at. */
export const ORDER_HEADER =
  "https://foryou.qopla.com/restaurant/for-you-burritos-/qRbQ9pebDD/order";

export const MENU_LINK = "https://foryouburritos.se/";

/** The line under the wordmark, everywhere it appears. */
export const TAGLINE = "Där tradition möter innovation i varje tugga.";

/** `href` starting with "/" or "#" is internal; everything else opens in a new tab. */
export const NAV_LINKS = [
  { label: "MENY", href: "/meny" },
  { label: "CATERING", href: "/catering" },
  { label: "OM OSS", href: "/om-oss" },
  { label: "KONTAKTA OSS", href: "/kontakt" },
];

/**
 * The real contact details. The original catering page rendered these as text but
 * linked them to `contact@mysite.com` / `123-456-7890` placeholders — every link
 * that uses them must come from here so that cannot happen again.
 */
const PHONE = "+46 431 31 14 14";

export const CONTACT = {
  email: "info@foryouburritos.se",
  /** Display form — `tel:` gets the same number with the spaces stripped. */
  phone: PHONE,
  phoneHref: PHONE.replace(/\s/g, ""),
  address: "Östergatan 21, 211 25 Malmö",
};

export const OPENING_HOURS = [
  { day: "Mån", hours: "11–21" },
  { day: "Tis", hours: "11–21" },
  { day: "Ons", hours: "11–21" },
  { day: "Tors", hours: "11–21" },
  { day: "Fre", hours: "11–23" },
  { day: "Lör", hours: "12–23" },
  { day: "Sön", hours: "12–21" },
];
