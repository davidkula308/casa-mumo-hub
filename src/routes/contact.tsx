import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { propertyQuery } from "@/lib/queries";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Casa Mumo Airbnbs — Nairobi" },
      { name: "description", content: "Call, email or message Casa Mumo Airbnbs in Nairobi about availability, group stays and airport pickups." },
      { property: "og:title", content: "Contact Casa Mumo Airbnbs" },
      { property: "og:description", content: "Reach the Casa Mumo Airbnbs team about availability, group stays and airport pickups." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { data: property } = useQuery(propertyQuery);
  const [sent, setSent] = useState(false);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Talk to Casa Mumo</h1>
        <p className="mt-2 text-sm text-muted-foreground">We answer messages daily between 7am and 9pm East Africa Time.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <form
            className="glass space-y-3 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              toast.success("Thanks — we'll get back to you shortly.");
            }}
          >
            <label className="block"><span className="label-caps mb-1">Your name</span><input required className="field" /></label>
            <label className="block"><span className="label-caps mb-1">Email</span><input required type="email" className="field" /></label>
            <label className="block"><span className="label-caps mb-1">Message</span><textarea required rows={5} className="field" /></label>
            <Button type="submit" variant="hero" className="h-12 w-full">{sent ? "Message sent" : "Send message"}</Button>
          </form>

          <div className="space-y-4">
            <div className="glass p-5">
              <h2 className="font-display text-xl font-semibold">Visit us</h2>
              <p className="mt-2 text-sm text-muted-foreground">{property?.address ?? "Nairobi, Kenya"}</p>
              <p className="text-sm text-muted-foreground">{property?.city ?? "Nairobi"}</p>
              <p className="mt-3 text-sm">Phone: <span className="font-medium">{property?.phone ?? "+254 700 000 000"}</span></p>
              <p className="text-sm">Email: <span className="font-medium">{property?.email ?? "stay@casamumo.co.ke"}</span></p>
              <p className="mt-3 text-sm text-muted-foreground">
                Check in from {property?.check_in_time ?? "14:00"} · check out by {property?.check_out_time ?? "10:00"}
              </p>
            </div>
            <iframe
              title="Casa Mumo location"
              className="h-64 w-full rounded-3xl ring-1 ring-border"
              src="https://www.openstreetmap.org/export/embed.html?bbox=36.75%2C-1.33%2C36.88%2C-1.24&layer=mapnik"
            />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
