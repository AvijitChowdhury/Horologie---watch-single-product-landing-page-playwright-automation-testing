import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink/70 border-b border-white/5">
      <div className="mx-auto max-w-[1400px] flex items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl tracking-tight flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-ember animate-pulse" />
          ChronoCraft<span className="text-ember">™</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-[0.22em] text-cream/70">
          <Link to="/" hash="craft" className="hover:text-cream transition">Craft</Link>
          <Link to="/" hash="reviews" className="hover:text-cream transition">Reviews</Link>
          <Link to="/" hash="faq" className="hover:text-cream transition">FAQ</Link>
          {user ? (
            <Link to="/orders" className="hover:text-cream transition">My Orders</Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream/70 hover:text-cream"
            >
              Sign out
            </button>
          ) : (
            <Link to="/auth" className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream/70 hover:text-cream">
              Sign in
            </Link>
          )}
          <Link
            to="/configure"
            className="group relative font-mono text-[11px] uppercase tracking-[0.22em] bg-ember text-ink px-4 py-2.5 hover:bg-cream transition-colors"
          >
            Configure →
          </Link>
        </div>
      </div>
    </header>
  );
}