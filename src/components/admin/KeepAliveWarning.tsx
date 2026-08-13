import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

import { supabase } from "@/lib/supabase";

/**
 * Supabase pauses a free-tier project after 7 days without a query, so it has
 * to be pinged. If that stops, nothing announces it: the database simply pauses
 * a week later and the site starts serving the copy hardcoded in the JS bundle,
 * which looks fine while quietly ignoring every edit the client has made.
 *
 * So the admin is told here instead, while there is still time to act.
 *
 * There are TWO pingers (migration 0019):
 *
 *   * `github_at` — the GitHub Action, every 2 days. The primary.
 *   * `pinged_at` — the most recent ping from EITHER source, including the
 *     external cron service acting as backup.
 *
 * Both are checked, because they fail in different ways and only one of them is
 * urgent:
 *
 *   * `pinged_at` stale  -> nothing is pinging at all. The site is days from
 *                           showing stale copy. Red.
 *   * `github_at` stale but `pinged_at` fresh -> the backup is holding the
 *                           database open, so nothing is breaking today, but
 *                           the primary has died and is now a single point of
 *                           failure. Amber.
 *
 * Watching only `pinged_at` would let the backup mask the first failure until
 * the second one arrived and took the site down with no warning at all.
 */
const WARN_AFTER_DAYS = 4; // two missed runs of a 2-day schedule
const CRITICAL_AFTER_DAYS = 6; // one day before Supabase's 7-day cutoff
/** The backup runs daily, so the primary being quiet this long is a real fault. */
const GITHUB_STALE_DAYS = 5;

type Heartbeat = { pinged_at: string | null; github_at: string | null };

const daysSince = (iso: string | null) =>
  iso === null ? Infinity : Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

export default function KeepAliveWarning() {
  const { data } = useQuery({
    queryKey: ["admin", "keep_alive"],
    queryFn: async (): Promise<Heartbeat | null> => {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from("keep_alive")
        .select("pinged_at,github_at")
        .eq("id", 1)
        .maybeSingle();
      // A failure here must never block the editor — it is a health check, not
      // content. This also covers the window before 0019 is applied, when
      // github_at does not exist yet and the select errors.
      if (error) return null;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (!data?.pinged_at) return null;

  const quiet = daysSince(data.pinged_at);
  const githubQuiet = daysSince(data.github_at);

  // Nothing at all is pinging — this is the one that takes the site down.
  if (quiet >= WARN_AFTER_DAYS) {
    const critical = quiet >= CRITICAL_AFTER_DAYS;
    return (
      <Banner critical={critical}>
        Databasen har inte pingats på {quiet} dagar.
        {critical
          ? " Sidan slutar snart visa dina ändringar — kontakta utvecklaren nu."
          : " Något med den automatiska bevakningen kan vara trasigt — kontakta utvecklaren."}
      </Banner>
    );
  }

  // The backup is doing its job, but the primary has stopped. Not urgent today;
  // urgent the moment the backup also stops, which is exactly when nobody would
  // otherwise be watching.
  if (githubQuiet >= GITHUB_STALE_DAYS) {
    return (
      <Banner critical={false}>
        Den automatiska säkerhetskopieringen på GitHub har inte kört på {githubQuiet} dagar. Sidan
        fungerar — reservpingen håller databasen vaken — men hör av dig till utvecklaren.
      </Banner>
    );
  }

  return null;
}

function Banner({ critical, children }: { critical: boolean; children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className={
        "flex flex-wrap items-center gap-2 px-4 py-2.5 text-[11px] font-bold sm:px-6 " +
        (critical ? "bg-red-600 text-white" : "bg-amber-400 text-[#0a1f44]")
      }
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
