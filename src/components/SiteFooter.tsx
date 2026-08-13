import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

import EditableImage from "@/components/EditableImage";
import { useContact, useLocations, useNavLinks, useOpeningHours } from "@/lib/cms";
import { T } from "@/lib/editing";
import { NAVY } from "@/lib/site";

const logo = "/assets/logo.png";

/**
 * Plain backing plate behind the logo — no fade, just a solid rectangle
 * padded out from the mark so the wordmark's black letters (drawn for white
 * paper, invisible on navy) have something light to sit on.
 */
const LOGO_PLATE = "absolute -inset-x-4 -inset-y-3 bg-white/[0.88]";

const isInternal = (href: string) => href.startsWith("/") || href.startsWith("#");

/** Column heading — one shared treatment so the four columns line up exactly. */
function ColHeading({ k }: { k: string }) {
  return (
    <h2 className="text-[11px] font-bold tracking-[0.25em] text-white sm:text-xs">
      <T k={k} />
    </h2>
  );
}

/** Same internal/external rule the header uses. */
function FooterLink({ href, label }: { href: string; label: string }) {
  const className =
    "flex min-h-9 items-center text-xs font-bold tracking-[0.15em] text-white/75 transition hover:text-white";
  if (isInternal(href)) {
    return (
      <Link to={href} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  );
}

/**
 * `seamless` drops the top hairline. It is on by default because the footer
 * usually follows another navy block (/meny's CTA band) and needs the separation
 * — but `/` ends on a navy gradient that is meant to flow straight into the
 * footer, and there the same line reads as an unwanted seam.
 */
export default function SiteFooter({ seamless = false }: { seamless?: boolean }) {
  const contact = useContact();
  const navLinks = useNavLinks();
  const openingHours = useOpeningHours();
  const locations = useLocations();

  // Mobile-only map card at the top of the footer. Same Caroli/Östergatan pick
  // as Index.tsx's `mainLocation` — matched on address rather than name, since
  // two rows are called "Caroli". Falls back to the first row if that one is
  // ever removed.
  const mainLocation =
    locations.find((l) => l.address1.toLowerCase().includes("östergatan")) ?? locations[0];

  return (
    <footer
      className={seamless ? undefined : "border-t border-white/10"}
      style={{ backgroundColor: NAVY }}
    >
      {/* Map block — mobile only. Desktop already gets this same map band from
          Index.tsx's "Besök oss" section / Kontakt.tsx's closing section, so it
          would repeat directly above the footer there; this is the sm:hidden
          counterpart for pages/breakpoints that don't show either of those.
          Full-bleed (no page-gutter padding on the iframe itself) and reuses the
          exact iframe+gradient construction from those two sections — just a
          shorter height, since this card is only ~18% of the mobile footer's
          total height, and the text centered instead of left-aligned. */}
      {mainLocation && (
        <div className="relative sm:hidden">
          <iframe
            title={`${mainLocation.name} karta`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(mainLocation.map_query)}&output=embed`}
            className="block h-40 w-full border-0"
            loading="lazy"
          />
          {/* Same navy gradient as the page map bands, rising off the bottom edge
              so the address is readable over map tiles. pointer-events-none keeps
              the map itself pannable; only the text block re-enables events. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-2/3 flex-col justify-end bg-gradient-to-t from-[#0a1f44] via-[#0a1f44]/90 to-transparent px-4 pb-4 text-center">
            <div className="pointer-events-auto mx-auto max-w-7xl">
              <h2 className="text-base font-bold tracking-wide text-white">
                <T row={mainLocation} table="locations" field="name" className="uppercase" />
              </h2>
              <p className="mt-1.5 text-sm text-white/80">
                <T row={mainLocation} table="locations" field="address1" />{" "}
                <T row={mainLocation} table="locations" field="address2" />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logo + tagline — mobile only, centered. Same lockup as the desktop
          brand column below, just re-wrapped so it isn't left-anchored; the
          three-column row (Öppettider/Hör av dig/Snabblänkar) for mobile is
          added by a later piece. */}
      <div className="flex flex-col items-center px-4 pt-14 text-center sm:hidden">
        <Link to="/" className="relative inline-block">
          {/* Centered lockup, so unlike the desktop span below there's no gutter
              forcing --fl to stay small — equal fl/fr keeps the wash's midpoint
              on the logo's midpoint instead of dragging it toward BURRITOS. */}
          <span aria-hidden="true" className={`pointer-events-none ${LOGO_PLATE}`} />
          <EditableImage
            imageKey="brand.logo_footer"
            fallback={logo}
            alt="For You Burritos"
            hint="Sidfotens logotyp på alla sidor. Ligger på marinblå botten under en ljus tonad platta"
            className="relative h-10 w-auto sm:h-12"
          />
        </Link>
        <T
          as="p"
          k="brand.tagline"
          className="mx-auto mt-5 max-w-xs text-xs leading-relaxed text-white/75 sm:text-sm"
        />
      </div>

      {/* Öppettider / Hör av dig / Snabblänkar — mobile only, 3-up per the
          mockup (not stacked). Order here is Öppettider → Hör av dig →
          Snabblänkar, left to right, which is a reorder from the desktop grid
          below. Only column 1 (Öppettider) is populated so far — columns 2
          and 3 are filled in by later pieces; grid-cols-3 alone reserves
          their width in the meantime. */}
      <div className="sm:hidden grid grid-cols-3 gap-4 px-4">
        {/* Öppettider */}
        <div>
          <ColHeading k="footer.hours_heading" />
          {/* The footer is shared by every page, so editing a row here in
              /admin/edit changes the opening hours site-wide. */}
          <dl className="mt-5 space-y-2">
            {openingHours.map((o) => (
              <div
                key={o.id ?? o.day_label}
                className="flex items-baseline gap-2 text-xs text-white/75 sm:text-sm"
              >
                <dt className="shrink-0">
                  <T row={o} table="opening_hours" field="day_label" />
                </dt>
                {/* Leader-line rule filling the gap between day and hours,
                    e.g. "Mån ────── 11–21". Nudged up 3px so it sits on the
                    visual midline between the two text baselines rather than
                    on the (lower) shared baseline itself. */}
                <span
                  className="h-px flex-1 translate-y-[-3px] bg-white/20"
                  aria-hidden="true"
                />
                <dd className="tabular-nums shrink-0">
                  <T row={o} table="opening_hours" field="hours" />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Hör av dig — same three rows as the desktop column further below,
            duplicated rather than shared/moved (see the Brand and Öppettider
            pieces for why). */}
        <div>
          <ColHeading k="footer.contact_heading" />
          <ul className="mt-5 space-y-1 text-xs text-white/75 sm:text-sm">
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="flex min-h-9 items-start gap-2.5 py-1 transition hover:text-white"
              >
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {contact.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${contact.phoneHref}`}
                className="flex min-h-9 items-start gap-2.5 py-1 transition hover:text-white"
              >
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {contact.phone}
              </a>
            </li>
            <li>
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-9 items-start gap-2.5 py-1 transition hover:text-white"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {contact.address}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="hidden sm:grid mx-auto max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 sm:py-16 lg:grid-cols-4 lg:gap-12">
        {/* Brand */}
        <div className="lg:pr-6">
          <Link to="/" className="relative inline-block">
            {/*
              The wordmark is "B[FOR YOU]URRITOS": the boxed FOR YOU is knocked
              out in white, but BURRITOS is solid black with a light halo — it
              was drawn for white paper and disappears completely on navy.

              So the mark is given light to sit in rather than a card to sit on.

              Not z-indexed: both children are positioned with z-index auto, so
              they paint in DOM order and the mark lands on top. A negative
              z-index here would drop the plate behind the footer's own
              background and hide it.
            */}
            <span aria-hidden="true" className={`pointer-events-none ${LOGO_PLATE}`} />
            <EditableImage
              imageKey="brand.logo_footer"
              fallback={logo}
              alt="For You Burritos"
              hint="Sidfotens logotyp på alla sidor. Ligger på marinblå botten under en ljus tonad platta"
              className="relative h-10 w-auto sm:h-12"
            />
          </Link>
          <T
            as="p"
            k="brand.tagline"
            className="mt-5 max-w-xs text-xs leading-relaxed text-white/75 sm:text-sm"
          />
        </div>

        {/* Snabblänkar */}
        <div>
          <ColHeading k="footer.links_heading" />
          <nav className="mt-5">
            {navLinks.map((l) => (
              <FooterLink key={l.label} href={l.href} label={l.label} />
            ))}
          </nav>
        </div>

        {/* Öppettider */}
        <div>
          <ColHeading k="footer.hours_heading" />
          {/* The footer is shared by every page, so editing a row here in
              /admin/edit changes the opening hours site-wide. */}
          <dl className="mt-5 space-y-2">
            {openingHours.map((o) => (
              <div
                key={o.id ?? o.day_label}
                className="flex justify-between gap-4 text-xs text-white/75 sm:text-sm"
              >
                <dt>
                  <T row={o} table="opening_hours" field="day_label" />
                </dt>
                <dd className="tabular-nums">
                  <T row={o} table="opening_hours" field="hours" />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Hör av dig */}
        <div>
          <ColHeading k="footer.contact_heading" />
          <ul className="mt-5 space-y-1 text-xs text-white/75 sm:text-sm">
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="flex min-h-9 items-start gap-2.5 py-1 transition hover:text-white"
              >
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {contact.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${contact.phoneHref}`}
                className="flex min-h-9 items-start gap-2.5 py-1 transition hover:text-white"
              >
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {contact.phone}
              </a>
            </li>
            <li>
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-9 items-start gap-2.5 py-1 transition hover:text-white"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {contact.address}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <p className="text-[10px] tracking-wider text-white/55">
            © {new Date().getFullYear()} FOR YOU BURRITOS
          </p>
        </div>
      </div>
    </footer>
  );
}
