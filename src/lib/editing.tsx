/**
 * In-place editing.
 *
 * `/admin/edit` renders the real site inside an <EditProvider>, and every text
 * element wrapped in <T> becomes editable where it sits. The owner edits copy in
 * context — seeing the actual font, size and layout — instead of matching keys
 * to fields in a form.
 *
 * Outside the provider, <T> renders plain text and costs nothing, so the public
 * site is unaffected.
 *
 * Why contentEditable rather than <input>: an input cannot inherit the
 * surrounding typography, so the hero headline would stop looking like the hero
 * headline the moment you edited it. A contentEditable span keeps every
 * inherited style and grows with its content.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useContent } from "./cms";
import { supabase } from "./supabase";

/** Where a piece of text lives: a site_content key, or a column of a table row. */
export type Target = { key: string } | { table: string; id: string; field: string };

const targetId = (t: Target) =>
  "key" in t ? `site_content::${t.key}` : `${t.table}::${t.id}::${t.field}`;

type EditContextValue = {
  editing: boolean;
  drafts: Record<string, { target: Target; value: string }>;
  setDraft: (target: Target, value: string) => void;
  clearDrafts: () => void;
};

const EditContext = createContext<EditContextValue | null>(null);

export function useEditing() {
  return useContext(EditContext);
}

export function EditProvider({ children }: { children: React.ReactNode }) {
  const [drafts, setDrafts] = useState<EditContextValue["drafts"]>({});

  const setDraft = useCallback((target: Target, value: string) => {
    setDrafts((d) => ({ ...d, [targetId(target)]: { target, value } }));
  }, []);

  const clearDrafts = useCallback(() => setDrafts({}), []);

  const value = useMemo(
    () => ({ editing: true, drafts, setDraft, clearDrafts }),
    [drafts, setDraft, clearDrafts],
  );

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>;
}

/**
 * Persists drafts. Returns an error message, or null on success.
 *
 * Writes go straight to the same tables the site reads, so RLS is what actually
 * authorises them — an unauthenticated caller gets rejected here regardless of
 * what the UI allowed.
 *
 * Each update ends with `.select()` so we can count the rows it touched. An
 * UPDATE matching nothing is not an error in Postgres, so a key that renders
 * from a fallback but has no row yet — a page shipped ahead of its migration —
 * would otherwise report "SPARAT" and silently discard the edit. Zero rows
 * affected is treated as a failure.
 */
export async function saveDrafts(drafts: EditContextValue["drafts"]): Promise<string | null> {
  if (!supabase) return "Supabase är inte konfigurerad.";

  for (const { target, value } of Object.values(drafts)) {
    const query =
      "key" in target
        ? supabase.from("site_content").update({ value }).eq("key", target.key).select("key")
        : supabase
            .from(target.table)
            .update({ [target.field]: value })
            .eq("id", target.id)
            .select("id");

    const { data, error } = await query;
    if (error) return error.message;

    if (!data || data.length === 0) {
      const what = "key" in target ? target.key : `${target.table}.${target.field}`;
      return `Texten "${what}" finns inte i databasen än — kör migrationen som lägger till den.`;
    }
  }
  return null;
}

type TProps = {
  /** A site_content key. Mutually exclusive with row/table/field. */
  k?: string;
  /** A row from one of the content tables — must carry its `id` to be editable. */
  row?: { id?: string } & Record<string, unknown>;
  table?: string;
  field?: string;
  className?: string;
  /** Inline styles the text must keep — the Blackhawk display face, mainly. */
  style?: React.CSSProperties;
  /**
   * Render as a block when the text contains newlines the layout must keep, or
   * as a heading when the text is one — editability must not cost semantics.
   */
  as?: "span" | "p" | "h1" | "h2" | "h3";
};

/**
 * Text that is editable inside <EditProvider> and a plain string outside it.
 *
 *   <T k="hero.title_line1" />
 *   <T row={loc} table="locations" field="name" />
 */
export function T({ k, row, table, field, className, style, as = "span" }: TProps) {
  const ctx = useEditing();
  const t = useContent();
  const ref = useRef<HTMLElement>(null);

  const value = k ? t(k) : String(row?.[field as string] ?? "");

  // Only rows that exist in the database can be written back to.
  const target: Target | null = k
    ? { key: k }
    : row?.id && table && field
      ? { table, id: row.id, field }
      : null;

  // Push external changes into the DOM, but never while the user is typing —
  // rewriting the node under an active cursor would collapse the selection.
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerText !== value) {
      el.innerText = value;
    }
  }, [value]);

  const Tag = as;

  if (!ctx?.editing || !target) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref as React.Ref<never>}
      style={style}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      tabIndex={0}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const next = e.currentTarget.innerText;
        if (next !== value) ctx.setDraft(target, next);
      }}
      className={[
        className,
        // Translucent, not a light fill: editable text also sits on the navy
        // footer, where an opaque bg-sky-50 would hide white-on-navy copy.
        "rounded-[2px] outline-1 outline-dashed outline-sky-400/70 outline-offset-2",
        "transition hover:bg-sky-400/20 focus:bg-sky-400/25 focus:outline-solid focus:outline-sky-400",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {value}
    </Tag>
  );
}
