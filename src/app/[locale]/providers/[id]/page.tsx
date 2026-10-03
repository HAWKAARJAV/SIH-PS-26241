import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EvidenceCardView } from "@/components/evidence/card";
import { resolveEvidence } from "@/data/services/outcomes";
import { setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ProviderPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const provider = await prisma.provider.findUnique({ where: { id }, include: { district: true, trades: true } });
  if (!provider) notFound();
  const tradeId = provider.trades[0]?.tradeId;
  const evidence = tradeId ? await resolveEvidence({ tradeId, providerId: provider.id, districtId: provider.districtId, stateId: provider.district.stateId, locale }) : { card: null };
  return (
    <article className="space-y-4">
      <p className="text-sm font-semibold text-warning">Fictional centre · demo data</p>
      <h1 className="font-display text-4xl">{provider.name}</h1>
      <p>{provider.address}. {provider.district.name}. {provider.type}.</p>
      <ul className="list-disc pl-5">
        <li>Hostel: {provider.hostel ? "listed" : "not listed"}</li>
        <li>Transport: {provider.transport ? "listed" : "not listed"}</li>
        <li>Girls-only: {provider.girlsOnly ? "yes" : "no"}</li>
        <li>{provider.accreditation}</li>
      </ul>
      {evidence.card ? <EvidenceCardView card={evidence.card} locale={locale} /> : <p>No verified data yet for this centre. Ask a counsellor. We will not guess.</p>}
      {provider.weak ? <p>This centre is weak in the demo set on purpose, so the family can see a low range instead of a sales pitch.</p> : null}
      <h2 className="font-display text-2xl">Questions to ask before you pay</h2>
      <ol className="list-decimal pl-5">
        <li>Can I see the affiliation and the trainer’s certificate?</li>
        <li>What did the last batch do within six months, and where is that written?</li>
        <li>What is the full fee, and what is refundable?</li>
        <li>How do women trainees travel home?</li>
      </ol>
    </article>
  );
}
