/**
 * The Supabase half of form delivery — the half that feeds /admin/forms.
 *
 * Every submission goes to two places at once (see 0025_form_submissions.sql):
 * this table, and the n8n webhook that appends it to the spreadsheet. Neither
 * knows about the other, and either one landing counts as delivered. The pages
 * fire both with `Promise.allSettled` and only fall back to `mailto:` when both
 * come back false.
 *
 * The write side takes the SAME payload objects that get POSTed to n8n, so
 * there is exactly one description of what a submission is — the two
 * destinations cannot drift into disagreeing about a field.
 *
 * Like `seo-stats.ts` and unlike `cms.ts`, the READ side has no fallbacks.
 * Invented rows here would be invented customers.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CateringWebhookPayload } from "./catering-webhook";
import type { ContactWebhookPayload } from "./contact-webhook";
import { supabase } from "./supabase";

/** Leads are read by a human refreshing a page, not polled. */
const STALE_MS = 60 * 1000;

export type SubmissionTable = "contact_submissions" | "catering_submissions";

/** Fields both tables share, so the panel can render one list component. */
type SubmissionBase = {
  id: string;
  submitted_at: string;
  received_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  page_url: string | null;
  is_handled: boolean;
  handled_at: string | null;
};

export type ContactSubmission = SubmissionBase & {
  message: string | null;
};

export type CateringSubmission = SubmissionBase & {
  event_type: string | null;
  event_date: string | null;
  event_time: string | null;
  guests: number | null;
  staff: boolean | null;
  delivery: boolean | null;
  dishes: string[];
  comment: string | null;
};

/* -------------------------------------------------------------------------- */
/* Write — called from the public pages                                        */
/* -------------------------------------------------------------------------- */

export type SaveResult =
  | { ok: true }
  /** `reason` is for the dev console, never for the visitor. */
  | { ok: false; reason: string };

/**
 * Never throws. A form must not break because the database is unreachable —
 * the n8n send runs alongside this one and the page decides what to show.
 */
async function insert(table: SubmissionTable, row: Record<string, unknown>): Promise<SaveResult> {
  if (!supabase) return { ok: false, reason: "Supabase is not configured" };

  try {
    const { error } = await supabase.from(table).insert(row);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "network error" };
  }
}

export function saveContactSubmission(payload: ContactWebhookPayload): Promise<SaveResult> {
  return insert("contact_submissions", {
    submitted_at: payload.submitted_at,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    message: payload.message,
    page_url: payload.page_url,
  });
}

export function saveCateringSubmission(payload: CateringWebhookPayload): Promise<SaveResult> {
  return insert("catering_submissions", {
    submitted_at: payload.submitted_at,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    event_type: payload.event_type,
    // The payload keeps the form's own names; the columns are prefixed because
    // `date` and `time` are reserved-ish and read badly in a table of leads.
    event_date: payload.date,
    event_time: payload.time,
    guests: payload.guests,
    staff: payload.staff,
    delivery: payload.delivery,
    dishes: payload.dishes,
    comment: payload.comment,
    page_url: payload.page_url,
  });
}

/* -------------------------------------------------------------------------- */
/* Read — /admin/forms                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Newest first. RLS already restricts this to signed-in admins, so there is no
 * extra filtering here — an unauthenticated caller simply gets zero rows back
 * rather than an error, which is why the panel's empty state has to be honest
 * about "no submissions yet" rather than assuming a failure.
 */
export function useContactSubmissions() {
  return useQuery({
    queryKey: ["submissions", "contact_submissions"],
    staleTime: STALE_MS,
    queryFn: async (): Promise<ContactSubmission[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as ContactSubmission[];
    },
  });
}

export function useCateringSubmissions() {
  return useQuery({
    queryKey: ["submissions", "catering_submissions"],
    staleTime: STALE_MS,
    queryFn: async (): Promise<CateringSubmission[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("catering_submissions")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as CateringSubmission[];
    },
  });
}

/**
 * The one write the panel performs. `handled_at` is set from the browser rather
 * than a trigger — it is a note about when someone dealt with it, not an audit
 * record, and the table has no other writer to disagree with.
 */
export function useMarkHandled(table: SubmissionTable) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, handled }: { id: string; handled: boolean }) => {
      if (!supabase) throw new Error("Supabase är inte konfigurerad.");
      const { error } = await supabase
        .from(table)
        .update({ is_handled: handled, handled_at: handled ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["submissions", table] }),
  });
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                  */
/* -------------------------------------------------------------------------- */

/** Swedish locale, Stockholm time — the panel is read from the restaurant. */
export const formatReceived = (iso: string) =>
  new Date(iso).toLocaleString("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** `event_date` is already ISO and `event_time` already HH:MM:SS — trim, don't parse. */
export const formatEvent = (date: string | null, time: string | null) => {
  if (!date && !time) return "—";
  return [date, time?.slice(0, 5)].filter(Boolean).join(" kl. ");
};

export const yesNo = (v: boolean | null) => (v === null ? "—" : v ? "Ja" : "Nej");
