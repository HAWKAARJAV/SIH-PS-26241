import { requireStaff } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { resistanceRows } from "@/data/services/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireStaff();
  const [families, events, hotspots] = await Promise.all([
    prisma.family.count({ where: { deletedAt: null } }),
    prisma.analyticsEvent.count(),
    resistanceRows(),
  ]);
  const flagged = hotspots.filter((row) => row.hotspot);
  return (
    <section>
      <h1 className="font-display text-3xl">Overview</h1>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Tile label="Synthetic sessions" value={events} />
        <Tile label="Live family rooms" value={families} />
        <Tile label="Hotspot districts" value={flagged.length} />
      </div>
      <p className="mt-4">Funnel in this demo is seeded as session and evidence events. Joint-session rate is illustrative because the synthetic log does not store a second device.</p>
      <table className="mt-4 w-full text-left">
        <caption className="text-left">District resistance, cells under 10 hidden</caption>
        <thead><tr><th>District</th><th>n</th><th>Mean RI</th><th>Hotspot</th></tr></thead>
        <tbody>
          {hotspots.map((row) => (
            <tr key={row.districtId}><td>{row.districtId}</td><td className="tabular">{row.n}</td><td className="tabular">{row.meanRi}</td><td>{row.hotspot ? "Yes" : "No"}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return <div className="rounded-[20px] bg-surface p-4"><p className="text-muted">{label}</p><p className="tabular text-3xl">{value}</p></div>;
}
