import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Casa Mumo Airbnbs" },
      { name: "description", content: "Choose a new password for your Casa Mumo Airbnbs account." },
      { property: "og:title", content: "Set a new password — Casa Mumo Airbnbs" },
      { property: "og:description", content: "Choose a new password for your Casa Mumo Airbnbs account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) setReady(true);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => { if (s.session) setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
      <Logo />
      <form onSubmit={submit} className="glass-strong my-auto space-y-4 p-6">
        <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
        {!ready && <p className="text-sm text-muted-foreground">Open this page from the link in your reset email.</p>}
        <label className="block"><span className="label-caps mb-1">New password</span><input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" /></label>
        <Button type="submit" variant="hero" className="h-12 w-full" disabled={!ready || busy}>Update password</Button>
      </form>
    </div>
  );
}
