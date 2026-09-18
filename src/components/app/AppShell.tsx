import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, CalendarDays, BedDouble, Sparkles, Wrench, CreditCard, Tag,
  BarChart3, Users, FileText, Star, MessageSquare, ConciergeBell, UserCircle,
  Bell, LogOut, ScrollText, Home, Menu, X, BookOpen,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { initials } from "@/lib/format";
import { roleMeta } from "@/lib/status";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number };

const guestNav: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/bookings", label: "My bookings", icon: BookOpen },
  { to: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { to: "/dashboard/services", label: "Stay services", icon: ConciergeBell },
  { to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { to: "/dashboard/reviews", label: "Reviews", icon: Star },
  { to: "/dashboard/loyalty", label: "Loyalty", icon: Sparkles },
  { to: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

function staffNav(roles: string[]): { section: string; items: NavItem[] }[] {
  const isManager = roles.includes("owner") || roles.includes("manager");
  const isReception = isManager || roles.includes("receptionist");
  const isHousekeeping = isManager || roles.includes("housekeeping");
  const sections: { section: string; items: NavItem[] }[] = [];
  const ops: NavItem[] = [{ to: "/manage", label: "Dashboard", icon: LayoutDashboard }];
  if (isReception) {
    ops.push(
      { to: "/manage/bookings", label: "Bookings", icon: BookOpen },
      { to: "/manage/calendar", label: "Calendar", icon: CalendarDays },
      { to: "/manage/payments", label: "Payments", icon: CreditCard },
      { to: "/manage/messages", label: "Guest messages", icon: MessageSquare },
      { to: "/manage/requests", label: "Service requests", icon: ConciergeBell },
    );
  }
  ops.push({ to: "/manage/rooms", label: "Rooms", icon: BedDouble });
  if (isHousekeeping) ops.push({ to: "/manage/housekeeping", label: "Housekeeping", icon: Sparkles });
  ops.push({ to: "/manage/maintenance", label: "Maintenance", icon: Wrench });
  sections.push({ section: "Operations", items: ops });
  if (isManager) {
    sections.push({
      section: "Business",
      items: [
        { to: "/manage/reports", label: "Reports", icon: BarChart3 },
        { to: "/manage/promotions", label: "Promotions", icon: Tag },
        { to: "/manage/reviews", label: "Reviews", icon: Star },
        { to: "/manage/staff", label: "Staff & roles", icon: Users },
        { to: "/manage/cms", label: "Website content", icon: FileText },
        { to: "/manage/audit", label: "Activity log", icon: ScrollText },
      ],
    });
  }
  return sections;
}

export function AppShell({ children, mode }: { children: ReactNode; mode: "guest" | "staff" }) {
  const { profile, roles, signOut, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: unread = 0 } = useQuery({
    queryKey: ["notifications-unread", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
      return count ?? 0;
    },
    refetchInterval: 30000,
  });

  const sections =
    mode === "guest" ? [{ section: "Your stay", items: guestNav }] : staffNav(roles);
  const primaryRole = roles.find((r) => r !== "guest") ?? "guest";

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/auth", replace: true });
  }

  const sidebar = (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground">
      <Link to="/" className="mb-8 flex items-center gap-3 px-2">
        <div className="grid size-10 place-items-center rounded-2xl bg-terra font-display text-lg font-semibold text-cream">
          M
        </div>
        <div className="leading-tight">
          <p className="font-display text-[17px] font-semibold text-sand">Casa Mumo</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-gold">Airbnbs</p>
        </div>
      </Link>
      <div className="flex-1 space-y-6 overflow-y-auto">
        {sections.map((s) => (
          <div key={s.section}>
            <p className="mb-2 px-2 text-[10px] uppercase tracking-[0.2em] text-sand/35">{s.section}</p>
            <nav className="space-y-1 text-sm">
              {s.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: item.to === "/manage" || item.to === "/dashboard" }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-sidebar-accent"
                  activeProps={{ className: "bg-terra/20 font-semibold text-sand ring-1 ring-terra/40" }}
                >
                  <item.icon className="size-4 shrink-0 opacity-80" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        ))}
        <div>
          <p className="mb-2 px-2 text-[10px] uppercase tracking-[0.2em] text-sand/35">More</p>
          <nav className="space-y-1 text-sm">
            <Link
              to={mode === "guest" ? "/dashboard/notifications" : "/manage/notifications"}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent"
              activeProps={{ className: "bg-terra/20 font-semibold text-sand ring-1 ring-terra/40" }}
            >
              <Bell className="size-4 opacity-80" />
              <span className="flex-1">Notifications</span>
              {unread > 0 && (
                <span className="rounded-full bg-terra px-2 py-0.5 text-[10px] font-bold text-cream">{unread}</span>
              )}
            </Link>
            {mode === "staff" && (
              <Link to="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent">
                <UserCircle className="size-4 opacity-80" /> Guest view
              </Link>
            )}
            <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-sidebar-accent">
              <Home className="size-4 opacity-80" /> Website
            </Link>
          </nav>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-sidebar-accent p-3 ring-1 ring-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-terra text-sm font-semibold text-cream">
            {initials(profile?.full_name)}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-sand">{profile?.full_name || "Guest"}</p>
            <span className="mt-0.5 inline-block rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
              {roleMeta[primaryRole]?.label ?? primaryRole}
            </span>
          </div>
          <button onClick={handleSignOut} className="rounded-lg p-2 hover:bg-sidebar-accent" title="Sign out">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="h-full">{sidebar}</div>
          <button className="flex-1 bg-ink/40" onClick={() => setOpen(false)} aria-label="Close menu" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3 px-5 py-4 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center rounded-full bg-glass ring-1 ring-border"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <p className="font-display text-lg font-semibold">Casa Mumo</p>
        </div>
        <main className="min-w-0 px-5 pb-16 pt-2 sm:px-8 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-7 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate font-display text-3xl font-semibold leading-none tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Chip({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide", className)}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, hint, dark }: { label: string; value: ReactNode; hint?: ReactNode; dark?: boolean }) {
  return (
    <div className={cn("rounded-3xl p-5 ring-1 ring-border", dark ? "bg-ink text-sand" : "glass")}>
      <p className={cn("text-xs uppercase tracking-wide", dark ? "text-sand/50" : "text-muted-foreground")}>{label}</p>
      <p className={cn("mt-2 font-display text-4xl font-semibold leading-none", dark && "text-gold")}>{value}</p>
      {hint && <div className={cn("mt-2 text-xs", dark ? "text-sand/60" : "text-muted-foreground")}>{hint}</div>}
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="glass p-10 text-center">
      <p className="font-display text-xl font-semibold">{title}</p>
      {body && <p className="mt-2 text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
