import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { promotionsQuery } from "@/lib/queries";
import { ksh, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & promo codes — Casa Mumo Airbnbs" },
      { name: "description", content: "Current seasonal offers, long-stay discounts and weekend promo codes for Casa Mumo Airbnbs in Nairobi." },
      { property: "og:title", content: "Offers & promo codes — Casa Mumo Airbnbs" },
      { property: "og:description", content: "Seasonal offers, long-stay discounts and weekend promo codes for Casa Mumo Airbnbs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Offers,
});

function Offers() {
  const { data: promos = [] } = useQuery(promotionsQuery);
  const live = promos.filter((p) => p.active);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-5 py-12">
        <p className="label-caps text-terra-deep">Save on your stay</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Current offers</h1>
        <p className="mt-2 text-sm text-muted-foreground">Apply a code at the last step of booking. One code per stay.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {live.map((p) => (
            <article key={p.id} className="glass flex flex-col p-5">
              <span className="w-fit rounded-full bg-terra/15 px-3 py-1 font-mono text-xs font-bold tracking-wider text-terra-deep">{p.code}</span>
              <h2 className="mt-3 font-display text-2xl font-semibold">{p.name}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-3 text-sm font-semibold text-olive">
                {p.discount_type === "percent" ? `${Number(p.discount_value)}% off` : `${ksh(p.discount_value)} off`}
                {p.min_nights > 1 ? ` · ${p.min_nights}+ nights` : ""}
                {p.weekend_only ? " · weekends" : ""}
              </p>
              {(p.valid_from || p.valid_to) && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Valid {p.valid_from ? fmtDate(p.valid_from, "d MMM") : "now"} – {p.valid_to ? fmtDate(p.valid_to, "d MMM yyyy") : "further notice"}
                </p>
              )}
              <Button asChild className="mt-4 w-fit"><Link to="/book" search={{ promo: p.code }}>Use this offer</Link></Button>
            </article>
          ))}
          {live.length === 0 && (
            <div className="glass p-8 text-center text-sm text-muted-foreground sm:col-span-2">
              No offers are running right now — check back soon.
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
