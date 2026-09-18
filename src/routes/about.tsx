import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { propertyQuery } from "@/lib/queries";
import hero from "@/assets/hero-room.jpg";
import ceramics from "@/assets/ceramics.jpg";
import eucalyptus from "@/assets/eucalyptus.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Casa Mumo Airbnbs — Nairobi boutique stays" },
      { name: "description", content: "Casa Mumo Airbnbs is a family-run boutique guest house in Nairobi with hand-finished rooms, a garden courtyard and warm local hosting." },
      { property: "og:title", content: "About Casa Mumo Airbnbs" },
      { property: "og:description", content: "A family-run boutique guest house in Nairobi with hand-finished rooms and warm local hosting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  const { data: property } = useQuery(propertyQuery);
  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-5 py-12">
        <p className="label-caps text-terra-deep">Our story</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {property?.tagline ?? "Warm, hand-made hospitality in Nairobi"}
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          {property?.description ??
            "Casa Mumo Airbnbs began as one family home opened to travellers. Today it is a small collection of light-filled rooms built around a garden courtyard, run by a team that lives nearby and knows the city well."}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <img src={hero} alt="A Casa Mumo bedroom" className="h-56 w-full rounded-3xl object-cover" />
          <img src={ceramics} alt="Hand-made ceramics in the guest kitchen" className="h-56 w-full rounded-3xl object-cover" />
          <img src={eucalyptus} alt="Eucalyptus in the garden courtyard" className="h-56 w-full rounded-3xl object-cover" />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { t: "Hosted by people, not apps", b: "A real host greets every arrival and stays reachable through your whole stay." },
            { t: "Made locally", b: "Ceramics, textiles and furniture come from Kenyan makers we work with directly." },
            { t: "Care in the details", b: "Rooms are inspected after every clean, so what you see is what you get." },
          ].map((c) => (
            <div key={c.t} className="glass p-5">
              <h2 className="font-display text-lg font-semibold">{c.t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex gap-3">
          <Button asChild variant="hero"><Link to="/rooms">See the rooms</Link></Button>
          <Button asChild variant="glass"><Link to="/contact">Contact us</Link></Button>
        </div>
      </div>
    </SiteLayout>
  );
}
