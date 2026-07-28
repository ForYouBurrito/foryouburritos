import { ArrowRight, Phone } from "lucide-react";

import { useContact, useContent } from "@/lib/cms";
import { NAVY, RED } from "@/lib/site";

/**
 * The two goal actions — order and call — pinned within thumb reach for the whole
 * scroll, on phones and small tablets only.
 *
 * This is the *reason* SiteHeader drops its own CTA and phone button below `md:`.
 * Both were duplicated here the moment the visitor started scrolling, and together
 * with the logo and burger they overran a 320px header row. Every public page must
 * render this, or that page has no order action on mobile at all.
 *
 * Labels are read with `t()` rather than wrapped in `<T>`: `header.cta_label` is
 * already an editable node in the desktop header, and two editable nodes bound to
 * one key fight over the write-back.
 */
export default function MobileActionBar() {
  const t = useContent();
  const contact = useContact();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 text-sm font-bold tracking-wider transition hover:opacity-90";

  return (
    // sticky, not fixed: as the last child it parks at the foot of the viewport while
    // scrolling and then settles under the footer, so nothing is ever covered up and
    // no page needs compensating bottom padding.
    // The safe-area pad keeps it clear of the iPhone home indicator.
    <div className="sticky bottom-0 z-20 flex gap-2 border-t border-border bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <a
        href={t("header.cta_url")}
        target="_blank"
        rel="noopener noreferrer"
        style={{ backgroundColor: RED }}
        className={base + " flex-1 text-white"}
      >
        {t("header.cta_label")} <ArrowRight className="h-4 w-4" />
      </a>
      <a
        href={`tel:${contact.phoneHref}`}
        aria-label={`Ring oss på ${contact.phone}`}
        title={contact.phone}
        style={{ borderColor: NAVY, color: NAVY }}
        className={base + " shrink-0 border-2 bg-white px-4"}
      >
        <Phone className="h-4 w-4" strokeWidth={2} />
      </a>
    </div>
  );
}
