import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { signIn, useSession } from "@/lib/auth";
import { useImage } from "@/lib/cms";
import { NAVY, RED } from "@/lib/site";

export default function AdminLogin() {
  const { session, loading } = useSession();
  // Read before the early returns below — a hook after them would not run on
  // every render.
  const logo = useImage("brand.logo_header", "/assets/logo.png");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  // Straight into the visual editor — the form is a side trip, not the front door.
  if (session) return <Navigate to="/admin/edit" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const message = await signIn(email, password);
    setBusy(false);
    // On success the session listener redirects; only failures land here.
    if (message) setError(message);
  }

  const field =
    "w-full rounded-sm border border-border px-3 py-2 text-base sm:text-sm outline-none focus:border-[#0a1f44]";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8"
      >
        {/* Reads the CMS logo so a replaced one shows here too, but is not
            editable: nobody is signed in on this page, so an upload could only
            be rejected by RLS. */}
        <img src={logo} alt="For You Burritos" className="mx-auto block h-12 w-auto" />
        <h1
          className="mt-6 text-center text-xs font-bold tracking-[0.25em]"
          style={{ color: NAVY }}
        >
          ADMIN
        </h1>

        <label className="mt-6 block text-xs font-bold tracking-wider" style={{ color: NAVY }}>
          E-POST
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field + " mt-1 font-normal tracking-normal"}
          />
        </label>

        <label className="mt-4 block text-xs font-bold tracking-wider" style={{ color: NAVY }}>
          LÖSENORD
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field + " mt-1 font-normal tracking-normal"}
          />
        </label>

        {error && (
          <p role="alert" className="mt-4 text-xs text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          style={{ backgroundColor: RED }}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm px-5 py-3 text-sm font-bold tracking-wider text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          LOGGA IN
        </button>
      </form>
    </div>
  );
}
