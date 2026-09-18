import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Clock, Users, BedDouble } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { roomTypeBySlugQuery, reviewsQuery, propertyQuery } from "@/lib/queries";
import { galleryFor } from "@/lib/room-images";
import { ksh, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/rooms/$slug")({
  head: ({ params }) => {
    const name = params.slug.split("-").map((s) => s[0]?.toUpperCase() + s.slice(1)).join(" ");
    return {
      meta: [
        { title: `${name} — Casa Mumo Airbnbs` },
        { name: "description", content: `Photos, amenities, house rules and reviews for the ${name} at Casa Mumo Airbnbs, Nairobi.` },
        { property: "og:title", content: `${name} — Casa Mumo Airbnbs` },
        { property: "og:description", content: `Photos, amenities, house rules and reviews for the ${name} at Casa Mumo Airbnbs, Nairobi.` },
      ],
    };
  },
  component: RoomDetail,
});

function Stars({ n }: { n: number }) {
  return <span className="text-gold">{"★".repeat(Math.round(n))}<span className="text-ink/20">{"★".repeat(5 - Math.round(n))}</span></span>;
}

function RoomDetail() {
  const { slug } = Route.useParams();
  const { data: room, isLoading } = useQuery(roomTypeBySlugQuery(slug));
  const { data: property } = useQuery(propertyQuery);
  const { data: reviews = [] } = useQuery(reviewsQuery(room?.id));
  const [active, setActive] = useState(0);

  if (isLoading) return <SiteLayout><div className="glass my-10 p-10 text-center text-muted-foreground">Loading room…</div></SiteLayout>;
  if (!room) throw notFound();

  const gallery = galleryFor(room.image_key);
  const avg = (k: "overall" | "cleanliness" | "service" | "location" | "comfort") =>
    reviews.length ? reviews.reduce((s, r) => s + r[k], 0) / reviews.length : 0;

  return (
    <SiteLayout>
      <section className="grid gap-8 py-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <img src={gallery[active]} alt={room.name} width={1024} height={768} className="aspect-[4/3] w-full rounded-[28px] object-cover ring-1 ring-border" />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {gallery.map((g, i) => (
              <button key={i} onClick={() => setActive(i)} className={`overflow-hidden rounded-2xl ring-2 transition ${active === i ? "ring-terra" : "ring-transparent"}`}>
                <img src={g} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <p className="label-caps">{room.view_label}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{room.name}</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink/60"><Stars n={avg("overall") || 5} /> {reviews.length ? `${avg("overall").toFixed(1)} · ${reviews.length} reviews` : "New listing"}</p>
          <p className="mt-4 text-ink/70">{room.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="glass-sm flex items-center gap-2 p-3"><Users className="size-4 text-olive" /> Sleeps {room.max_guests}</div>
            <div className="glass-sm flex items-center gap-2 p-3"><BedDouble className="size-4 text-olive" /> {room.beds}</div>
            <div className="glass-sm flex items-center gap-2 p-3"><Clock className="size-4 text-olive" /> In {property?.check_in_time} · Out {property?.check_out_time}</div>
            <div className="glass-sm flex items-center gap-2 p-3"><MapPin className="size-4 text-olive" /> {property?.city}</div>
          </div>
          <div className="glass-strong mt-6 p-5">
            <p className="text-sm text-ink/50"><span className="font-display text-3xl font-semibold text-ink">{ksh(room.base_price)}</span> / night</p>
            <p className="mt-1 text-xs text-ink/50">Breakfast included · Free cancellation up to 48h</p>
            <Button asChild variant="hero" className="mt-4 h-12 w-full">
              <Link to="/book" search={{ room: room.slug }}>Check availability & book</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 pb-10 md:grid-cols-3">
        <div className="glass p-6">
          <h2 className="font-display text-xl font-semibold">Amenities</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {room.amenities.map((a) => <li key={a} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-olive" />{a}</li>)}
          </ul>
        </div>
        <div className="glass p-6">
          <h2 className="font-display text-xl font-semibold">House rules</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {room.house_rules.map((a) => <li key={a} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-terra" />{a}</li>)}
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-terra" />Check-in from {property?.check_in_time}, check-out by {property?.check_out_time}</li>
          </ul>
        </div>
        <div className="glass overflow-hidden p-0">
          <iframe
            title="Map"
            className="h-full min-h-56 w-full"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(property?.longitude ?? 36.7) - 0.02}%2C${Number(property?.latitude ?? -1.32) - 0.02}%2C${Number(property?.longitude ?? 36.7) + 0.02}%2C${Number(property?.latitude ?? -1.32) + 0.02}&layer=mapnik&marker=${property?.latitude ?? -1.32}%2C${property?.longitude ?? 36.7}`}
          />
        </div>
      </section>

      <section className="pb-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold">Reviews</h2>
          {reviews.length > 0 && <p className="font-display text-2xl">⭐ {avg("overall").toFixed(1)} / 5</p>}
        </div>
        {reviews.length > 0 && (
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["cleanliness", "location", "service", "comfort"] as const).map((k) => (
              <div key={k} className="glass-sm p-3 text-sm"><p className="capitalize text-ink/60">{k}</p><p className="font-display text-xl font-semibold">{avg(k).toFixed(1)}</p></div>
            ))}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.length === 0 && <p className="text-sm text-ink/60">No reviews yet — be the first to stay.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="glass p-5">
              <div className="flex items-center justify-between"><p className="font-semibold">{r.guest_name}</p><Stars n={r.overall} /></div>
              <p className="mt-1 text-xs text-ink/50">{fmtDate(r.created_at, "d MMM yyyy")}</p>
              <p className="mt-3 text-sm text-ink/80">{r.comment}</p>
              {r.response && <div className="mt-3 rounded-2xl bg-sand/70 p-3 text-sm"><p className="text-xs font-semibold uppercase tracking-wide text-olive">Casa Mumo replied</p><p className="mt-1">{r.response}</p></div>}
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
