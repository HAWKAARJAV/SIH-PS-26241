import { prisma } from "@/lib/db";
import { resolveEvidence } from "@/data/services/outcomes";
import { setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ComparePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const slugs = ["electrician", "sewing", "copa"];
  const trades = await prisma.trade.findMany({ where: { slug: { in: slugs } } });
  const cards = await Promise.all(trades.map(async (trade) => ({ trade, evidence: await resolveEvidence({ tradeId: trade.id, locale }) })));
  return (
    <article>
      <h1 className="font-display text-4xl">Compare</h1>
      <p className="mt-2">A degree path sits beside the trades. Where demo data is missing, we use words, not invented numbers.</p>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {cards.map(({ trade, evidence }) => (
          <section key={trade.id} className="rounded-[20px] border border-line bg-surface p-4">
            <h2 className="font-display text-2xl">{trade.name}</h2>
            <p>{trade.durationMonths} months · {trade.entryQualification}</p>
            <p className="mt-2">{evidence.card ? evidence.card.rateLabel : "No verified placement figure."}</p>
            <p>{evidence.card ? evidence.card.rangeLabel : "No verified earnings figure."}</p>
            <p className="mt-2 text-sm">{evidence.card?.tier === "V0" ? "In demo data." : ""} {trade.notFor}</p>
          </section>
        ))}
        <section className="rounded-[20px] border border-line bg-warm p-4">
          <h2 className="font-display text-2xl">Degree path</h2>
          <p>Stay for Class 12 or a college course if the family wants that first. Credits from a trade may count later under NCrF. No earnings number is shown here because this dataset has no degree-cohort wages.</p>
        </section>
      </div>
    </article>
  );
}
