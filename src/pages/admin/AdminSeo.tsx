import { Link, Navigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Clock, Inbox, Loader2, LogOut, Search } from "lucide-react";

import { signOut, useSession } from "@/lib/auth";
import { NAVY, RED } from "@/lib/site";
import {
  formatCount,
  formatCtr,
  formatPosition,
  shortenPage,
  useSeoDaily,
  useSeoMeta,
  useSeoPages,
  useSeoQueries,
  useSeoVitals,
  verdictFor,
  verdictForScore,
  type VitalVerdict,
} from "@/lib/seo-stats";

/**
 * The SEO dashboard.
 *
 * Everything here is fetched by the keep-alive GitHub Action and written into
 * Supabase — see `.github/workflows/keep-alive.yml`. The browser only reads.
 *
 * The important design constraint: Google has nothing to report until the site
 * is live and has been crawled, which takes days for the first numbers and
 * weeks for useful ones. So "no data" is the EXPECTED state for a while, and it
 * is explained rather than rendered as a broken-looking screen of zeroes.
 */

const VERDICT_STYLE: Record<VitalVerdict, { dot: string; label: string }> = {
  good: { dot: "bg-emerald-500", label: "Bra" },
  "needs-improvement": { dot: "bg-amber-400", label: "Kan bli bättre" },
  poor: { dot: "bg-red-500", label: "Dåligt" },
};

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-[10px] font-bold tracking-[0.25em]" style={{ color: NAVY }}>
        {title}
      </h2>
      {hint && <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-4">
      <p className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums" style={{ color: NAVY }}>
        {value}
      </p>
    </div>
  );
}

/**
 * A dependency-free bar chart. recharts is in the bundle via shadcn but nothing
 * else uses it, and a 28-bar trend does not justify pulling it in.
 */
function Trend({ rows }: { rows: { day: string; clicks: number; impressions: number }[] }) {
  const max = Math.max(...rows.map((r) => r.impressions), 1);

  return (
    <div>
      <div className="flex h-28 items-end gap-[2px]">
        {rows.map((r) => (
          <div
            key={r.day}
            title={`${r.day}: ${r.clicks} klick, ${r.impressions} visningar`}
            className="relative flex-1"
            style={{ height: `${Math.max((r.impressions / max) * 100, 2)}%` }}
          >
            <div className="absolute inset-0 bg-gray-200" />
            {/* Clicks are drawn inside the impressions bar, so the ratio between
                the two is readable without a second axis. */}
            <div
              className="absolute inset-x-0 bottom-0"
              style={{
                height: `${r.impressions ? (r.clicks / r.impressions) * 100 : 0}%`,
                backgroundColor: RED,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{rows[0]?.day}</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 bg-gray-200" /> Visningar
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2" style={{ backgroundColor: RED }} /> Klick
          </span>
        </span>
        <span>{rows[rows.length - 1]?.day}</span>
      </div>
    </div>
  );
}

function DataTable({
  head,
  rows,
}: {
  head: string;
  rows: {
    id: string;
    label: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-[9px] font-bold tracking-[0.15em] text-muted-foreground">
            <th className="py-2 pr-4">{head}</th>
            <th className="py-2 pr-4 text-right">KLICK</th>
            <th className="py-2 pr-4 text-right">VISNINGAR</th>
            <th className="py-2 pr-4 text-right">CTR</th>
            <th className="py-2 text-right">POSITION</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/60">
              <td className="py-2.5 pr-4" style={{ color: NAVY }}>
                {r.label}
              </td>
              <td className="py-2.5 pr-4 text-right tabular-nums">{formatCount(r.clicks)}</td>
              <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">
                {formatCount(r.impressions)}
              </td>
              <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">
                {formatCtr(r.ctr)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                {formatPosition(r.position)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminSeo() {
  const { session, loading } = useSession();

  const { data: daily, isLoading: dailyLoading } = useSeoDaily();
  const { data: queries } = useSeoQueries();
  const { data: pages } = useSeoPages();
  const { data: vitals } = useSeoVitals();
  const { data: meta } = useSeoMeta();

  if (loading) return null;
  if (!session) return <Navigate to="/admin/login" replace />;

  const days = daily ?? [];
  const totals = days.reduce(
    (acc, d) => ({ clicks: acc.clicks + d.clicks, impressions: acc.impressions + d.impressions }),
    { clicks: 0, impressions: 0 },
  );
  // Averaged over days rather than summed: an average of averages is wrong, but
  // weighting by impressions is what Search Console itself reports.
  const totalCtr = totals.impressions ? totals.clicks / totals.impressions : 0;
  const avgPosition = days.length
    ? days.reduce((s, d) => s + d.position * d.impressions, 0) / (totals.impressions || 1)
    : 0;

  const hasData = days.length > 0 || (queries?.length ?? 0) > 0;
  const lastFetch = meta?.last_fetch_at ? new Date(meta.last_fetch_at) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="sticky top-0 z-30 border-b border-white/10"
        style={{ backgroundColor: NAVY }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <h1 className="text-xs font-bold tracking-[0.25em] text-white">SEO</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/forms"
              className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-[10px] font-bold tracking-wider text-white/70 transition hover:text-white"
            >
              <Inbox className="h-3 w-3" />
              FÖRFRÅGNINGAR
            </Link>
            <Link
              to="/admin/edit"
              className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-[10px] font-bold tracking-wider text-white/70 transition hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              TILLBAKA TILL SIDAN
            </Link>
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

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* A failed fetch matters more than the numbers themselves: without it,
            stale figures would sit here looking current. */}
        {meta?.last_error && (
          <p
            role="alert"
            className="mb-6 flex items-start gap-2 rounded-sm bg-red-50 p-3 text-xs text-red-700"
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Senaste hämtningen från Google misslyckades: {meta.last_error}
              <br />
              Siffrorna nedan kan vara gamla. Kontakta utvecklaren.
            </span>
          </p>
        )}

        {dailyLoading && <Loader2 className="h-5 w-5 animate-spin" style={{ color: NAVY }} />}

        {!dailyLoading && !hasData && (
          <div className="border border-border bg-white p-8">
            <Search className="h-6 w-6" style={{ color: NAVY }} />
            <h2 className="mt-4 text-lg font-bold" style={{ color: NAVY }}>
              Väntar på data från Google
            </h2>
            <div className="mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                Den här sidan visar vad folk faktiskt söker på för att hitta hit — vilka ord de
                skriver, hur ofta sidan visas i Google och vilken plats den hamnar på.
              </p>
              <p>
                Google har inget att rapportera förrän sidan ligger live och har hunnit besökas av
                deras sökrobot. De första siffrorna brukar dyka upp efter några dagar, och det tar
                några veckor innan de säger något användbart.
              </p>
              <p>
                Ingenting behöver göras här. Sidan fyller i sig själv så fort Google börjar skicka
                data.
              </p>
            </div>
          </div>
        )}

        {hasData && (
          <>
            <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border pb-6">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Siffrorna gäller de senaste {days.length} dagarna och kommer från Google Search
                Console.
              </p>
              {lastFetch && (
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Uppdaterad {lastFetch.toLocaleDateString("sv-SE")}
                </span>
              )}
            </div>

            <Panel title="ÖVERSIKT">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="KLICK" value={formatCount(totals.clicks)} />
                <Stat label="VISNINGAR" value={formatCount(totals.impressions)} />
                <Stat label="CTR" value={formatCtr(totalCtr)} />
                <Stat label="SNITTPOSITION" value={formatPosition(avgPosition)} />
              </div>
            </Panel>

            {days.length > 1 && (
              <Panel title="TREND">
                <Trend rows={days} />
              </Panel>
            )}

            {(queries?.length ?? 0) > 0 && (
              <Panel
                title="SÖKFRASER"
                hint="Det här skrev folk i Google innan de klickade sig hit. Ord som redan ger visningar men få klick är de bästa att arbeta in i texterna på sidan."
              >
                <DataTable
                  head="SÖKFRAS"
                  rows={(queries ?? []).map((q) => ({ ...q, label: q.query }))}
                />
              </Panel>
            )}

            {(pages?.length ?? 0) > 0 && (
              <Panel title="SIDOR" hint="Vilka sidor Google skickar folk till.">
                <DataTable
                  head="SIDA"
                  rows={(pages ?? []).map((p) => ({ ...p, label: shortenPage(p.page) }))}
                />
              </Panel>
            )}
          </>
        )}

        {/* Performance is measured against the live URL and does not depend on
            search traffic, so it can have data while everything above is empty. */}
        {(vitals?.length ?? 0) > 0 && (
          <Panel
            title="PRESTANDA"
            hint="Hur snabbt sidan känns för en besökare. Google väger in det här i rankningen."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {(vitals ?? []).map((v) => {
                const metrics = [
                  v.performance !== null && {
                    name: "Betyg",
                    value: String(v.performance),
                    verdict: verdictForScore(v.performance),
                  },
                  v.lcp_ms !== null && {
                    name: "Laddtid (LCP)",
                    value: `${(v.lcp_ms / 1000).toFixed(1)} s`,
                    verdict: verdictFor("lcp", v.lcp_ms),
                  },
                  v.cls !== null && {
                    name: "Layouthopp (CLS)",
                    value: v.cls.toFixed(2),
                    verdict: verdictFor("cls", v.cls),
                  },
                  v.inp_ms !== null && {
                    name: "Svarstid (INP)",
                    value: `${v.inp_ms} ms`,
                    verdict: verdictFor("inp", v.inp_ms),
                  },
                ].filter(Boolean) as { name: string; value: string; verdict: VitalVerdict }[];

                return (
                  <div key={v.strategy} className="border border-border bg-white p-4">
                    <p className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground">
                      {v.strategy === "mobile" ? "MOBIL" : "DATOR"}
                    </p>
                    <dl className="mt-3 space-y-2">
                      {metrics.map((m) => (
                        <div key={m.name} className="flex items-center justify-between gap-3">
                          <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span
                              className={`inline-block h-2 w-2 rounded-full ${VERDICT_STYLE[m.verdict].dot}`}
                              title={VERDICT_STYLE[m.verdict].label}
                            />
                            {m.name}
                          </dt>
                          <dd className="text-xs font-bold tabular-nums" style={{ color: NAVY }}>
                            {m.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
      </main>
    </div>
  );
}
