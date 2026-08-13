import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

import EditableImage from "@/components/EditableImage";
import { useContact, useNavLinks, useOpeningHours } from "@/lib/cms";
import { T } from "@/lib/editing";
import { NAVY } from "@/lib/site";

const logo = "/assets/logo.png";

/**
 * Feathers the logo's backing wash out on both axes independently.
 *
 * A radial gradient is the obvious tool and the wrong one here: the wordmark is
 * ~4.5:1, so an ellipse that fades within its box leaves the far ends of
 * "BURRITOS" — and its corners especially — in shadow while the middle stays
 * bright. Two linear masks intersected hold a flat plateau across the whole
 * mark and fall off only past it, which is why the wash has no edge anywhere
 * yet the black letters sit on near-white from the B to the S.
 *
 * The falloff is in px, not %, and is the padding either side of the mark. A
 * percentage falloff is measured against the box, so it reaches inside the logo
 * and dims the outer letters — and by a different amount at every breakpoint,
 * since the logo changes height.
 *
 * It is asymmetric because the space is. The logo starts at the footer's own
 * page gutter, so there is nothing to the left of it to fade into: `--fl` is
 * capped at exactly that gutter (16px, 24px at sm) so the wash reaches zero
 * precisely at the screen edge and runs off it. Any wider and it is sliced
 * mid-fade, leaving a hard vertical edge down the side of the mark on phones.
 * The left fade is therefore run 16px *into* the mark to buy a longer ramp than
 * the gutter alone allows; it costs the "B" a slightly less bright backing and
 * is well worth it. To the right the column is empty, so `--fr` takes a long
 * fade there — which is what stops the whole thing reading as a plate.
 *
 * No border-radius on purpose either: a radius clips the mask's low-alpha tail
 * mid-falloff, and that cut reads as a faint rounded rectangle floating on the
 * navy — the exact boxed-in look this is avoiding. The mask alone shapes it.
 */
const MASK =
  "linear-gradient(to right, transparent 0, #000 calc(var(--fl) + 16px), #000 calc(100% - var(--fr)), transparent 100%)," +
  "linear-gradient(to bottom, transparent 0, #000 28px, #000 calc(100% - 28px), transparent 100%)";

const FEATHER = {
  left: "calc(var(--fl) * -1)",
  right: "calc(var(--fr) * -1)",
  insetBlock: "-28px",
  maskImage: MASK,
  maskComposite: "intersect",
  WebkitMaskImage: MASK,
  WebkitMaskComposite: "source-in",
} as const;

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

  return (
    <footer
      className={seamless ? undefined : "border-t border-white/10"}
      style={{ backgroundColor: NAVY }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 sm:py-16 lg:grid-cols-4 lg:gap-12">
        {/* Brand */}
        <div className="lg:pr-6">
          <Link to="/" className="relative inline-block">
            {/*
              The wordmark is "B[FOR YOU]URRITOS": the boxed FOR YOU is knocked
              out in white, but BURRITOS is solid black with a light halo — it
              was drawn for white paper and disappears completely on navy.

              So the mark is given light to sit in rather than a card to sit on.
              See FEATHER above for why the falloff is two linear masks and not
              a radial gradient.

              Not z-indexed: both children are positioned with z-index auto, so
              they paint in DOM order and the mark lands on top. A negative
              z-index here would drop the wash behind the footer's own
              background and hide it.
            */}
            <span
              aria-hidden="true"
              style={FEATHER}
              className="pointer-events-none absolute [--fl:16px] [--fr:52px] bg-white/[0.88] sm:[--fl:24px] sm:[--fr:88px]"
            />
            <EditableImage
              imageKey="brand.logo_image"
              fallback={logo}
              alt="For You Burritos"
              hint="Samma logotyp som i sidhuvudet"
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
