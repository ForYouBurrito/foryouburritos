import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

import { useContact, useNavLinks, useOpeningHours } from "@/lib/cms";
import { T } from "@/lib/editing";
import { NAVY } from "@/lib/site";

const logo = "/assets/logo.png";

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
          <Link to="/" className="inline-block">
            <img src={logo} alt="For You Burritos" className="h-10 w-auto sm:h-12" />
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
