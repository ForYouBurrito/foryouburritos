/**
 * Image upload for the in-place editor.
 *
 * The owner picks a photo straight off their phone — routinely 4-12 MB, 4000px
 * wide, destined for a box a few hundred pixels across. Uploading that as-is
 * would be worse than the problem this feature solves: the site already loads
 * 5.3 MB of oversized images and takes 16 seconds to show its hero on mobile.
 *
 * So the browser resizes and re-encodes BEFORE uploading. A 4 MB phone photo
 * becomes roughly 80 KB of WebP. Two consequences worth stating:
 *
 *   * Supabase's free tier allows 5 GB/month egress. At 80 KB an image that is
 *     effectively unlimited for a restaurant site; at 1.7 MB it would not be.
 *   * Every image the owner replaces makes the site FASTER. The existing weight
 *     problem heals through normal use instead of needing a separate cleanup.
 *
 * All of it runs in the browser. Nothing here needs a server, and the only
 * credential involved is the signed-in admin's own session — RLS on
 * storage.objects is what actually authorises the write.
 */
import { supabase } from "./supabase";

const BUCKET = "site-images";

/**
 * Widest the site renders any image, times two for high-density screens.
 * Full-bleed hero backgrounds are the constraint; nothing is displayed wider.
 */
const MAX_WIDTH = 2400;
/** WebP at this quality is visually indistinguishable at photographic sizes. */
const QUALITY = 0.82;
/** Refuse absurd input early, with a clear message, rather than at the network. */
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

/** `bytes` is the size actually uploaded, so the UI can report the real saving. */
export type UploadResult = { url: string; bytes: number } | { error: string };

/**
 * Decode a file into a bitmap without attaching it to the document.
 *
 * createImageBitmap handles EXIF orientation, which matters more than it
 * sounds: photos taken in portrait on a phone carry a rotation flag, and an
 * <img>-based decode would upload them sideways.
 */
async function decode(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

/**
 * Resize to at most MAX_WIDTH and re-encode as WebP.
 *
 * Transparency is preserved: the site uses cut-out PNGs (poke-bowl.png is one),
 * and flattening them onto white would show a box wherever they sit on a tinted
 * section. WebP keeps the alpha channel, so no special case is needed.
 */
async function compress(file: File): Promise<Blob> {
  const bitmap = await decode(file);

  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kunde inte behandla bilden i den här webbläsaren.");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALITY),
  );
  if (!blob) throw new Error("Kunde inte konvertera bilden.");
  return blob;
}

/**
 * A stable, collision-free object name.
 *
 * Keyed by the slot it belongs to, so the bucket is browsable and it is obvious
 * which image is which. The timestamp makes each upload a NEW object rather
 * than an overwrite — the CDN caches aggressively, and reusing a path would
 * leave the old picture on screen until the cache expired.
 */
function objectName(slot: string): string {
  const safe = slot.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return `${safe}-${Date.now()}.webp`;
}

/**
 * Compress and upload, returning the public URL to store in site_content.
 *
 * Every failure path returns a Swedish message rather than throwing: this is
 * called from a click handler in the editor, and an unhandled rejection there
 * would leave the owner with a spinner and no explanation.
 */
export async function uploadImage(file: File, slot: string): Promise<UploadResult> {
  if (!supabase) return { error: "Supabase är inte konfigurerad." };

  if (!file.type.startsWith("image/")) {
    return { error: "Filen är inte en bild." };
  }
  if (file.size > MAX_INPUT_BYTES) {
    return { error: "Bilden är för stor. Välj en under 25 MB." };
  }

  let blob: Blob;
  try {
    blob = await compress(file);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Kunde inte behandla bilden." };
  }

  const path = objectName(slot);
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/webp",
    cacheControl: "31536000", // a year: the name changes on every upload
  });

  if (error) {
    // The most likely cause by far is the bucket not existing yet, which means
    // the migration has not been run. Say that rather than echoing "Bucket not
    // found", which tells the owner nothing.
    if (/bucket/i.test(error.message)) {
      return { error: "Bildlagringen är inte uppsatt än — kör migration 0020." };
    }
    return { error: error.message };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, bytes: blob.size };
}

/** Human-readable size, for showing what the compression achieved. */
export const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
