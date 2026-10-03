import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const cases = await prisma.escalationCase.findMany({ where: { status: { in: ["queued", "accepted", "live"] } }, orderBy: { slaDueAt: "asc" } });
  return (
    <main className="mx-auto max-w-3xl p-6">
      <p><Link href="/counsellor" className="text-info underline">Back to queue</Link></p>
      <h1 className="mt-3 font-display text-4xl">Schedule</h1>
      <p className="mt-2">Callbacks are ordered by the four-hour SLA. This list is the family’s preferred window plus the due time.</p>
      {cases.length === 0 ? <p className="mt-4">Nothing is waiting.</p> : (
        <ul className="mt-4 space-y-2">
          {cases.map((item) => <li key={item.id} className="rounded-2xl border border-line p-3">{item.reason} · due {item.slaDueAt} · {item.language}</li>)}
        </ul>
      )}
      <p className="mt-8 text-sm">Prototype for Smart India Hackathon 2026 — not an official government portal.</p>
    </main>
  );
}
