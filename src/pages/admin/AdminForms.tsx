import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Inbox,
  Loader2,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  UtensilsCrossed,
} from "lucide-react";

import { signOut, useSession } from "@/lib/auth";
import { hasCateringWebhook } from "@/lib/catering-webhook";
import { hasContactWebhook } from "@/lib/contact-webhook";
import {
  formatEvent,
  formatReceived,
  useCateringSubmissions,
  useContactSubmissions,
  useMarkHandled,
  yesNo,
  type CateringSubmission,
  type ContactSubmission,
  type SubmissionTable,
} from "@/lib/form-submissions";
import { NAVY, RED } from "@/lib/site";

/**
 * "/admin/forms" — everything the two public forms have collected.
 *
 * SELF-CONTAINED BY DESIGN. This page reads Supabase and nothing else, so it
 * works with no webhook configured at all — the n8n/spreadsheet delivery is a
 * second, optional destination and this panel never depends on it. Every mention
 * of a spreadsheet in the copy below is therefore conditional on a webhook URL
 * actually being set: telling the reader their enquiries are "also in the sheet"
 * when no sheet exists would send them hunting for a copy nobody ever made.
 *
 * When a webhook IS configured the two are independent recipients, not a mirror
 * — a row in one but not the other is a destination that failed, to investigate,
 * not a sync bug to repair. There is no sync job.
 *
 * Built like /admin/seo, not like the CMS: NO fallback rows. An empty list here
 * means nobody has written in, and saying so plainly is the whole job. Inventing
 * a placeholder enquiry would be inventing a customer.
 *
 * The one write is the handled flag. It is not a workflow — there is no assignee,
 * no status ladder, no archive. A restaurant reads its enquiries and rings people
 * back; the checkbox exists so they can see which ones they have already rung.
 */

type Tab = "catering" | "kontakt";

function Toolbar({
  tab,
  setTab,
  cateringNew,
  kontaktNew,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  cateringNew: number;
  kontaktNew: number;
}) {
  const item = (key: Tab, label: string, count: number) => (
    <button
      key={key}
      type="button"
      onClick={() => setTab(key)}
      aria-current={tab === key ? "page" : undefined}
      className={
        "inline-flex items-center gap-2 border-b-2 px-1 pb-2 text-[10px] font-bold tracking-[0.2em] transition " +
        (tab === key
          ? "border-current"
          : "border-transparent text-muted-foreground hover:text-foreground")
      }
      style={tab === key ? { color: NAVY } : undefined}
    >
      {label}
      {/* The count is of UNHANDLED rows, not all rows — "8" next to a tab has to
          mean "8 things waiting for you", or it stops being worth glancing at. */}
      {count > 0 && (
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px] leading-none text-white"
          style={{ backgroundColor: RED }}
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="mb-6 flex items-center gap-6 border-b border-border">
      {item("catering", "CATERINGFÖRFRÅGNINGAR", cateringNew)}
      {item("kontakt", "MEDDELANDEN", kontaktNew)}
    </div>
  );
}

/** Name, arrival time, and the two things actually worth clicking: mail and phone. */
function CardHeader({
  row,
  table,
  open,
  onToggle,
}: {
  row: {
    id: string;
    name: string;
    received_at: string;
    email: string | null;
    phone: string | null;
    is_handled: boolean;
  };
  table: SubmissionTable;
  open: boolean;
  onToggle: () => void;
}) {
  const mark = useMarkHandled(table);

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex min-w-0 flex-1 items-start gap-2 text-left"
      >
        <ChevronDown
          className={"mt-0.5 h-4 w-4 shrink-0 transition " + (open ? "rotate-180" : "")}
          style={{ color: NAVY }}
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold" style={{ color: NAVY }}>
            {row.name}
          </span>
          <span className="mt-0.5 block text-[11px] tabular-nums text-muted-foreground">
            {formatReceived(row.received_at)}
          </span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        {row.email && (
          <a
            href={`mailto:${row.email}`}
            title={row.email}
            className="rounded-sm border border-border p-1.5 transition hover:bg-gray-50"
            style={{ color: NAVY }}
          >
            <Mail className="h-3.5 w-3.5" />
          </a>
        )}
        {row.phone && (
          <a
            href={`tel:${row.phone.replace(/\s/g, "")}`}
            title={row.phone}
            className="rounded-sm border border-border p-1.5 transition hover:bg-gray-50"
            style={{ color: NAVY }}
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
        )}
        <button
          type="button"
          disabled={mark.isPending}
          onClick={() => mark.mutate({ id: row.id, handled: !row.is_handled })}
          className={
            "inline-flex items-center gap-1.5 rounded-sm border px-2 py-1.5 text-[9px] font-bold tracking-[0.15em] transition disabled:opacity-40 " +
            (row.is_handled
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-border text-muted-foreground hover:bg-gray-50")
          }
        >
          {mark.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
          {row.is_handled ? "HANTERAD" : "MARKERA"}
        </button>
      </div>
    </div>
  );
}

/**
 * One label/value line. A blank value renders as an em dash rather than being
 * hidden, so every request has the same shape and a gap reads as a gap.
 */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-1.5 sm:flex-row sm:gap-3">
      <dt className="pt-0.5 text-[9px] font-bold tracking-[0.15em] text-muted-foreground sm:w-40 sm:shrink-0">
        {label}
      </dt>
      <dd
        className="min-w-0 flex-1 whitespace-pre-line break-words text-xs"
        style={{ color: NAVY }}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

function Card({ children, handled }: { children: React.ReactNode; handled: boolean }) {
  return (
    <li className={"border border-border bg-white p-4 transition " + (handled ? "opacity-55" : "")}>
      {children}
    </li>
  );
}

function ContactCard({ row }: { row: ContactSubmission }) {
  const [open, setOpen] = useState(false);

  return (
    <Card handled={row.is_handled}>
      <CardHeader
        row={row}
        table="contact_submissions"
        open={open}
        onToggle={() => setOpen((o) => !o)}
      />
      {/* Collapsed by default: the list is scanned far more often than any one
          message is read, and a wall of open text buries the newest arrival. */}
      {!open && row.message && (
        <p className="mt-2 truncate pl-6 text-xs text-muted-foreground">{row.message}</p>
      )}
      {open && (
        <dl className="mt-3 border-t border-border pt-3 pl-6">
          <Row label="MAIL" value={row.email ?? ""} />
          <Row label="TELEFON" value={row.phone ?? ""} />
          <Row label="MEDDELANDE" value={row.message ?? ""} />
        </dl>
      )}
    </Card>
  );
}

function CateringCard({ row }: { row: CateringSubmission }) {
  const [open, setOpen] = useState(false);

  return (
    <Card handled={row.is_handled}>
      <CardHeader
        row={row}
        table="catering_submissions"
        open={open}
        onToggle={() => setOpen((o) => !o)}
      />
      {/* Collapsed, a catering row still shows the two facts that decide whether
          it is urgent: what the event is and when it is. */}
      {!open && (
        <p className="mt-2 truncate pl-6 text-xs text-muted-foreground">
          {[
            row.event_type,
            formatEvent(row.event_date, row.event_time),
            row.guests ? `${row.guests} gäster` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      {open && (
        <dl className="mt-3 border-t border-border pt-3 pl-6">
          <Row label="MAIL" value={row.email ?? ""} />
          <Row label="TELEFON" value={row.phone ?? ""} />
          <Row label="EVENEMANGSTYP" value={row.event_type ?? ""} />
          <Row label="DATUM & TID" value={formatEvent(row.event_date, row.event_time)} />
          <Row label="ANTAL GÄSTER" value={row.guests === null ? "" : String(row.guests)} />
          <Row label="SERVERINGSPERSONAL" value={yesNo(row.staff)} />
          <Row label="LEVERANS" value={yesNo(row.delivery)} />
          <Row label="MATRÄTTER" value={row.dishes.join(", ")} />
          <Row label="ÖNSKEMÅL" value={row.comment ?? ""} />
        </dl>
      )}
    </Card>
  );
}

/**
 * The panel stands entirely on its own — it reads Supabase and nothing else, so
 * it works with no webhook configured at all. That is why the second paragraph
 * is conditional: promising the reader a spreadsheet that does not exist yet
 * would send them looking for a copy of their enquiries that nobody ever made.
 */
function Empty({ tab }: { tab: Tab }) {
  const Icon = tab === "catering" ? UtensilsCrossed : Inbox;
  const alsoToSheet = tab === "catering" ? hasCateringWebhook : hasContactWebhook;

  return (
    <div className="border border-border bg-white p-8">
      <Icon className="h-6 w-6" style={{ color: NAVY }} />
      <h2 className="mt-4 text-lg font-bold" style={{ color: NAVY }}>
        {tab === "catering" ? "Inga cateringförfrågningar än" : "Inga meddelanden än"}
      </h2>
      <div className="mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground">
        <p>
          {tab === "catering"
            ? "Här hamnar varje förfrågan som skickas via formuläret på /catering."
            : "Här hamnar varje meddelande som skickas via formuläret på /kontakt."}{" "}
          Det finns inga än — sidan fyller i sig själv så fort någon skickar in.
        </p>
        {alsoToSheet && (
          <p>
            Samma uppgifter skickas också vidare till kalkylarket. Om en rad syns där men inte här
            är något fel, hör av dig till utvecklaren.
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminForms() {
  const { session, loading } = useSession();
  const [tab, setTab] = useState<Tab>("catering");
  /** Off by default: the point of opening this page is to see what is waiting. */
  const [showHandled, setShowHandled] = useState(false);

  const contact = useContactSubmissions();
  const catering = useCateringSubmissions();

  const contactRows = useMemo(() => contact.data ?? [], [contact.data]);
  const cateringRows = useMemo(() => catering.data ?? [], [catering.data]);

  const visibleContact = showHandled ? contactRows : contactRows.filter((r) => !r.is_handled);
  const visibleCatering = showHandled ? cateringRows : cateringRows.filter((r) => !r.is_handled);

  if (loading) return null;
  if (!session) return <Navigate to="/admin/login" replace />;

  const isLoading = tab === "catering" ? catering.isLoading : contact.isLoading;
  const error = tab === "catering" ? catering.error : contact.error;
  const total = tab === "catering" ? cateringRows.length : contactRows.length;
  const visible = tab === "catering" ? visibleCatering : visibleContact;

  /** Whether a spreadsheet exists to point the reader at when a read fails. */
  const anyWebhook = hasContactWebhook || hasCateringWebhook;

  /** Both tabs at once — switching tabs should never show a stale count. */
  const refetching = catering.isFetching || contact.isFetching;
  const refresh = () => {
    void catering.refetch();
    void contact.refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="sticky top-0 z-30 border-b border-white/10"
        style={{ backgroundColor: NAVY }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <h1 className="text-xs font-bold tracking-[0.25em] text-white">FÖRFRÅGNINGAR</h1>
          <div className="flex items-center gap-3">
            {/* An inbox is left open on a tab for hours. react-query refetches on
                window focus, but a manual control is what people actually reach
                for when they are expecting a booking to come in. */}
            <button
              type="button"
              onClick={refresh}
              disabled={refetching}
              className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-[10px] font-bold tracking-wider text-white/70 transition hover:text-white disabled:opacity-40"
            >
              <RefreshCw className={"h-3 w-3 " + (refetching ? "animate-spin" : "")} />
              UPPDATERA
            </button>
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
        <Toolbar
          tab={tab}
          setTab={setTab}
          cateringNew={cateringRows.filter((r) => !r.is_handled).length}
          kontaktNew={contactRows.filter((r) => !r.is_handled).length}
        />

        {/* A failed read must never look like an empty inbox — that is the one
            way this page could lie about there being no customers waiting. */}
        {error && (
          <p role="alert" className="mb-6 rounded-sm bg-red-50 p-3 text-xs text-red-700">
            Kunde inte hämta förfrågningarna: {error.message}.{" "}
            {anyWebhook
              ? "Kalkylarket kan ändå ha fått dem — kontrollera det innan du utgår från att inget har kommit in."
              : "Utgå inte från att inget har kommit in — hör av dig till utvecklaren."}
          </p>
        )}

        {isLoading && <Loader2 className="h-5 w-5 animate-spin" style={{ color: NAVY }} />}

        {!isLoading && !error && total === 0 && <Empty tab={tab} />}

        {!isLoading && !error && total > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-[11px] text-muted-foreground">
                Visar {visible.length} av {total}
              </p>
              <label className="flex cursor-pointer items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showHandled}
                  onChange={(e) => setShowHandled(e.target.checked)}
                  className="h-3.5 w-3.5 accent-current"
                />
                VISA HANTERADE
              </label>
            </div>

            {visible.length === 0 ? (
              <p className="border border-border bg-white p-6 text-xs text-muted-foreground">
                Allt är hanterat. Kryssa i &ldquo;Visa hanterade&rdquo; för att se de gamla.
              </p>
            ) : (
              <ul className="space-y-3">
                {tab === "catering"
                  ? visibleCatering.map((r) => <CateringCard key={r.id} row={r} />)
                  : visibleContact.map((r) => <ContactCard key={r.id} row={r} />)}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
