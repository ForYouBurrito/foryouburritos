import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Loader2, LogOut } from "lucide-react";

import { signOut, useSession } from "@/lib/auth";
import { NAVY, RED } from "@/lib/site";
import { supabase } from "@/lib/supabase";

type Row = { key: string; value: string; label: string; multiline: boolean };

/** "hero.title_line1" -> "hero", so the form can group related copy together. */
const sectionOf = (key: string) => key.split(".")[0];

/**
 * Sections holding values the in-place editor cannot show: `seo.*` never renders
 * on the page at all, and `contact.*` is reused across mailto/tel links, so
 * editing it in one spot on the page would hide the fact that it changes several.
 */
const SETTINGS_SECTIONS = ["seo", "contact"];

/**
 * Keys whose value is an attribute rather than text — a link target or an image
 * source. There is nothing on the page to click and type into, so they belong
 * here. Keep this in step with the page components: a key that renders as an
 * attribute and is not matched here is reachable only via "Visa allt".
 */
const ATTRIBUTE_KEY = /(_url|_image)$/;

const isSettingsKey = (key: string) =>
  SETTINGS_SECTIONS.includes(sectionOf(key)) || ATTRIBUTE_KEY.test(key);

const SECTION_LABELS: Record<string, string> = {
  seo: "SEO",
  header: "Sidhuvud",
  hero: "Hero",
  menu: "Meny",
  locations: "Platser",
  omoss: "Om oss",
  brand: "Varumärke",
  contact: "Kontakt",
  footer: "Sidfot",
};

export default function AdminSettings() {
  const { session, loading } = useSession();
  const queryClient = useQueryClient();

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const { data: rows } = useQuery({
    queryKey: ["admin", "site_content"],
    queryFn: async (): Promise<Row[]> => {
      if (!supabase) throw new Error("Supabase är inte konfigurerad.");
      const { data, error } = await supabase
        .from("site_content")
        .select("key,value,label,multiline")
        .order("key");
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  // Seed the draft state once the rows land; edits live here until saved.
  useEffect(() => {
    if (rows) setDrafts(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  }, [rows]);

  if (loading) return null;
  if (!session) return <Navigate to="/admin/login" replace />;

  const dirty = rows?.filter((r) => drafts[r.key] !== undefined && drafts[r.key] !== r.value) ?? [];

  async function handleSave() {
    if (!supabase || dirty.length === 0) return;
    setSaving(true);
    setError(null);

    // Sequential rather than batched: an upsert would need every column, and a
    // partial failure is easier to report when each row stands alone.
    for (const row of dirty) {
      const { error } = await supabase
        .from("site_content")
        .update({ value: drafts[row.key] })
        .eq("key", row.key);
      if (error) {
        setError(`Kunde inte spara "${row.label}": ${error.message}`);
        setSaving(false);
        return;
      }
    }

    // Refresh both the admin form and the live site's cached copy.
    await queryClient.invalidateQueries({ queryKey: ["admin", "site_content"] });
    await queryClient.invalidateQueries({ queryKey: ["cms"] });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // Default to the values the visual editor cannot reach. "Visa allt" exists so
  // no key is ever stranded — if something is missed here it is still editable.
  const visible = (rows ?? []).filter((r) => showAll || isSettingsKey(r.key));
  const sections = [...new Set(visible.map((r) => sectionOf(r.key)))];

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="sticky top-0 z-30 border-b border-white/10"
        style={{ backgroundColor: NAVY }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <h1 className="text-xs font-bold tracking-[0.25em] text-white">INSTÄLLNINGAR</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/edit"
              className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-[10px] font-bold tracking-wider text-white/70 transition hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              TILLBAKA TILL SIDAN
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || dirty.length === 0}
              style={{ backgroundColor: RED }}
              className="inline-flex items-center gap-2 rounded-sm px-4 py-2 text-xs font-bold tracking-wider text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saved && <Check className="h-3.5 w-3.5" />}
              {saved ? "SPARAT" : `SPARA${dirty.length ? ` (${dirty.length})` : ""}`}
            </button>
            <button
              type="button"
              onClick={signOut}
              aria-label="Logga ut"
              className="rounded-sm p-2 text-white/70 transition hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {error && (
          <p role="alert" className="mb-6 rounded-sm bg-red-50 p-3 text-xs text-red-700">
            {error}
          </p>
        )}

        {!rows && <Loader2 className="h-5 w-5 animate-spin" style={{ color: NAVY }} />}

        {rows && (
          <div className="mb-8 flex items-start justify-between gap-4 border-b border-border pb-6">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Texten som syns på sidan ändrar du direkt på sidan. Här ligger det som inte syns där —
              sökmotortexter, kontaktuppgifter och länkar.
            </p>
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="shrink-0 rounded-sm border border-border px-3 py-1.5 text-[10px] font-bold tracking-wider transition hover:bg-gray-100"
              style={{ color: NAVY }}
            >
              {showAll ? "VISA FÄRRE" : "VISA ALLT"}
            </button>
          </div>
        )}

        {sections.map((section) => (
          <section key={section} className="mb-10">
            <h2 className="text-[10px] font-bold tracking-[0.25em]" style={{ color: NAVY }}>
              {(SECTION_LABELS[section] ?? section).toUpperCase()}
            </h2>
            <div className="mt-4 space-y-4">
              {visible
                .filter((r) => sectionOf(r.key) === section)
                .map((r) => (
                  <label key={r.key} className="block">
                    <span className="text-xs font-semibold" style={{ color: NAVY }}>
                      {r.label}
                    </span>
                    {r.multiline ? (
                      <textarea
                        rows={3}
                        value={drafts[r.key] ?? ""}
                        onChange={(e) => setDrafts((d) => ({ ...d, [r.key]: e.target.value }))}
                        className="mt-1 w-full rounded-sm border border-border px-3 py-2 text-base sm:text-sm outline-none focus:border-[#0a1f44]"
                      />
                    ) : (
                      <input
                        type="text"
                        value={drafts[r.key] ?? ""}
                        onChange={(e) => setDrafts((d) => ({ ...d, [r.key]: e.target.value }))}
                        className="mt-1 w-full rounded-sm border border-border px-3 py-2 text-base sm:text-sm outline-none focus:border-[#0a1f44]"
                      />
                    )}
                    <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                      {r.key}
                    </span>
                  </label>
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
