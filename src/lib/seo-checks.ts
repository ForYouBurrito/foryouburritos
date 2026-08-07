/**
 * The writing checker behind /admin/seo.
 *
 * Grades the copy on one page against a "focus phrase" — the words the admin
 * wants that page to be found by — and reports a traffic light plus a checklist.
 * This is the same idea as Yoast on the old WordPress site, which is where the
 * client's expectations come from.
 *
 * Two things it is NOT:
 *
 *   * It is not search data. Nothing here knows what anyone actually searched
 *     for; that comes from Search Console once the site is live. This grades
 *     the writing, not its results.
 *   * It is not the algorithm. These are conventions — Google truncates titles
 *     around 60 characters, descriptions around 158 — not ranking rules. A
 *     green light means the copy is well formed, not that it will rank.
 *
 * Kept deliberately blunt: every check is a rule anyone can explain to the
 * client, because a checklist they do not understand is one they will ignore.
 */

// ---------------------------------------------------------------------------
// Which content belongs to which page
// ---------------------------------------------------------------------------

export type PageKey = "start" | "meny" | "catering" | "om-oss" | "kontakt";

export const PAGE_LABELS: Record<PageKey, string> = {
  start: "STARTSIDAN",
  meny: "MENY",
  catering: "CATERING",
  "om-oss": "OM OSS",
  kontakt: "KONTAKT",
};

export const PAGE_PATHS: Record<PageKey, string> = {
  start: "/",
  meny: "/meny",
  catering: "/catering",
  "om-oss": "/om-oss",
  kontakt: "/kontakt",
};

/**
 * `site_content` key prefixes whose text renders on each page. Site chrome
 * (header, footer, brand, contact) is excluded on purpose — it appears on every
 * page, so counting it would let shared copy carry a thin page over the line.
 */
export const PAGE_PREFIXES: Record<PageKey, string[]> = {
  start: ["hero", "menu", "locations", "reviews"],
  meny: ["meny"],
  catering: ["catering"],
  "om-oss": ["omoss"],
  kontakt: ["kontakt"],
};

/**
 * A key counts as a heading when it is named like one. Verified against the
 * seeded content: hero.title_line1, meny.cta_heading, omoss.philosophy_title,
 * kontakt.visit_title and so on all match, and no body copy does.
 */
const HEADING_KEY = /(^|\.)(title|heading)(_|$)|_(title|heading)(_|$)/;

export const isHeadingKey = (key: string) => HEADING_KEY.test(key);

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

/**
 * Comparison has to survive Swedish. Case is folded with the Swedish locale,
 * and combining marks are stripped so "poke" matches "poké" — a real case here,
 * since the admin is unlikely to type the accent into a focus phrase.
 *
 * å/ä/ö are deliberately NOT folded to a/o: they are distinct letters in
 * Swedish, and treating "mal" as a match for "mål" would be wrong.
 */
const RING_ABOVE = "̊"; // the ring on å
const DIAERESIS = "̈"; // the dots on ä and ö

export function normalise(text: string): string {
  return text
    .toLocaleLowerCase("sv")
    .normalize("NFD")
    // Drop combining marks so "poke" matches "poké", but keep the ring and the
    // diaeresis: å, ä and ö are separate letters in Swedish, not accented a/o.
    // Folding them would make "mal" match "mål".
    .replace(/[̀-ͯ]/g, (m) => (m === RING_ABOVE || m === DIAERESIS ? m : ""))
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when every word of the phrase appears somewhere in the text. Word-set
 * rather than exact-substring: "sushi burrito malmö" should count as present on
 * a page saying "sushiburritos i Malmö", which an exact match would reject and
 * the admin would rightly find baffling.
 */
export function containsPhrase(haystack: string, phrase: string): boolean {
  const h = normalise(haystack);
  const words = normalise(phrase).split(" ").filter(Boolean);
  if (words.length === 0) return false;
  return words.every((w) => h.includes(w));
}

export const countWords = (text: string) => normalise(text).split(" ").filter(Boolean).length;

// ---------------------------------------------------------------------------
// The checks
// ---------------------------------------------------------------------------

export type CheckStatus = "good" | "warn" | "bad";

export type Check = {
  id: string;
  status: CheckStatus;
  message: string;
  /** Shown under a failing check — what to actually do about it. */
  fix?: string;
};

export type PageCopy = {
  title: string;
  description: string;
  focus: string;
  /** Every heading rendered on the page. */
  headings: string[];
  /** All the page's copy, headings included. */
  body: string;
};

/** Google truncates around these. Not rules — conventions worth staying inside. */
const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 158;
/** Below this a page reads as thin to a search engine and to a person. */
const THIN_WORDS = 120;

export function runChecks(copy: PageCopy): Check[] {
  const checks: Check[] = [];
  const focus = copy.focus.trim();

  // Without a focus phrase half the checks are meaningless, so say so once and
  // grade only what can be graded rather than showing six false failures.
  if (!focus) {
    checks.push({
      id: "focus",
      status: "warn",
      message: "Ingen fokusfras angiven",
      fix: "Skriv in det du vill att sidan ska hittas på i Google, till exempel ”sushi burrito malmö”.",
    });
  } else {
    checks.push({
      id: "focus",
      status: "good",
      message: `Fokusfras: ”${focus}”`,
    });
  }

  // --- title ---------------------------------------------------------------
  const titleLen = copy.title.trim().length;
  checks.push({
    id: "title-length",
    status: titleLen === 0 ? "bad" : titleLen < TITLE_MIN || titleLen > TITLE_MAX ? "warn" : "good",
    message:
      titleLen === 0
        ? "Sidtiteln saknas"
        : `Sidtiteln är ${titleLen} tecken${
            titleLen > TITLE_MAX
              ? " — Google kapar den"
              : titleLen < TITLE_MIN
                ? " — kort, det finns plats över"
                : ""
          }`,
    fix:
      titleLen > TITLE_MAX
        ? `Korta ner till under ${TITLE_MAX} tecken, annars klipps slutet bort i sökresultatet.`
        : titleLen < TITLE_MIN
          ? `Sikta på ${TITLE_MIN}–${TITLE_MAX} tecken. Lägg gärna till orten.`
          : undefined,
  });

  if (focus) {
    const inTitle = containsPhrase(copy.title, focus);
    checks.push({
      id: "focus-title",
      status: inTitle ? "good" : "bad",
      message: inTitle ? "Fokusfrasen finns i sidtiteln" : "Fokusfrasen saknas i sidtiteln",
      fix: inTitle ? undefined : "Titeln är det som väger tyngst — få in orden där först.",
    });
  }

  // --- description ---------------------------------------------------------
  const descLen = copy.description.trim().length;
  checks.push({
    id: "desc-length",
    status: descLen === 0 ? "bad" : descLen < DESC_MIN || descLen > DESC_MAX ? "warn" : "good",
    message:
      descLen === 0
        ? "Beskrivningen saknas"
        : `Beskrivningen är ${descLen} tecken${
            descLen > DESC_MAX ? " — för lång" : descLen < DESC_MIN ? " — för kort" : ""
          }`,
    fix:
      descLen > DESC_MAX
        ? `Korta ner till under ${DESC_MAX} tecken, resten syns ändå inte.`
        : descLen < DESC_MIN
          ? `Sikta på ${DESC_MIN}–${DESC_MAX} tecken. Det här är säljtexten i sökresultatet — använd utrymmet.`
          : undefined,
  });

  if (focus) {
    const inDesc = containsPhrase(copy.description, focus);
    checks.push({
      id: "focus-desc",
      status: inDesc ? "good" : "warn",
      message: inDesc ? "Fokusfrasen finns i beskrivningen" : "Fokusfrasen saknas i beskrivningen",
      fix: inDesc
        ? undefined
        : "Google fetmarkerar orden folk sökte på. Får du in dem här sticker raden ut.",
    });

    // --- on the page itself ------------------------------------------------
    const inHeading = copy.headings.some((h) => containsPhrase(h, focus));
    checks.push({
      id: "focus-heading",
      status: inHeading ? "good" : "warn",
      message: inHeading
        ? "Fokusfrasen finns i en rubrik på sidan"
        : "Fokusfrasen saknas i sidans rubriker",
      fix: inHeading
        ? undefined
        : "Rubrikerna talar om vad sidan handlar om. Arbeta in orden i en av dem.",
    });

    const inBody = containsPhrase(copy.body, focus);
    checks.push({
      id: "focus-body",
      status: inBody ? "good" : "bad",
      message: inBody ? "Fokusfrasen förekommer i texten" : "Fokusfrasen förekommer inte i texten",
      fix: inBody
        ? undefined
        : "Orden måste finnas i den synliga texten, inte bara i titeln — annars matchar sidan inte sökningen.",
    });
  }

  // --- volume --------------------------------------------------------------
  const words = countWords(copy.body);
  checks.push({
    id: "thin",
    status: words >= THIN_WORDS ? "good" : words >= THIN_WORDS / 2 ? "warn" : "bad",
    message: `Sidan har ${words} ord`,
    fix:
      words >= THIN_WORDS
        ? undefined
        : `Tunt innehåll rankar sällan. Sikta på minst ${THIN_WORDS} ord — beskriv rätterna, platsen och vad som gör er annorlunda.`,
  });

  return checks;
}

/**
 * One light for the whole page. Any hard failure is red; otherwise any warning
 * is amber. Deliberately harsh — an amber page is one worth looking at, and a
 * score that is green by default would teach the client to ignore it.
 */
export function overallStatus(checks: Check[]): CheckStatus {
  if (checks.some((c) => c.status === "bad")) return "bad";
  if (checks.some((c) => c.status === "warn")) return "warn";
  return "good";
}

/** How the title will actually appear once Google truncates it. */
export function truncateForSerp(text: string, max: number): string {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}

export const SERP_TITLE_MAX = TITLE_MAX;
export const SERP_DESC_MAX = DESC_MAX;
