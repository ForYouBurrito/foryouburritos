import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Lands every client-side navigation at the top of the new page.
 *
 * A single-page app keeps the scroll position across a route change, so
 * following a nav link from halfway down `/meny` used to drop the visitor
 * halfway down `/catering`. Rendered once inside the router, so it applies to
 * every route without each page having to remember.
 *
 * Two deliberate exceptions:
 * - back/forward (`POP`) keeps its place, which is what a visitor expects and
 *   what the browser's own scroll restoration is already doing;
 * - a link carrying a fragment (`/catering#offert`) scrolls to that element
 *   instead. The browser only resolves fragments on a full page load, not on a
 *   client-side navigation, so it is resolved here.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return;

    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  return null;
}
