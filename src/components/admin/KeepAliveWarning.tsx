import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";

import { supabase } from "@/lib/supabase";

/**
 * Supabase pauses a free-tier project after 7 days without a query, so the
 * keep-alive job pings it every 2 days. If that job stops — workflow disabled,
 * deploy key removed, cron service gone — nothing announces it. The database
 * simply pauses a week later and the site starts serving its built-in fallback
 * copy, which looks fine while quietly ignoring every recent edit.
 *
 * So the admin is told here instead, while there is still time to act.
 */
const WARN_AFTER_DAYS = 4; // two missed runs of a 2-day schedule
const CRITICAL_AFTER_DAYS = 6; // one day before Supabase's 7-day cutoff

export default function KeepAliveWarning() {
  const { data } = useQuery({
    queryKey: ["admin", "keep_alive"],
    queryFn: async (): Promise<string | null> => {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from("keep_alive")
        .select("pinged_at")
        .eq("id", 1)
        .maybeSingle();
      // A failure here must never block the editor — it is a health check, not content.
      if (error) return null;
      return data?.pinged_at ?? null;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (!data) return null;

  const days = Math.floor((Date.now() - new Date(data).getTime()) / 86_400_000);
  if (days < WARN_AFTER_DAYS) return null;

  const critical = days >= CRITICAL_AFTER_DAYS;

  return (
    <div
      role="alert"
      className={
        "flex flex-wrap items-center gap-2 px-4 py-2.5 text-[11px] font-bold sm:px-6 " +
        (critical ? "bg-red-600 text-white" : "bg-amber-400 text-[#0a1f44]")
      }
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span>
        Databasen har inte pingats på {days} dagar.
        {critical
          ? " Sidan slutar snart visa dina ändringar — kontakta utvecklaren nu."
          : " Något med den automatiska bevakningen kan vara trasigt — kontakta utvecklaren."}
      </span>
    </div>
  );
}
