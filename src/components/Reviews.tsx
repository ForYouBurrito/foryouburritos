import { Star } from "lucide-react";

import { useTestimonials } from "@/lib/cms";
import { T } from "@/lib/editing";

/**
 * Google reviews, shared by "/", "/catering" and "/om-oss".
 *
 * The quotes are real customers' words about a real business, so they are only
 * ever rendered — never generated, trimmed or translated here. Editing happens
 * in place at /admin/edit, backed by the `testimonials` table.
 *
 * `className` carries the surface (e.g. "bg-[#f6f6f4]") so each page can slot
 * the section into its own band rhythm.
 */

const DISPLAY = { fontFamily: '"Blackhawk", "Arial Black", Impact, sans-serif' } as const;
const BODY = "text-[#0a1f44]/70";

/** Amber on white is ~2.1:1, so the stars carry no meaning on their own — the
 *  rating is announced as text and filled/outlined differ by shape, not colour. */
function Stars({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${filled} av 5 stjärnor`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={i < filled ? "h-4 w-4 text-amber-400" : "h-4 w-4 text-[#0a1f44]/25"}
          fill={i < filled ? "currentColor" : "none"}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function Reviews({ className = "" }: { className?: string }) {
  const testimonials = useTestimonials();
  if (!testimonials.length) return null;

  return (
    <section className={className}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-24">
        <div className="text-center" style={DISPLAY}>
          <T
            as="h2"
            k="reviews.heading"
            className="text-4xl leading-none text-[#0a1f44] sm:text-6xl lg:text-7xl"
          />
        </div>
        <T
          as="p"
          k="reviews.subheading"
          className={`mx-auto mt-4 max-w-xl text-center text-sm sm:text-base ${BODY}`}
        />

        <ul className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {testimonials.map((r, i) => (
            <li
              key={r.id ?? i}
              className="flex flex-col rounded-lg border border-[#0a1f44]/10 bg-white p-6 shadow-[0_8px_30px_rgba(10,31,68,0.06)] sm:p-7"
            >
              <Stars rating={r.rating} />

              {/* blockquote, because these are attributed words — not our copy. */}
              <blockquote className="mt-5">
                <T
                  row={r}
                  table="testimonials"
                  field="quote"
                  className={`block text-sm leading-relaxed sm:text-base ${BODY}`}
                />
              </blockquote>

              {/* mt-auto pins attribution to the card floor, so the names line up
                  across quotes that run from four words to four lines. */}
              <div className="mt-auto pt-6">
                <T
                  row={r}
                  table="testimonials"
                  field="author"
                  className="block text-sm font-bold text-[#0a1f44] sm:text-base"
                />
                <T
                  row={r}
                  table="testimonials"
                  field="source"
                  className="mt-1 block text-xs text-[#0a1f44]/55"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
