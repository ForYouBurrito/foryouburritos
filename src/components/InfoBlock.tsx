import type { LucideIcon } from "lucide-react";

import { RED } from "@/lib/site";

/**
 * The site's feature/info block — used for /catering's värden, /meny's practical
 * notes and /kontakt's three contact blocks.
 *
 * Deliberately has no container: no card, no border, no shadow, no filled icon
 * tile. Those read as generic the moment there is more than one of them on a
 * page, and there are three such groups across the site.
 *
 * What separates one block from the next is whitespace, and what gives it weight
 * is the red rule under the icon — the same motif that opens every hero and sits
 * under the "Vår vision" heading. So these blocks look native to the site rather
 * than like a fourth invented pattern.
 *
 * Cards are still right for *quoted or enumerated* content — the review cards and
 * the "Vår filosofi" numeral cards keep theirs. The rule is: a card when the
 * block is one item among a countable set, no card when it is a fact about the
 * business.
 */

export function InfoGrid({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  // Wide gaps do the work borders used to. Below sm they become vertical rhythm.
  return <div className={`grid gap-10 sm:gap-12 ${className}`}>{children}</div>;
}

export function InfoBlock({
  Icon,
  className = "",
  children,
}: {
  Icon: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      {/* Stroke-only and much larger than the 20px glyph it replaces — at this
          size it carries the block on its own, with nothing boxing it in. */}
      <Icon className="h-8 w-8 text-[#0a1f44] sm:h-9 sm:w-9" strokeWidth={1.5} aria-hidden="true" />
      <div className="mt-5 h-1 w-10" style={{ backgroundColor: RED }} aria-hidden="true" />
      <div className="mt-5">{children}</div>
    </div>
  );
}
