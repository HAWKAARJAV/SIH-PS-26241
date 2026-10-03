import { Link } from "@/lib/i18n/navigation";
import { prisma } from "@/lib/db";
import { TradeCard } from "@/components/ui/trade-card";
import { EmptyState } from "@/components/ui/primitives";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ExplorePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> }) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("explore");
  const trades = await prisma.trade.findMany({ orderBy: { name: "asc" } });
  const filtered = trades.filter((tr) => !q || tr.name.toLowerCase().includes(q.toLowerCase()) || tr.slug.includes(q.toLowerCase()));
  return (
    <div>
      <h1 className="font-display text-4xl sm:text-5xl">{t("title")}</h1>
      <form className="mt-4">
        <input name="q" defaultValue={q} aria-label="Filter trades" className="min-h-12 w-full max-w-lg rounded-[var(--radius-input)] border border-line bg-surface px-4 shadow-inner" placeholder="Electrician, sewing, solar…" />
      </form>
      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState title={t("empty")} body="" action={<Link href="/explore" className="font-semibold text-primary">Show all</Link>} />
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((trade) => (
            <li key={trade.id}>
              <TradeCard trade={trade} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
