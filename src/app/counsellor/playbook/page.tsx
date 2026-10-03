import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SuggestForm } from "@/components/counsellor/suggest";

export const dynamic = "force-dynamic";

export default async function PlaybookPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const entries = await prisma.playbookEntry.findMany({ where: { locale: "en" }, include: { tag: true }, take: 20 });
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <p><Link href="/counsellor" className="text-info underline">Back to queue</Link></p>
      <h1 className="font-display text-4xl">Playbook</h1>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-[20px] border border-line p-4">
            <p className="text-sm text-muted">{entry.tag.labelEn}</p>
            <p>{entry.opener}</p>
            <p className="mt-1 text-sm">{entry.caveat}</p>
          </li>
        ))}
      </ul>
      <SuggestForm />
      <p className="text-sm">Prototype for Smart India Hackathon 2026 — not an official government portal.</p>
    </main>
  );
}
