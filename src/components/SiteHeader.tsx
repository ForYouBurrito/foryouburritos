import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";

import { useContent, useNavLinks } from "@/lib/cms";
import { RED } from "@/lib/site";

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

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-4">
        <Link to="/" className="shrink-0">
          <img src={logo} alt="For You Burritos" className="h-8 w-auto sm:h-12" />
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

        <div className="flex items-center gap-2">
          <a
            href={t("header.cta_url")}
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: RED }}
            className="inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-sm px-2 py-1.5 text-[9px] font-bold tracking-wider text-white transition hover:opacity-90 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-xs"
          >
            {t("header.cta_label")} <ArrowRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
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
        <nav className="border-t border-border px-4 py-2 md:hidden">
          {navLinks.map((l) => (
            <NavLink
              key={l.label}
              href={l.href}
              label={l.label}
              onClick={() => setNavOpen(false)}
              className="block py-2 text-[11px] font-bold tracking-wider text-[#0a1f44]"
            />
          ))}
        </nav>
      )}
    </header>
  );
}
