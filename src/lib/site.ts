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

/** Where every review card links out to — the business's Google reviews. */
export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?sxsrf=APpeQnuNKyOr3NAy6HpI6zqbrueCGoKGXw:1786621705408&uds=AJ5uw1_a2D0D09lxm8gpKKOTUn4rt9LlPgvY2Q4B3GVnBpQ9H-XvomMwB1-mBhXPYoa4SQN4AnaLHhY3yKBBnzSzcClkYtby9qEkkKF8K5o99wQIcB-ZLHg0ZiUOqARMc1fzoCuK_ATm4OKHkBu9fRH89VKtZPC9GsE40kqGSbx0Mn7Nnk6rD_o&q=For+You+Burritos+Reviews&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_x9i9xCkcByB76zLJUI4r4kkLKGMfBqBgWwPrJ9_QtPFBP-n1dkV8pexEtWhTveW1P9GEB1CJrZ3pFVwHb07WFI7nLdlxikghtivnWEyO8mgZ-q4BA%3D%3D&hl=en-SE";

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
