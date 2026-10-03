import { prisma } from "@/lib/db";
import { setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function LadderPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ trade?: string }> }) {
  const { locale } = await params;
  const { trade } = await searchParams;
  setRequestLocale(locale);
  const row = await prisma.trade.findUnique({ where: { slug: trade ?? "electrician" }, include: { edgesFrom: { orderBy: { sortOrder: "asc" } } } });
  return (
    <article>
      <h1 className="font-display text-4xl">Skill ladder</h1>
      <p className="mt-2 max-w-prose">NSQF means skill ladder level. NCrF means a credit bank: your training hours can count toward a diploma or degree. Confirm every step on the National Qualifications Register.</p>
      <ol className="mt-6 space-y-3 border-l-4 border-primary pl-4">
        <li><strong>Entry.</strong> {row?.entryQualification}. NSQF {row ? String(row.nsqfLevel) : "—"} ({row?.nsqfFrameworkVersion}).</li>
        {(row?.edgesFrom ?? []).map((edge) => (
          <li key={edge.id}><strong>{edge.toLabel}.</strong> {edge.requirements} {edge.creditHint}</li>
        ))}
        <li><strong>Technician or supervisor.</strong> After supervised work. Not guaranteed.</li>
        <li><strong>Degree path.</strong> Stay in school or college if that fits better. This ladder does not call a trade “best”.</li>
      </ol>
    </article>
  );
}
