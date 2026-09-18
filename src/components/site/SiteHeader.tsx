import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/format";

const nav = [
  { to: "/rooms", label: "Rooms" },
  { to: "/offers", label: "Offers" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-terra text-cream shadow-terra">
        <span className="font-display text-xl font-semibold">M</span>
      </div>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-lg font-semibold tracking-tight text-ink">
            Casa Mumo Airbnbs
          </p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-olive">Nairobi · Boutique</p>
        </div>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const { user, profile, isStaff, loading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 md:flex md:justify-between">
      <Logo />
      <nav className="hidden items-center gap-8 text-sm font-medium text-ink/70 md:flex">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="transition-colors hover:text-terra"
            activeProps={{ className: "text-terra" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        {!loading && user ? (
          <Button asChild variant="glass" className="hidden sm:inline-flex">
            <Link to={isStaff ? "/manage" : "/dashboard"}>
              <span className="grid size-6 place-items-center rounded-full bg-terra text-[10px] font-bold text-cream">
                {initials(profile?.full_name)}
              </span>
              {isStaff ? "Manage" : "My stays"}
            </Link>
          </Button>
        ) : (
          <Button asChild variant="glass" className="hidden sm:inline-flex">
            <Link to="/auth">Sign in</Link>
          </Button>
        )}
        <Button asChild>
          <Link to="/book">Book a stay</Link>
        </Button>
        <button
          className="grid size-10 place-items-center rounded-full bg-glass ring-1 ring-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>
      {open && (
        <div className="glass-strong col-span-2 flex flex-col gap-1 p-3 md:hidden">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm font-medium hover:bg-sand"
            >
              {n.label}
            </Link>
          ))}
          <Link
            to={user ? (isStaff ? "/manage" : "/dashboard") : "/auth"}
            onClick={() => setOpen(false)}
            className="rounded-2xl px-4 py-3 text-sm font-medium hover:bg-sand"
          >
            {user ? (isStaff ? "Manage" : "My stays") : "Sign in"}
          </Link>
        </div>
      )}
    </header>
  );
}
