import { prisma } from "@/lib/db";
import { resolveEvidence } from "@/data/services/outcomes";
import { CompareTable } from "@/components/ui/compare-table";
import { setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ComparePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const slugs = ["electrician", "sewing", "copa"];
  const trades = await prisma.trade.findMany({ where: { slug: { in: slugs } } });
  const cards = await Promise.all(trades.map(async (trade) => ({ trade, evidence: await resolveEvidence({ tradeId: trade.id, locale }) })));
  const rows = cards.map(({ trade, evidence }) => ({
    name: trade.name,
    meta: `${trade.durationMonths} months · ${trade.entryQualification}`,
    worry: trade.cons.slice(0, 120),
    card: evidence.card,
    note: trade.notFor.slice(0, 100),
  }));
  return (
    <article>
      <h1 className="font-display text-4xl sm:text-5xl">Compare</h1>
      <p className="prose-measure mt-2 text-muted">What worries you ↔️ what the data says. A degree path sits beside the trades. No invented numbers.</p>
      <CompareTable
        rows={rows}
        degreeNote="Stay for Class 12 or college if that fits the family first. NCrF credits from a trade may count later. No degree-cohort wages in this demo dataset."
      />
    </article>
  );
}
