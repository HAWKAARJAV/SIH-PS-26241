import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const sources = await prisma.source.findMany({ orderBy: { id: "asc" } });
  return (
    <article>
      <h1 className="font-display text-4xl">Sources</h1>
      <p className="mt-2">Re-verify every Fact Pack item before a live demo.</p>
      <ul className="mt-4 space-y-3">
        {sources.map((s) => (
          <li key={s.id} className="rounded-[20px] border border-line bg-surface p-4">
            <a className="font-semibold text-info underline" href={s.url}>{s.title}</a>
            <p className="text-sm">{s.publisher} · retrieved {s.retrievedAt} · {s.tierHint}</p>
            <p>{s.notes}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
