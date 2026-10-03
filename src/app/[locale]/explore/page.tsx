import { Link } from "@/lib/i18n/navigation";
import { prisma } from "@/lib/db";
import { EmptyState } from "@/components/ui/primitives";
import { setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ExplorePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> }) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const trades = await prisma.trade.findMany({ orderBy: { name: "asc" } });
  const filtered = trades.filter((t) => !q || t.name.toLowerCase().includes(q.toLowerCase()) || t.slug.includes(q.toLowerCase()));
  return (
    <div>
      <h1 className="font-display text-4xl">Explore trades</h1>
      <form className="mt-4"><input name="q" defaultValue={q} aria-label="Filter trades" className="min-h-12 w-full rounded-2xl border border-line px-4" placeholder="Electrician, sewing, solar…" /></form>
      {filtered.length === 0 ? <div className="mt-4"><EmptyState title="No trade matches" body="Clear the filter or ask in the Family Room." action={<Link href="/explore" className="text-primary">Show all</Link>} /></div> : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {filtered.map((trade) => (
            <li key={trade.id}>
              <Link href={`/trades/${trade.slug}`} className="block min-h-24 rounded-[20px] border border-line bg-surface p-4">
                <h2 className="font-display text-2xl">{trade.name}</h2>
                <p className="text-sm text-muted">NSQF {String(trade.nsqfLevel)} · {trade.durationMonths} months · {trade.entryQualification}</p>
                <p className="mt-1 text-sm">Demo data ribbon on every figure inside.</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
