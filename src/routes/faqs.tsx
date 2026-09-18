import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — Casa Mumo Airbnbs" },
      { name: "description", content: "Check-in times, payment options, cancellations, parking and house rules at Casa Mumo Airbnbs in Nairobi." },
      { property: "og:title", content: "FAQs — Casa Mumo Airbnbs" },
      { property: "og:description", content: "Answers about check-in, payments, cancellations and house rules at Casa Mumo Airbnbs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Faqs,
});

const faqs = [
  { q: "What time can I check in?", a: "Check-in is from 2pm and check-out is by 10am. Early arrival or late departure is usually possible — just ask when you book." },
  { q: "How do I pay?", a: "You can pay by M-Pesa, card, bank transfer or cash on arrival. Your booking is held as pending until we confirm it." },
  { q: "Can I cancel?", a: "Free cancellation up to 48 hours before check-in. After that the first night is charged." },
  { q: "Is parking available?", a: "Yes, secure off-street parking for one car per room, at no extra cost." },
  { q: "Do you allow extra guests?", a: "Each room lists a maximum number of guests. Extra guests can sometimes be added for a small fee — message us first." },
  { q: "Is breakfast included?", a: "Breakfast is an add-on service you can select while booking or any time during your stay." },
  { q: "Do you offer airport pickup?", a: "Yes, airport transfers are available as an add-on. Share your flight details after booking." },
];

function Faqs() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Good to know</h1>
        <p className="mt-2 text-sm text-muted-foreground">The questions guests ask us most often.</p>
        <div className="mt-8 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="glass p-5">
              <summary className="cursor-pointer font-display text-lg font-semibold">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 flex gap-3">
          <Button asChild variant="hero"><Link to="/book">Book a stay</Link></Button>
          <Button asChild variant="glass"><Link to="/contact">Still have a question?</Link></Button>
        </div>
      </div>
    </SiteLayout>
  );
}
