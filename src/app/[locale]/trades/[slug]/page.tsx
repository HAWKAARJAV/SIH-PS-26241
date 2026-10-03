import { notFound } from "next/navigation";
import { Link } from "@/lib/i18n/navigation";
import { prisma } from "@/lib/db";
import { resolveEvidence } from "@/data/services/outcomes";
import { EvidenceCardView } from "@/components/evidence/card";
import { familyRoiMonths, formatInr } from "@/lib/format/money";
import { setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function TradePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const trade = await prisma.trade.findUnique({
    where: { slug },
    include: { roles: true, providerTrades: { include: { provider: { include: { district: true } } } }, edgesFrom: true },
  });
  if (!trade) notFound();
  const evidence = await resolveEvidence({ tradeId: trade.id, locale });
  const roi = evidence.card?.median ? familyRoiMonths(trade.feesMaxInr, evidence.card.median) : null;
  return (
    <article className="space-y-4">
      <h1 className="font-display text-4xl">{trade.name}</h1>
      <p className="text-sm text-muted">Skill-ladder level {String(trade.nsqfLevel)} ({trade.nsqfFrameworkVersion}). Confirm this on the National Qualifications Register before you pay.</p>
      <p className="prose-measure">{trade.dayInLife}</p>
      {evidence.card ? <EvidenceCardView card={evidence.card} locale={locale} /> : <p className="rounded-[20px] bg-warm p-4">No verified data yet. A counsellor can still help. We will not guess a number.</p>}
      <section>
        <h2 className="font-display text-2xl">Not for you if…</h2>
        <p>{trade.notFor}</p>
      </section>
      <section>
        <h2 className="font-display text-2xl">Women’s lens</h2>
        <p>{trade.womenLens}</p>
      </section>
      <section>
        <h2 className="font-display text-2xl">Costs</h2>
        <p className="tabular">Illustrative fees {formatInr(trade.feesMinInr, locale)} to {formatInr(trade.feesMaxInr, locale)}.</p>
        {roi ? <p>At the middle of the demo earnings range, the highest listed fee is about {roi} months of pay. This ignores food and travel. It is an illustration, not a promise.</p> : null}
        <p>PM-SETU upgrades government ITI buildings. NAPS can reimburse an employer up to ₹1,500 of the prescribed stipend. A trainee stipend appears only when a dataset has it.</p>
      </section>
      <section>
        <h2 className="font-display text-2xl">Providers</h2>
        <ul className="space-y-2">
          {trade.providerTrades.map((row) => (
            <li key={row.id}><Link className="underline" href={`/providers/${row.providerId}`}>{row.provider.name}</Link> · {row.provider.district.name}{row.provider.weak ? " · weak outcomes in demo data" : ""}</li>
          ))}
        </ul>
      </section>
      <Link href={`/ladder?trade=${trade.slug}`} className="inline-flex min-h-12 items-center rounded-full bg-primary px-5 text-white">See the ladder</Link>
    </article>
  );
}
