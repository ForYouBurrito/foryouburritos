import { useId, useRef, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";

import { useImage } from "@/lib/cms";
import { useEditing } from "@/lib/editing";
import { formatBytes, uploadImage } from "@/lib/upload";

/**
 * An image the owner can replace from /admin/edit.
 *
 * The counterpart to <T>: outside <EditProvider> this renders a plain <img>
 * with exactly the attributes it was given, so the public site is unaffected
 * and costs nothing.
 *
 * Why it saves immediately rather than joining the draft bar: by the time an
 * upload returns a URL the file is already in Storage. Holding that back as an
 * unsaved draft would risk an object nobody references and nobody can find, if
 * the owner navigated away. Text drafts have no such cost, which is why they
 * still batch behind SPARA.
 *
 * ---------------------------------------------------------------------------
 * The two variants exist because of stacking, not decoration
 * ---------------------------------------------------------------------------
 * "overlay" wraps the image so a hover panel can cover it. That is right for
 * images that sit in the flow — the logo, the poké cut-out.
 *
 * It is WRONG for the full-bleed backgrounds, which are `absolute inset-0
 * -z-10` inside a relative section. Wrapping those would reposition them
 * against the wrapper instead of the section, and a wrapper carrying -z-10
 * creates a stacking context its children cannot escape — the upload button
 * would render behind the hero text, unclickable.
 *
 * So "corner" emits the <img> completely untouched and puts a small button
 * beside it, positioned against the section that was already there.
 */
export type EditableImageProps = {
  /** site_content key holding the override, e.g. "hero.background_image". */
  imageKey: string;
  /** The file in public/assets/ this slot renders when nothing is stored. */
  fallback: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  /** Kept because the hero backgrounds are the LCP element on their pages. */
  fetchPriority?: "high" | "low" | "auto";
  /** Background images are decorative; the section heading already names them. */
  ariaHidden?: boolean;
  /** Guidance shown to the owner — aspect ratio, what the image is for. */
  hint?: string;
  /** See the note above. Defaults to "overlay". */
  variant?: "overlay" | "corner";
};

export default function EditableImage({
  imageKey,
  fallback,
  alt,
  className,
  style,
  width,
  height,
  loading = "lazy",
  decoding,
  fetchPriority,
  ariaHidden,
  hint,
  variant = "overlay",
}: EditableImageProps) {
  const ctx = useEditing();
  const src = useImage(imageKey, fallback);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  // Shown straight after a successful upload. The site_content read is cached,
  // so without this the owner would upload a photo and watch the old one stay
  // on screen until the query refetched.
  const [replaced, setReplaced] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    setNote(null);

    const before = file.size;
    const result = await uploadImage(file, imageKey);

    if ("error" in result) {
      setError(result.error);
      setBusy(false);
      return;
    }

    // Storage now holds the file; site_content must point at it or the upload
    // is both invisible and orphaned.
    const saveError = await ctx?.saveImage(imageKey, result.url);
    if (saveError) {
      setError(saveError);
      setBusy(false);
      return;
    }

    setReplaced(result.url);
    setNote(`Sparad — ${formatBytes(before)} → ${formatBytes(result.bytes)}`);
    setBusy(false);
  }

  const img = (
    <img
      src={replaced ?? src}
      alt={alt}
      aria-hidden={ariaHidden || undefined}
      className={className}
      style={style}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      fetchPriority={fetchPriority}
    />
  );

  if (!ctx?.editing) return img;

  const picker = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      accept="image/*"
      className="sr-only"
      onChange={(e) => {
        const file = e.target.files?.[0];
        // Reset so picking the SAME file twice still fires a change event —
        // the obvious thing to try after a failed upload.
        e.target.value = "";
        if (file) void handleFile(file);
      }}
    />
  );

  const open = (e: React.MouseEvent) => {
    // Several slots (the logo, the storefront) sit inside a <Link>. Without
    // this, clicking would follow the link instead of opening the picker.
    e.preventDefault();
    e.stopPropagation();
    inputRef.current?.click();
  };

  const status = (error || note) && (
    <span
      role={error ? "alert" : "status"}
      className={
        "block px-2 py-1 text-[10px] font-bold " +
        (error ? "bg-red-600 text-white" : "bg-emerald-600 text-white")
      }
    >
      {error ?? note}
    </span>
  );

  if (variant === "corner") {
    return (
      <>
        {img}
        {picker}
        {/* Positioned against the section the image already belonged to, which
            is relative in every case this is used. z-20 clears the tint
            overlays that sit above these backgrounds. */}
        <span className="absolute right-3 top-3 z-20 flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={open}
            disabled={busy}
            aria-label={`Byt bild: ${alt || imageKey}`}
            title={hint}
            className={
              "inline-flex items-center gap-1.5 rounded-sm bg-[#0a1f44]/85 px-2.5 py-1.5 " +
              "text-[10px] font-bold tracking-[0.2em] text-white outline-1 outline-dashed " +
              "outline-sky-400/70 transition hover:bg-[#0a1f44] disabled:cursor-wait"
            }
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageUp className="h-3 w-3" />}
            {busy ? "LADDAR UPP…" : "BYT BILD"}
          </button>
          {status}
        </span>
      </>
    );
  }

  return (
    <span className="group relative inline-block max-w-full align-top">
      {img}
      {picker}
      <button
        type="button"
        onClick={open}
        disabled={busy}
        aria-label={`Byt bild: ${alt || imageKey}`}
        className={
          "absolute inset-0 flex flex-col items-center justify-center gap-1 " +
          "bg-[#0a1f44]/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100 " +
          "outline-2 outline-dashed outline-sky-400/70 -outline-offset-2 disabled:cursor-wait"
        }
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageUp className="h-5 w-5" />}
        <span className="text-[10px] font-bold tracking-[0.2em]">
          {busy ? "LADDAR UPP…" : "BYT BILD"}
        </span>
        {hint && !busy && (
          <span className="max-w-[85%] text-center text-[9px] leading-tight opacity-80">
            {hint}
          </span>
        )}
      </button>
      {(error || note) && <span className="absolute inset-x-0 bottom-0 z-10">{status}</span>}
    </span>
  );
}
