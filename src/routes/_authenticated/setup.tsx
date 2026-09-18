import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/setup")({
  head: () => ({
    meta: [
      { title: "Owner setup — Casa Mumo Airbnbs" },
      { name: "description", content: "Claim the owner account for Casa Mumo Airbnbs." },
      { property: "og:title", content: "Owner setup — Casa Mumo Airbnbs" },
      { property: "og:description", content: "Claim the owner account for Casa Mumo Airbnbs." },
    ],
  }),
  component: Setup,
});

function Setup() {
  const { refresh, isOwner } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function claim() {
    setBusy(true);
    const { data, error } = await supabase.rpc("claim_owner");
    setBusy(false);
    if (error) return toast.error(error.message);
    if (!data) return toast.error("An owner already exists. Ask them to assign you a role.");
    await refresh();
    toast.success("You are now the owner of Casa Mumo Airbnbs.");
    navigate({ to: "/manage" });
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-20">
      <div className="glass-strong p-8 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-terra font-display text-2xl text-cream shadow-terra">M</div>
        <h1 className="mt-5 font-display text-3xl font-semibold">Owner setup</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The first account to claim ownership gets full access to the management dashboard. This only works once — after that, the owner assigns roles from Staff &amp; roles.
        </p>
        {isOwner ? (
          <Button className="mt-6" onClick={() => navigate({ to: "/manage" })}>Open management</Button>
        ) : (
          <Button className="mt-6" onClick={claim} disabled={busy}>{busy ? "Claiming…" : "Claim owner access"}</Button>
        )}
      </div>
    </div>
  );
}
