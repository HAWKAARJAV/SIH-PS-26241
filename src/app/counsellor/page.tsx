import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CounsellorHome() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const cases = await prisma.escalationCase.findMany({ orderBy: { createdAt: "desc" }, take: 40 });
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="font-display text-4xl">Counsellor queue</h1>
      <p className="mt-2 flex gap-4"><Link className="underline" href="/counsellor/schedule">Schedule</Link><Link className="underline" href="/counsellor/playbook">Playbook</Link></p>
      <p className="mt-2">Signed in as {session.user.email}. Simulated replies are labelled in Demo Mode.</p>
      {cases.length === 0 ? <p className="mt-4">Queue is empty.</p> : (
        <ul className="mt-4 space-y-2">
          {cases.map((c) => <li key={c.id}><Link className="underline" href={`/counsellor/case/${c.id}`}>{c.status} · {c.language} · {c.reason}</Link></li>)}
        </ul>
      )}
      <p className="mt-8 text-sm">Prototype for Smart India Hackathon 2026 — not an official government portal.</p>
    </main>
  );
}
