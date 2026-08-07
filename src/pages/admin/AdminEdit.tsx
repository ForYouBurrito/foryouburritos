import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, LogOut, Search, SlidersHorizontal } from "lucide-react";

import KeepAliveWarning from "@/components/admin/KeepAliveWarning";
import { signOut, useSession } from "@/lib/auth";
import { EditProvider, saveDrafts, useEditing } from "@/lib/editing";
import { NAVY, RED } from "@/lib/site";
import Catering from "@/pages/Catering";
import Index from "@/pages/Index";
import Kontakt from "@/pages/Kontakt";
import Meny from "@/pages/Meny";
import OmOss from "@/pages/OmOss";

/**
 * Which public page is being edited, chosen with ?page=. Only pages whose copy
 * is wrapped in <T> belong here — /meny and /catering are still hardcoded.
 *
 * The reviews on /catering have no entry of their own: they are the same
 * `testimonials` rows shown under START, so editing them once covers both.
 */
const PAGES = {
  start: { label: "START", Component: Index },
  meny: { label: "MENY", Component: Meny },
  catering: { label: "CATERING", Component: Catering },
  "om-oss": { label: "OM OSS", Component: OmOss },
  kontakt: { label: "KONTAKT", Component: Kontakt },
} as const;

type PageKey = keyof typeof PAGES;

/**
 * Floating save bar. Lives inside the provider so it can read the drafts the
 * editable elements register.
 */
function EditToolbar({ page }: { page: PageKey }) {
  const ctx = useEditing();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = Object.keys(ctx?.drafts ?? {}).length;

  async function handleSave() {
    if (!ctx || count === 0) return;
    setSaving(true);
    setError(null);

    const message = await saveDrafts(ctx.drafts);
    setSaving(false);

    if (message) {
      setError(message);
      return;
    }

    // Drop the cached copy so the page re-reads what was just written; keeping
    // the drafts would leave a stale "unsaved" count on already-saved text.
    ctx.clearDrafts();
    await queryClient.invalidateQueries({ queryKey: ["cms"] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="sticky top-0 z-50 border-b border-white/10" style={{ backgroundColor: NAVY }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-[10px] font-bold tracking-[0.2em] text-white">REDIGERINGSLÄGE</p>
          {/* Page switcher. The provider stays mounted across a switch, so
              unsaved drafts from the other page survive and save together. */}
          <nav className="flex items-center gap-3">
            {(Object.keys(PAGES) as PageKey[]).map((key) => (
              <Link
                key={key}
                to={`/admin/edit?page=${key}`}
                aria-current={key === page ? "page" : undefined}
                className={
                  "text-[10px] font-bold tracking-[0.2em] transition " +
                  (key === page
                    ? "text-white underline underline-offset-4"
                    : "text-white/50 hover:text-white")
                }
              >
                {PAGES[key].label}
              </Link>
            ))}
          </nav>
          <span className="text-[10px] text-white/50">Klicka på en text för att ändra den</span>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <span role="alert" className="mr-2 text-[10px] text-red-300">
              {error}
            </span>
          )}
          <Link
            to="/admin/seo"
            className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-[10px] font-bold tracking-wider text-white/70 transition hover:text-white"
          >
            <Search className="h-3 w-3" />
            SEO
          </Link>
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-[10px] font-bold tracking-wider text-white/70 transition hover:text-white"
          >
            <SlidersHorizontal className="h-3 w-3" />
            INSTÄLLNINGAR
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || count === 0}
            style={{ backgroundColor: RED }}
            className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[10px] font-bold tracking-wider text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {saving && <Loader2 className="h-3 w-3 animate-spin" />}
            {saved && <Check className="h-3 w-3" />}
            {saved ? "SPARAT" : `SPARA${count ? ` (${count})` : ""}`}
          </button>
          <button
            type="button"
            onClick={signOut}
            aria-label="Logga ut"
            className="rounded-sm p-1.5 text-white/70 transition hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEdit() {
  const { session, loading } = useSession();
  const [searchParams] = useSearchParams();

  const requested = searchParams.get("page") ?? "";
  const page: PageKey = requested in PAGES ? (requested as PageKey) : "start";
  const { Component } = PAGES[page];

  if (loading) return null;
  if (!session) return <Navigate to="/admin/login" replace />;

  return (
    <EditProvider>
      <KeepAliveWarning />
      <EditToolbar page={page} />
      <Component />
    </EditProvider>
  );
}
