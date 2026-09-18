import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/SiteHeader";
import { roomImages } from "@/lib/room-images";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["signin", "signup", "forgot"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Casa Mumo Airbnbs" },
      { name: "description", content: "Sign in or create your Casa Mumo Airbnbs account to book stays, pay with M-Pesa and message the team." },
      { property: "og:title", content: "Sign in — Casa Mumo Airbnbs" },
      { property: "og:description", content: "Sign in or create your Casa Mumo Airbnbs account." },
    ],
  }),
  component: AuthPage,
});

function safeRedirect(r?: string) {
  return r && r.startsWith("/") && !r.startsWith("//") ? r : undefined;
}

function AuthPage() {
  const { redirect, mode: initialMode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading, isStaff } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const target = safeRedirect(redirect);
      if (target) navigate({ href: target, replace: true });
      else navigate({ to: isStaff ? "/manage" : "/dashboard", replace: true });
    }
  }, [user, loading, redirect, isStaff, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name, phone } },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent(true);
        toast.success("Password reset link sent.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message ?? "Google sign-in failed");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={roomImages['hero']} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-cream">
          <p className="font-display text-4xl font-semibold leading-tight">A slow morning, warm light, and a room that feels like yours.</p>
          <p className="mt-3 text-cream/70">Longi Valley · Nairobi</p>
        </div>
      </div>
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Logo />
        <div className="mx-auto my-auto w-full max-w-md py-10">
          <h1 className="font-display text-3xl font-semibold">
            {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to see your bookings and pay for your stay." : mode === "signup" ? "Book faster, earn loyalty points and chat with us." : "We'll email you a link to set a new password."}
          </p>

          {sent ? (
            <div className="glass mt-6 p-5 text-sm">
              We've sent an email to <strong>{email}</strong>. Follow the link to continue.
              <Button variant="link" className="mt-2 px-0" onClick={() => { setSent(false); setMode("signin"); }}>Back to sign in</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="glass-strong mt-6 space-y-3 p-5">
              {mode === "signup" && (
                <>
                  <label className="block"><span className="label-caps mb-1">Full name</span><input required value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="Wanjiru Kamau" /></label>
                  <label className="block"><span className="label-caps mb-1">Phone (M-Pesa)</span><input value={phone} onChange={(e) => setPhone(e.target.value)} className="field" placeholder="+254 7XX XXX XXX" /></label>
                </>
              )}
              <label className="block"><span className="label-caps mb-1">Email</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@example.com" /></label>
              {mode !== "forgot" && (
                <label className="block"><span className="label-caps mb-1">Password</span><input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" placeholder="••••••••" /></label>
              )}
              <Button type="submit" variant="hero" className="h-12 w-full" disabled={busy}>
                {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
              </Button>
              {mode !== "forgot" && (
                <>
                  <div className="flex items-center gap-3 py-1 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
                  <Button type="button" variant="glass" className="h-11 w-full" onClick={google}>
                    <svg className="size-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12v2.9h5.35c-.25 1.4-1.6 4.1-5.35 4.1a6.1 6.1 0 1 1 0-12.2c1.9 0 3.15.8 3.85 1.5l2.6-2.5A9.9 9.9 0 0 0 12 2a10 10 0 1 0 0 20c5.75 0 9.55-4.05 9.55-9.75 0-.65-.05-1.15-.2-1.15Z"/></svg>
                    Continue with Google
                  </Button>
                </>
              )}
            </form>
          )}

          <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
            {mode === "signin" ? (
              <>
                <button className="text-terra hover:underline" onClick={() => setMode("signup")}>Create an account</button>
                <button className="text-muted-foreground hover:underline" onClick={() => setMode("forgot")}>Forgot password?</button>
              </>
            ) : (
              <button className="text-terra hover:underline" onClick={() => setMode("signin")}>Already have an account? Sign in</button>
            )}
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground"><Link to="/" className="hover:text-terra">← Back to website</Link></p>
        </div>
      </div>
    </div>
  );
}
