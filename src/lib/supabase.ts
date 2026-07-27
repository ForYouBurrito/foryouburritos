import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Missing env vars must not take the site down. The CMS layer in `cms.ts` falls
 * back to the hardcoded copy in `site.ts` whenever this is null, so a bad deploy
 * renders the old text instead of a blank page.
 */
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true, // the admin dashboard (Phase 4) needs this
          autoRefreshToken: true,
        },
      })
    : null;

if (!supabase && import.meta.env.DEV) {
  console.warn(
    "[cms] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — falling back to hardcoded copy.",
  );
}
