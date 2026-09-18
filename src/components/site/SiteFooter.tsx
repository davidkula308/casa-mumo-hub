import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-5 py-10 text-sm text-ink/50">
      <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
        <p className="font-display text-base font-semibold text-ink">Casa Mumo Airbnbs</p>
        <p className="text-center">
          Longi Valley, Nairobi · Pay with M-Pesa or card · +254 700 000 000
        </p>
        <div className="flex gap-4">
          <Link to="/faqs" className="hover:text-terra">FAQs</Link>
          <Link to="/contact" className="hover:text-terra">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-sans text-ink">
      <SiteHeaderLazy />
      <main className="mx-auto max-w-6xl px-5">{children}</main>
      <SiteFooter />
    </div>
  );
}

import { SiteHeader } from "./SiteHeader";
function SiteHeaderLazy() {
  return <SiteHeader />;
}
