import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { roomTypesQuery } from "@/lib/queries";
import { roomImage } from "@/lib/room-images";
import { ksh } from "@/lib/format";

export const Route = createFileRoute("/rooms/")({
  head: () => ({
    meta: [
      { title: "Rooms — Casa Mumo Airbnbs" },
      { name: "description", content: "Garden Studio, Savannah Suite and Clay Loft — three warm rooms in Nairobi with breakfast included. See prices, amenities and availability." },
      { property: "og:title", content: "Rooms — Casa Mumo Airbnbs" },
      { property: "og:description", content: "Three warm rooms in Nairobi with breakfast included. See prices, amenities and availability." },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  const { data: rooms = [] } = useQuery(roomTypesQuery);
  return (
    <SiteLayout>
      <section className="py-6">
        <span className="inline-flex rounded-full bg-olive/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-olive ring-1 ring-olive/20">Our rooms</span>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Nine rooms, one pace.</h1>
        <p className="mt-3 max-w-[50ch] text-ink/70">Every room includes breakfast, fast Wi-Fi and a view worth waking up for.</p>
      </section>
      <section className="grid gap-6 pb-10">
        {rooms.map((r, i) => (
          <article key={r.id} className={`glass rise grid gap-5 p-4 md:grid-cols-12 md:items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <Link to="/rooms/$slug" params={{ slug: r.slug }} className="md:col-span-6">
              <img src={roomImage(r.image_key)} alt={r.name} width={1024} height={768} loading="lazy" className="aspect-[4/3] w-full rounded-[20px] object-cover" />
            </Link>
            <div className="px-2 md:col-span-6 md:px-4">
              <p className="label-caps">{r.view_label}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold">{r.name}</h2>
              <p className="mt-2 text-sm text-ink/70">{r.description}</p>
              <p className="mt-3 text-sm text-ink/60">Sleeps {r.max_guests} · {r.beds}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {r.amenities.slice(0, 5).map((a) => (
                  <li key={a} className="rounded-full bg-cream/80 px-3 py-1 text-xs font-medium ring-1 ring-border">{a}</li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-between gap-3">
                <p className="text-sm text-ink/50"><span className="font-display text-2xl font-semibold text-ink">{ksh(r.base_price)}</span> / night</p>
                <div className="flex gap-2">
                  <Button asChild variant="glass"><Link to="/rooms/$slug" params={{ slug: r.slug }}>Details</Link></Button>
                  <Button asChild><Link to="/book" search={{ room: r.slug }}>Reserve</Link></Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </SiteLayout>
  );
}
