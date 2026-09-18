import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { addDays } from "date-fns";
import { SiteLayout } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { roomTypesQuery, promotionsQuery, cmsQuery, myBookingsQuery, notificationsQuery } from "@/lib/queries";
import { roomImages, roomImage } from "@/lib/room-images";
import { ksh, isoDate, fmtRange, fmtDate } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { bookingStatusMeta } from "@/lib/status";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Casa Mumo Airbnbs — Boutique stays in Nairobi" },
      { name: "description", content: "A small guesthouse above the Nairobi ridge. Book Garden Studios, Savannah Suites and the Clay Loft by the night — pay with M-Pesa or card." },
      { property: "og:title", content: "Casa Mumo Airbnbs — Boutique stays in Nairobi" },
      { property: "og:description", content: "Warm rooms, slow mornings and breakfast that lingers. Book your Nairobi stay with M-Pesa or card." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: rooms = [] } = useQuery(roomTypesQuery);
  const { data: promos = [] } = useQuery(promotionsQuery);
  const { data: cms } = useQuery(cmsQuery);
  const { data: myBookings = [] } = useQuery(myBookingsQuery(user?.id));
  const { data: notes = [] } = useQuery(notificationsQuery(user?.id));
  const home = (cms?.home ?? {}) as { eyebrow?: string; headline?: string; intro?: string };
  const promo = promos.find((p) => p.active);

  const [checkIn, setCheckIn] = useState(isoDate(addDays(new Date(), 7)));
  const [checkOut, setCheckOut] = useState(isoDate(addDays(new Date(), 9)));
  const [guests, setGuests] = useState(2);
  const [roomType, setRoomType] = useState("");

  const upcoming = myBookings.find((b) => ["pending", "confirmed"].includes(b.status));
  const current = myBookings.find((b) => b.status === "checked_in");

  return (
    <SiteLayout>
      {/* split hero */}
      <section className="grid gap-8 py-4 lg:grid-cols-12 lg:items-center">
        <div className="rise lg:col-span-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-olive/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-olive ring-1 ring-olive/20">
            {home.eyebrow ?? "Weekend escape · Longi Valley"}
          </span>
          <h1 className="mt-5 max-w-[20ch] font-display text-[2.7rem] font-semibold leading-[1.02] tracking-tight text-balance sm:text-5xl">
            {home.headline ?? "A slow morning, warm light, and a room that feels like yours."}
          </h1>
          <p className="mt-4 max-w-[46ch] text-base text-ink/70 text-pretty sm:text-lg">
            {home.intro ?? "Casa Mumo is a small guesthouse above the Nairobi ridge — hand-thrown ceramics, eucalyptus air, and breakfast that lingers. Book by the night, pay with M-Pesa or card."}
          </p>

          <form
            className="glass-strong mt-7 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/book", search: { checkIn, checkOut, guests, room: roomType || undefined } });
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="label-caps mb-1">Check-in</span>
                <input type="date" value={checkIn} min={isoDate(new Date())} onChange={(e) => setCheckIn(e.target.value)} className="field" />
              </label>
              <label className="block">
                <span className="label-caps mb-1">Check-out</span>
                <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="field" />
              </label>
              <label className="block">
                <span className="label-caps mb-1">Guests</span>
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="field">
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label-caps mb-1">Room type</span>
                <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="field">
                  <option value="">Any room</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.slug}>{r.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <Button type="submit" variant="hero" className="mt-3 h-12 w-full">
              Search availability
            </Button>
          </form>
        </div>

        <div className="rise-1 lg:col-span-6">
          <div className="grid grid-cols-2 gap-4">
            <img src={roomImages.hero} alt="Sunlit terracotta bedroom at Casa Mumo" width={1280} height={800} className="col-span-2 aspect-[16/10] rounded-[28px] object-cover ring-1 ring-border" />
            <img src={roomImages.ceramics} alt="Hand-thrown ceramics on an oak table" width={768} height={768} loading="lazy" className="aspect-square rounded-[24px] object-cover ring-1 ring-border" />
            <img src={roomImages.eucalyptus} alt="Eucalyptus and olive branches in a vase" width={768} height={768} loading="lazy" className="aspect-square rounded-[24px] object-cover ring-1 ring-border" />
          </div>
        </div>
      </section>

      {/* offer strip */}
      {promo && (
        <section className="rise my-8 overflow-hidden rounded-[28px] bg-gradient-terra p-6 text-cream sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/70">Special offer</p>
              <p className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{promo.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cream/15 px-4 py-3 font-mono text-lg font-semibold tracking-widest ring-1 ring-cream/30 backdrop-blur-sm">
                {promo.code}
              </div>
              <Button asChild variant="cream" size="lg">
                <Link to="/book" search={{ promo: promo.code }}>Redeem code</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* featured rooms */}
      <section className="rise py-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Rooms to fall into</h2>
            <p className="mt-1 text-sm text-ink/60">Three spaces, each with its own light and character.</p>
          </div>
          <Link to="/rooms" className="hidden text-sm font-semibold text-terra sm:block">View all rooms →</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {rooms.map((r) => (
            <article key={r.id} className="glass hover-lift group p-3">
              <Link to="/rooms/$slug" params={{ slug: r.slug }}>
                <img src={roomImage(r.image_key)} alt={r.name} width={1024} height={768} loading="lazy" className="aspect-[4/3] w-full rounded-[20px] object-cover" />
              </Link>
              <div className="px-2 pb-1 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">{r.name}</h3>
                  <span className="flex items-center gap-1 rounded-full bg-cream/80 px-2 py-0.5 text-xs font-semibold ring-1 ring-border">
                    <span className="text-gold">★</span>4.9
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink/60">{r.max_guests} guests · {r.beds} · {r.view_label}</p>
                <div className="mt-4 flex items-end justify-between">
                  <p className="text-sm text-ink/50">
                    <span className="font-display text-xl font-semibold text-ink">{ksh(r.base_price)}</span> / night
                  </p>
                  <Button asChild variant="olive" size="sm">
                    <Link to="/book" search={{ room: r.slug }}>Reserve</Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* guest dashboard glance */}
      <section className="rise py-8">
        <div className="mb-6">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Your stay, at a glance</h2>
          <p className="mt-1 text-sm text-ink/60">
            {user ? "Bookings, balance and messages in one place." : "Sign in to see your bookings, balance and messages in one place."}
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="glass p-5">
            <div className="flex items-center justify-between">
              <p className="label-caps">Upcoming booking</p>
              {upcoming && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${bookingStatusMeta[upcoming.status].chip}`}>{bookingStatusMeta[upcoming.status].label}</span>}
            </div>
            {upcoming ? (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <img src={roomImage(upcoming.room_types?.image_key)} alt="" className="size-16 shrink-0 rounded-2xl object-cover" />
                  <div>
                    <p className="font-display text-base font-semibold">{upcoming.room_types?.name}</p>
                    <p className="text-sm text-ink/60">{fmtRange(upcoming.check_in, upcoming.check_out)} · {upcoming.guests} guests</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-cream/70 px-3 py-2 text-sm ring-1 ring-border">
                  <span className="text-ink/60">Ref</span>
                  <span className="font-mono font-semibold">{upcoming.reference}</span>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-ink/60">{user ? "No upcoming stays yet." : "Sign in to see your next stay."}</p>
            )}
          </div>
          <div className="glass p-5">
            <p className="label-caps">Current stay</p>
            {current ? (
              <>
                <p className="mt-3 font-display text-base font-semibold">{current.room_types?.name} · Room {current.rooms?.number}</p>
                <p className="text-sm text-ink/60">Checked in {fmtDate(current.checked_in_at, "HH:mm")} · Check out {fmtDate(current.check_out)} 10:00</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-ink/60">Not currently checked in.</p>
            )}
            <div className="mt-4 rounded-2xl bg-terra/10 p-3 ring-1 ring-terra/20">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-terra-deep">Pay with</p>
              <div className="mt-3 flex gap-2">
                <Button asChild variant="olive-solid" size="sm" className="flex-1 rounded-xl">
                  <Link to="/dashboard/payments">M-Pesa</Link>
                </Button>
                <Button asChild variant="cream" size="sm" className="flex-1 rounded-xl">
                  <Link to="/dashboard/payments">Card</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="glass p-5">
            <div className="flex items-center justify-between">
              <p className="label-caps">Notifications</p>
              <span className="size-2 rounded-full bg-gold" />
            </div>
            <ul className="mt-3 space-y-3">
              {(notes.length ? notes.slice(0, 3) : [
                { id: "a", title: "Breakfast served 7:00–10:00", created_at: "", kind: "info" },
                { id: "b", title: "Free cancellation up to 48h before arrival", created_at: "", kind: "info" },
                { id: "c", title: promo ? `${promo.code} · ${promo.description}` : "Ask us about long-stay rates", created_at: "", kind: "promo" },
              ]).map((n, i) => (
                <li key={n.id} className="flex gap-3">
                  <span className={`mt-1 size-2 shrink-0 rounded-full ${["bg-terra", "bg-olive", "bg-gold"][i % 3]}`} />
                  <div>
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.created_at && <p className="text-xs text-ink/50">{fmtDate(n.created_at, "d MMM · HH:mm")}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
