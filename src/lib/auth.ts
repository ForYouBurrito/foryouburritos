/**
 * Admin authentication.
 *
 * There is no public signup — the single admin account is created by hand in the
 * Supabase dashboard (Authentication -> Users -> Add user). Anyone who is signed
 * in is an admin; RLS grants writes to the `authenticated` role, so the guard in
 * the UI is convenience, not the security boundary. The database is.
 */
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "./supabase";

export type AuthState = {
  session: Session | null;
  /** True until the initial session lookup settles — render nothing until then. */
  loading: boolean;
};

export function useSession(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // getSession resolves from localStorage first, so a reload does not flash
    // the login screen at an already-signed-in admin.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading };
}

export async function signIn(email: string, password: string): Promise<string | null> {
  if (!supabase) return "Supabase är inte konfigurerad.";
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? error.message : null;
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}
