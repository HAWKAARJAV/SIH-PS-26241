import { requireStaff } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function InterventionsPage() {
  await requireStaff();
  const items = await prisma.intervention.findMany();
  return (
    <section>
      <h1 className="font-display text-3xl">Interventions</h1>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-[20px] bg-surface p-4">
            <h2 className="text-xl">{item.title}</h2>
            <p>{item.action}</p>
            <p className="text-sm">Started {item.startedAt}. Mullai sessions after June are seeded with a lower resistance index. That is a story in synthetic data, not a causal result.</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
