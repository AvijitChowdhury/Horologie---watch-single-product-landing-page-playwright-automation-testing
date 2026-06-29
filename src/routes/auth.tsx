import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in · ChronoCraft" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="min-h-screen bg-ink text-cream">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-20">
        <div className="eyebrow">Atelier Access</div>
        <h1 className="font-display text-5xl mt-2 mb-8">
          {mode === "signin" ? "Welcome back." : "Begin your craft."}
        </h1>

        <button
          onClick={google}
          className="w-full border border-white/15 hover:border-cream/40 py-3.5 font-mono text-xs uppercase tracking-[0.25em] transition mb-6"
        >
          Continue with Google
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream/40">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={submit} className="space-y-5">
          {mode === "signup" && (
            <Field label="Full name" value={name} onChange={setName} type="text" required />
          )}
          <Field label="Email" value={email} onChange={setEmail} type="email" required />
          <Field label="Password" value={password} onChange={setPassword} type="password" required minLength={6} />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ember text-ink font-mono text-sm uppercase tracking-[0.25em] py-4 hover:bg-cream transition disabled:opacity-50"
          >
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-cream/60">
          {mode === "signin" ? (
            <>New to ChronoCraft? <button className="text-ember underline-offset-4 hover:underline" onClick={() => setMode("signup")}>Create an account</button></>
          ) : (
            <>Already have one? <button className="text-ember underline-offset-4 hover:underline" onClick={() => setMode("signin")}>Sign in</button></>
          )}
        </div>
        <div className="mt-4 text-center"><Link to="/" className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream/40 hover:text-cream">← Back to atelier</Link></div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, value, onChange, type, required, minLength }: {
  label: string; value: string; onChange: (v: string) => void; type: string; required?: boolean; minLength?: number;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream/50">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="mt-1 w-full bg-transparent border-b border-white/20 focus:border-ember outline-none py-2 text-cream"
      />
    </label>
  );
}