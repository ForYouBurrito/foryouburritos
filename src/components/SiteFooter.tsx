import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

import { useContact, useContent, useNavLinks, useOpeningHours } from "@/lib/cms";
import { NAVY, RED } from "@/lib/site";

const isInternal = (href: string) => href.startsWith("/") || href.startsWith("#");

/** Same internal/external rule the header uses. */
function FooterLink({ href, label }: { href: string; label: string }) {
  const className =
    "block py-1 text-xs font-bold tracking-[0.15em] text-white/70 transition hover:text-white";
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

export default function SiteFooter() {
  const t = useContent();
  const contact = useContact();
  const navLinks = useNavLinks();
  const openingHours = useOpeningHours();

  // The hairline keeps the footer readable when it follows the navy CTA band on /meny.
  return (
    <footer className="border-t border-white/10" style={{ backgroundColor: NAVY }}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 sm:py-16 lg:grid-cols-4 lg:gap-8">
        {/* Brand */}
        <div className="lg:pr-6">
          <p
            className="text-2xl leading-none text-white sm:text-3xl"
            style={{ fontFamily: '"Blackhawk", "Arial Black", Impact, sans-serif' }}
          >
            FOR YOU{" "}
            <span className="block" style={{ color: RED }}>
              BURRITOS
            </span>
          </p>
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-white/60 sm:text-sm">
            {t("brand.tagline")}
          </p>
        </div>

        {/* Snabblänkar */}
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.25em] text-white sm:text-xs">
            {t("footer.links_heading")}
          </h2>
          <nav className="mt-4">
            {navLinks.map((l) => (
              <FooterLink key={l.label} href={l.href} label={l.label} />
            ))}
          </nav>
        </div>

        {/* Öppettider */}
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.25em] text-white sm:text-xs">
            {t("footer.hours_heading")}
          </h2>
          <dl className="mt-4 space-y-1">
            {openingHours.map((o) => (
              <div
                key={o.day_label}
                className="flex justify-between gap-4 text-xs text-white/60 sm:text-sm"
              >
                <dt>{o.day_label}</dt>
                <dd className="tabular-nums">{o.hours}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Hör av dig */}
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.25em] text-white sm:text-xs">
            {t("footer.contact_heading")}
          </h2>
          <ul className="mt-4 space-y-3 text-xs text-white/60 sm:text-sm">
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-start gap-2.5 transition hover:text-white"
              >
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {contact.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${contact.phoneHref}`}
                className="flex items-start gap-2.5 transition hover:text-white"
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
                className="flex items-start gap-2.5 transition hover:text-white"
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
          <p className="text-[10px] tracking-wider text-white/40">
            © {new Date().getFullYear()} FOR YOU BURRITOS
          </p>
        </div>
      </div>
    </footer>
  );
}
