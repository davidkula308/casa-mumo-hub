import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { AppShell, Empty } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/manage")({
  head: () => ({
    meta: [
      { title: "Management — Casa Mumo Airbnbs" },
      { name: "description", content: "Bookings, rooms, housekeeping, maintenance, payments and reports for Casa Mumo Airbnbs." },
      { property: "og:title", content: "Management — Casa Mumo Airbnbs" },
      { property: "og:description", content: "Operations and business dashboard for Casa Mumo Airbnbs." },
    ],
  }),
  component: ManageLayout,
});

function ManageLayout() {
  const { isStaff } = useAuth();
  if (!isStaff) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20">
        <Empty
          title="Staff access only"
          body="This area is for Casa Mumo staff. If you should have access, ask the owner to assign you a role — or claim ownership if this is a fresh setup."
          action={
            <div className="flex justify-center gap-2">
              <Button asChild variant="glass"><Link to="/dashboard">My stays</Link></Button>
              <Button asChild><Link to="/setup">Set up as owner</Link></Button>
            </div>
          }
        />
      </div>
    );
  }
  return (
    <AppShell mode="staff">
      <Outlet />
    </AppShell>
  );
}
