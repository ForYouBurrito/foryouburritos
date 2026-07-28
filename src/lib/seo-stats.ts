/**
 * Read layer for the /admin/seo dashboard.
 *
 * Deliberately NOT built like `cms.ts`. Site copy has hardcoded fallbacks
 * because a marketing page must never render blank; search statistics must do
 * the opposite. Inventing a fallback number here would mean showing the client
 * traffic they do not have, so every hook returns an honest empty array and the
 * dashboard says so.
 *
 * The tables are populated by the keep-alive GitHub Action, not by the browser
 * — Search Console needs a private credential. See `.github/workflows/keep-alive.yml`.
 */
import { useQuery } from "@tanstack/react-query";

import { supabase } from "./supabase";

/** Numbers move at most once every two days, so there is no reason to refetch often. */
const STALE_MS = 10 * 60 * 1000;

export type SeoDailyRow = {
  day: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SeoQueryRow = {
  id: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SeoPageRow = {
  id: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SeoVitalsRow = {
  strategy: "mobile" | "desktop";
  performance: number | null;
  lcp_ms: number | null;
  cls: number | null;
  inp_ms: number | null;
  fetched_at: string;
};

export type SeoMetaRow = {
  site_url: string | null;
  last_fetch_at: string | null;
  last_error: string | null;
};

/**
 * One query per table rather than one combined call: the panels render
 * independently, so a table that has not been migrated yet blanks its own panel
 * instead of taking the whole page down.
 */
function useSeoTable<T>(name: string, select: string, order?: { column: string; asc: boolean }) {
  return useQuery({
    queryKey: ["admin", "seo", name],
    queryFn: async (): Promise<T[]> => {
      if (!supabase) return [];
      let q = supabase.from(name).select(select);
      if (order) q = q.order(order.column, { ascending: order.asc });
      const { data, error } = await q;
      // A missing table (migration not run) or an RLS rejection is not worth an
      // error screen — the dashboard's empty state already covers "no data yet".
      if (error) return [];
      return (data ?? []) as T[];
    },
    staleTime: STALE_MS,
    retry: 1,
  });
}

export function useSeoDaily() {
  return useSeoTable<SeoDailyRow>("seo_daily", "day,clicks,impressions,ctr,position", {
    column: "day",
    asc: true,
  });
}

export function useSeoQueries() {
  return useSeoTable<SeoQueryRow>("seo_queries", "id,query,clicks,impressions,ctr,position", {
    column: "sort_order",
    asc: true,
  });
}

export function useSeoPages() {
  return useSeoTable<SeoPageRow>("seo_pages", "id,page,clicks,impressions,ctr,position", {
    column: "sort_order",
    asc: true,
  });
}

export function useSeoVitals() {
  return useSeoTable<SeoVitalsRow>(
    "seo_vitals",
    "strategy,performance,lcp_ms,cls,inp_ms,fetched_at",
  );
}

/** Single-row status table. Returns null when it has never been written. */
export function useSeoMeta() {
  return useQuery({
    queryKey: ["admin", "seo", "meta"],
    queryFn: async (): Promise<SeoMetaRow | null> => {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from("seo_meta")
        .select("site_url,last_fetch_at,last_error")
        .eq("id", 1)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    staleTime: STALE_MS,
    retry: 1,
  });
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** Google returns CTR as a fraction; the dashboard shows a percentage. */
export const formatCtr = (ctr: number) => `${(ctr * 100).toFixed(1)} %`;

/** Average position is a rank, so one decimal is as precise as it is meaningful. */
export const formatPosition = (position: number) => position.toFixed(1);

export const formatCount = (n: number) => n.toLocaleString("sv-SE");

/**
 * "https://foryouburritos.se/meny" -> "/meny". Search Console returns absolute
 * URLs; the client thinks in page names.
 */
export function shortenPage(page: string): string {
  try {
    const path = new URL(page).pathname;
    return path === "/" ? "/ (startsidan)" : path;
  } catch {
    return page;
  }
}

/**
 * Google's own Core Web Vitals thresholds, used to colour the vitals panel.
 * Returned as a traffic light rather than a raw number so the client does not
 * have to remember what "2.5 s" means.
 */
export type VitalVerdict = "good" | "needs-improvement" | "poor";

export function verdictFor(metric: "lcp" | "cls" | "inp", value: number): VitalVerdict {
  const [good, poor] =
    metric === "lcp" ? [2500, 4000] : metric === "inp" ? [200, 500] : [0.1, 0.25];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

export function verdictForScore(score: number): VitalVerdict {
  if (score >= 90) return "good";
  if (score >= 50) return "needs-improvement";
  return "poor";
}
