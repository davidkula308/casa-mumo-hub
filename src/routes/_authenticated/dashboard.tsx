import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My stays — Casa Mumo Airbnbs" },
      { name: "description", content: "Your bookings, payments, messages and stay services at Casa Mumo Airbnbs." },
      { property: "og:title", content: "My stays — Casa Mumo Airbnbs" },
      { property: "og:description", content: "Your bookings, payments, messages and stay services at Casa Mumo Airbnbs." },
    ],
  }),
  component: () => (
    <AppShell mode="guest">
      <Outlet />
    </AppShell>
  ),
});
