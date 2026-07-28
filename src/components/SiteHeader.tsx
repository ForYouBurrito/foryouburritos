import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, Phone, X } from "lucide-react";

import { useContact, useContent, useNavLinks } from "@/lib/cms";
import { T } from "@/lib/editing";
import { NAVY, RED } from "@/lib/site";

const logo = "/assets/logo.png";

const isInternal = (href: string) => href.startsWith("/") || href.startsWith("#");

/** Renders a nav entry as a router Link when it stays on this site, an <a> otherwise. */
function NavLink({
  href,
  label,
  className,
  onClick,
}: {
  href: string;
  label: string;
  className: string;
  onClick?: () => void;
}) {
  if (isInternal(href)) {
    return (
      <Link to={href} className={className} onClick={onClick}>
        {label}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {label}
    </a>
  );
}

export default function SiteHeader() {
  const [navOpen, setNavOpen] = useState(false);
  const t = useContent();
  const navLinks = useNavLinks();
  const contact = useContact();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">
        {/* The logo is the only flexible item in this row. With order and call moved
            to the bottom bar it only shares the row with the burger, so it gets room
            to breathe again — the cap just stops it being the thing that overflows. */}
        <Link to="/" className="min-w-0 shrink">
          <img
            src={logo}
            alt="For You Burritos"
            className="h-9 w-auto max-w-[60vw] object-contain object-left sm:h-12 sm:max-w-none"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex lg:gap-8">
          {navLinks.map((l) => (
            <NavLink
              key={l.label}
              href={l.href}
              label={l.label}
              className="whitespace-nowrap text-xs font-bold tracking-wider text-[#0a1f44] transition hover:opacity-70"
            />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {/* Order and call are md: and up only. Below that both live in
              <MobileActionBar>, pinned to the bottom of the screen for the whole
              scroll — so repeating them here bought nothing and cost everything:
              logo + phone + "BESTÄLL ONLINE" + burger measured ~337px of content
              against the ~288px a 320px phone actually has, and that overflow is
              what made the whole page pan sideways. Any page rendering this header
              must also render <MobileActionBar>, or it has no order action on
              mobile at all. */}
          <a
            href={`tel:${contact.phoneHref}`}
            aria-label={`Ring oss på ${contact.phone}`}
            title={contact.phone}
            style={{ borderColor: NAVY, color: NAVY }}
            className="hidden shrink-0 items-center justify-center rounded-sm border p-2.5 transition hover:bg-gray-100 md:inline-flex"
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            href={t("header.cta_url")}
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: RED }}
            className="hidden shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-sm px-4 py-2.5 text-xs font-bold tracking-wider text-white transition hover:opacity-90 md:inline-flex"
          >
            <T k="header.cta_label" />
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            aria-label={navOpen ? "Stäng menyn" : "Öppna menyn"}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
            className="shrink-0 rounded-sm p-1.5 text-[#0a1f44] transition hover:bg-gray-100 md:hidden"
          >
            {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {navOpen && (
        <nav className="border-t border-border px-4 py-1 md:hidden">
          {navLinks.map((l) => (
            <NavLink
              key={l.label}
              href={l.href}
              label={l.label}
              onClick={() => setNavOpen(false)}
              className="block border-b border-border py-3.5 text-xs font-bold tracking-wider text-[#0a1f44] last:border-b-0"
            />
          ))}
        </nav>
      )}
    </header>
  );
}
