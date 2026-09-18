import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { ksh, isoDate, nightsBetween } from "@/lib/format";
import { calcPrice, promotionsQuery, roomTypesQuery, servicesQuery, PROPERTY_ID } from "@/lib/queries";
import { roomImage } from "@/lib/room-images";

const searchSchema = z.object({
  room: z.string().optional(),
  promo: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.coerce.number().int().min(1).max(12).optional(),
});

export const Route = createFileRoute("/book")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Book your stay — Casa Mumo Airbnbs" },
      { name: "description", content: "Check availability, pick your room and reserve your stay at Casa Mumo Airbnbs in Nairobi." },
      { property: "og:title", content: "Book your stay — Casa Mumo Airbnbs" },
      { property: "og:description", content: "Check availability, pick your room and reserve your stay at Casa Mumo Airbnbs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

function ref() {
  return "CM" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function BookPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const { data: rooms = [] } = useQuery(roomTypesQuery);
  const { data: services = [] } = useQuery(servicesQuery);
  const { data: promos = [] } = useQuery(promotionsQuery);

  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  const [checkIn, setCheckIn] = useState(search.checkIn ?? isoDate(today));
  const [checkOut, setCheckOut] = useState(search.checkOut ?? isoDate(tomorrow));
  const [guests, setGuests] = useState(search.guests ?? 2);
  const [slug, setSlug] = useState(search.room ?? "");
  const [promoCode, setPromoCode] = useState(search.promo ?? "");
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState(profile?.full_name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const room = rooms.find((r) => r.slug === slug) ?? rooms[0];
  const nights = nightsBetween(checkIn, checkOut);
  const promo = promos.find((p) => p.code.toUpperCase() === promoCode.trim().toUpperCase()) ?? null;

  const servicesTotal = useMemo(
    () => services.filter((s) => picked.includes(s.id)).reduce((sum, s) => sum + Number(s.price), 0),
    [services, picked],
  );

  const price = room
    ? calcPrice({ basePrice: Number(room.base_price), nights, checkIn, promo, servicesTotal })
    : { roomTotal: 0, discount: 0, services: 0, total: 0 };

  const { data: available } = useQuery({
    queryKey: ["availability", room?.id, checkIn, checkOut],
    enabled: !!room && nights > 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("available_room_count", {
        _room_type_id: room!.id,
        _check_in: checkIn,
        _check_out: checkOut,
      });
      if (error) throw error;
      return data as number;
    },
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/book" } });
      return;
    }
    if (!room || nights < 1) {
      toast.error("Choose a room and at least one night.");
      return;
    }
    setBusy(true);
    const reference = ref();
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        reference,
        property_id: PROPERTY_ID,
        room_type_id: room.id,
        guest_id: user.id,
        guest_name: name || profile?.full_name || "Guest",
        guest_email: email || user.email || null,
        guest_phone: phone || null,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        room_total: price.roomTotal,
        discount_total: price.discount,
        services_total: price.services,
        total_amount: price.total,
        promo_code: promo?.code ?? null,
        special_requests: notes || null,
      })
      .select("id")
      .single();

    if (error || !booking) {
      setBusy(false);
      toast.error(error?.message ?? "Could not create the booking.");
      return;
    }

    const chosen = services.filter((s) => picked.includes(s.id));
    if (chosen.length) {
      await supabase.from("service_requests").insert(
        chosen.map((s) => ({
          booking_id: booking.id,
          guest_id: user.id,
          service_id: s.id,
          title: s.name,
          price: Number(s.price),
          quantity: 1,
        })),
      );
    }
    setBusy(false);
    toast.success(`Booking ${reference} received — we'll confirm shortly.`);
    navigate({ to: "/dashboard/bookings" });
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Book your stay</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pick your dates, room and extras. You only pay after we confirm.</p>

        <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="glass p-5">
              <h2 className="font-display text-xl font-semibold">Dates &amp; guests</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="block"><span className="label-caps mb-1">Check in</span>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="field" /></label>
                <label className="block"><span className="label-caps mb-1">Check out</span>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="field" /></label>
                <label className="block"><span className="label-caps mb-1">Guests</span>
                  <input type="number" min={1} max={12} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="field" /></label>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : "Choose a check-out after check-in"}
                {available !== undefined && nights > 0 && (
                  <span className={available > 0 ? " text-olive" : " text-destructive"}>
                    {" "}· {available > 0 ? `${available} room${available > 1 ? "s" : ""} available` : "No rooms left for these dates"}
                  </span>
                )}
              </p>
            </section>

            <section className="glass p-5">
              <h2 className="font-display text-xl font-semibold">Choose a room</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {rooms.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setSlug(r.slug)}
                    className={`overflow-hidden rounded-2xl text-left ring-1 transition ${room?.id === r.id ? "ring-2 ring-terra" : "ring-border hover:ring-terra/50"}`}
                  >
                    <img src={roomImage(r.image_key)} alt={r.name} className="h-28 w-full object-cover" />
                    <div className="p-3">
                      <p className="font-display text-lg font-semibold">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.beds} · up to {r.max_guests} guests</p>
                      <p className="mt-1 text-sm font-semibold text-terra-deep">{ksh(r.base_price)} / night</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="glass p-5">
              <h2 className="font-display text-xl font-semibold">Add-on services</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {services.map((s) => (
                  <label key={s.id} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 ring-1 ring-border">
                    <input
                      type="checkbox"
                      checked={picked.includes(s.id)}
                      onChange={(e) => setPicked((p) => (e.target.checked ? [...p, s.id] : p.filter((x) => x !== s.id)))}
                    />
                    <span className="flex-1 text-sm">{s.name}</span>
                    <span className="text-sm font-semibold">{ksh(s.price)}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="glass p-5">
              <h2 className="font-display text-xl font-semibold">Your details</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="label-caps mb-1">Full name</span>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="field" /></label>
                <label className="block"><span className="label-caps mb-1">Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" /></label>
                <label className="block"><span className="label-caps mb-1">Phone</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="field" placeholder="07xx xxx xxx" /></label>
                <label className="block"><span className="label-caps mb-1">Promo code</span>
                  <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="field" placeholder="STAY3" /></label>
              </div>
              <label className="mt-3 block"><span className="label-caps mb-1">Special requests</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="field" /></label>
            </section>
          </div>

          <aside className="glass-strong h-fit space-y-3 p-5 lg:sticky lg:top-6">
            <h2 className="font-display text-xl font-semibold">Summary</h2>
            <Row label={room ? room.name : "Room"} value={`${nights} × ${ksh(room?.base_price ?? 0)}`} />
            <Row label="Room total" value={ksh(price.roomTotal)} />
            {price.discount > 0 && <Row label={`Discount ${promo?.code ?? ""}`} value={`- ${ksh(price.discount)}`} />}
            {price.services > 0 && <Row label="Services" value={ksh(price.services)} />}
            <div className="flex justify-between border-t border-border pt-3 font-display text-xl font-semibold">
              <span>Total</span><span>{ksh(price.total)}</span>
            </div>
            {promoCode && !promo && <p className="text-xs text-destructive">Promo code not recognised.</p>}
            <Button type="submit" variant="hero" className="h-12 w-full" disabled={busy || nights < 1}>
              {user ? (busy ? "Reserving…" : "Confirm reservation") : "Sign in to reserve"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Questions? <Link to="/contact" className="underline">Talk to us</Link>
            </p>
          </aside>
        </form>
      </div>
    </SiteLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
