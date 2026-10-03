import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { CaseActions } from "@/components/counsellor/actions";

export const dynamic = "force-dynamic";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;
  const item = await prisma.escalationCase.findUnique({ where: { id }, include: { notes: true, outcome: true, family: { include: { consents: true } } } });
  if (!item) notFound();
  const share = item.family.consents.some((c) => c.purposes.includes("counsellor") && !c.withdrawnAt);
  return (
    <main className="mx-auto max-w-3xl space-y-3 p-6">
      <h1 className="font-display text-4xl">Case</h1>
      <p>{item.brief}</p>
      <p>Status {item.status}. SLA {item.slaDueAt}.</p>
      {share ? <p>Transcript sharing was allowed. Open the family room with the family if they are present.</p> : <p>No transcript. The family did not consent to sharing.</p>}
      <CaseActions id={item.id} />
      <p className="text-sm">Prototype for Smart India Hackathon 2026 — not an official government portal.</p>
    </main>
  );
}
