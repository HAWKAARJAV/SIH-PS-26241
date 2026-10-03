import { prisma } from "@/lib/db";
import { LadderSteps } from "@/components/ui/ladder-steps";
import { setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function LadderPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ trade?: string }> }) {
  const { locale } = await params;
  const { trade } = await searchParams;
  setRequestLocale(locale);
  const row = await prisma.trade.findUnique({
    where: { slug: trade ?? "electrician" },
    include: { edgesFrom: { orderBy: { sortOrder: "asc" } } },
  });
  return (
    <article className="max-w-2xl">
      <h1 className="font-display text-4xl sm:text-5xl">Skill ladder</h1>
      <p className="prose-measure mt-3 text-muted">
        <strong className="text-ink">NSQF</strong> — skill ladder level. <strong className="text-ink">NCrF</strong> — credit bank: training hours can count toward a diploma or degree. Confirm every step on the National Qualifications Register.
      </p>
      <LadderSteps
        tradeName={row?.name ?? "Trade"}
        entry={row?.entryQualification ?? "Ask the centre"}
        nsqfLevel={row ? String(row.nsqfLevel) : "—"}
        framework={row?.nsqfFrameworkVersion ?? "NSQF-2023"}
        edges={row?.edgesFrom ?? []}
      />
    </article>
  );
}
