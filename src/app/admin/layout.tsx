import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  ["Overview", "/admin"],
  ["Resistance", "/admin/resistance"],
  ["Objections", "/admin/objections"],
  ["Interventions", "/admin/interventions"],
  ["Escalations", "/admin/escalations"],
  ["Data", "/admin/data"],
  ["AI Quality", "/admin/ai"],
  ["Users", "/admin/users"],
  ["Audit", "/admin/audit"],
  ["Health", "/admin/health"],
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <div className="mx-auto grid max-w-[1200px] gap-4 p-4 md:grid-cols-[200px_1fr]">
        <aside className="rounded-[20px] bg-warm p-3">
          <p className="px-2 font-display text-2xl text-primary">Nourish</p>
          <nav className="mt-3 grid gap-1">
            {links.map(([label, href]) => (
              <Link key={href} href={href ?? "/admin"} className="min-h-10 rounded-xl px-2 py-2 text-sm hover:bg-surface">{label}</Link>
            ))}
          </nav>
        </aside>
        <div>
          <p className="mb-3 rounded-xl bg-accent-soft px-3 py-2 text-sm text-warning">Synthetic analytics ribbon · demo data, not official statistics.</p>
          {children}
          <p className="mt-6 text-xs text-muted">Prototype for Smart India Hackathon 2026 — not an official government portal.</p>
        </div>
      </div>
    </div>
  );
}

