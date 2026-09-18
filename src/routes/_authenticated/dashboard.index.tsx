import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatCard, Chip, Empty } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { myBookingsQuery, notificationsQuery } from "@/lib/queries";
import { bookingStatusMeta } from "@/lib/status";
import { ksh, fmtRange, fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Overview,
});

function Overview() {
  const { user, profile } = useAuth();
  const { data: bookings = [] } = useQuery(myBookingsQuery(user?.id));
  const { data: notes = [] } = useQuery(notificationsQuery(user?.id));

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = bookings.filter((b) => b.check_out >= today && !["cancelled", "no_show"].includes(b.status));
  const next = upcoming[upcoming.length - 1];
  const spent = bookings.reduce((s, b) => s + Number(b.total_amount), 0);

  return (
    <>
      <PageHeader
        title={`Karibu, ${(profile?.full_name ?? "guest").split(" ")[0]}`}
        subtitle="Your stays, payments and requests in one place."
        actions={<Button asChild variant="hero"><Link to="/book">Book a stay</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Upcoming stays" value={upcoming.length} />
        <StatCard label="Loyalty points" value={profile?.loyalty_points ?? 0} hint="1 point per KSh 100 spent" />
        <StatCard label="Lifetime spend" value={ksh(spent)} dark />
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="glass p-5">
          <h2 className="font-display text-xl font-semibold">Your next stay</h2>
          {next ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg">{next.room_types?.name ?? "Room"}</p>
                <Chip className={bookingStatusMeta[next.status].chip}>{bookingStatusMeta[next.status].label}</Chip>
              </div>
              <p className="text-sm text-muted-foreground">{fmtRange(next.check_in, next.check_out)} · {next.guests} guests</p>
              <p className="text-sm">Reference <span className="font-mono font-semibold">{next.reference}</span></p>
              <p className="font-display text-2xl font-semibold">{ksh(next.total_amount)}</p>
              <Button asChild variant="glass" className="mt-2"><Link to="/dashboard/bookings">Manage booking</Link></Button>
            </div>
          ) : (
            <Empty title="No upcoming stay" body="When you book, your dates and check-in details appear here." action={<Button asChild><Link to="/rooms">Browse rooms</Link></Button>} />
          )}
        </div>

        <div className="glass p-5">
          <h2 className="font-display text-xl font-semibold">Latest updates</h2>
          <ul className="mt-3 space-y-3">
            {notes.slice(0, 5).map((n) => (
              <li key={n.id} className="border-b border-border pb-3 last:border-0">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{fmtDateTime(n.created_at)}</p>
              </li>
            ))}
            {notes.length === 0 && <p className="text-sm text-muted-foreground">Nothing yet.</p>}
          </ul>
        </div>
      </section>
    </>
  );
}
