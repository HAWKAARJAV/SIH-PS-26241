import { requireStaff } from "@/lib/auth/guard";
import { adminOverview, topObjectionInsight } from "@/data/services/admin-metrics";
import { InsightCard } from "@/components/admin/insight-card";
import { resistanceRows } from "@/data/services/dashboard";
import { Sparkline } from "@/components/charts/sparkline";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireStaff();
  const [overview, hotspots, insight] = await Promise.all([adminOverview(), resistanceRows(), topObjectionInsight()]);
  const flagged = hotspots.filter((row) => row.hotspot);
  const trend = [38, 41, 39, 44, 42, overview.meanRi];
  return (
    <section className="space-y-6">
      <h1 className="font-display text-3xl">Where families still hesitate</h1>
      <p className="max-w-2xl text-muted">Each family room writes a worry onto this map. Use it to see which objection is concentrated, then open Resistance for the district grid. Figures below are synthetic.</p>
      {insight ? (
        <InsightCard
          title={`${insight.pct}% of synthetic sessions raise ${insight.tag.replaceAll("_", " ").toLowerCase()}`}
          body={insight.suggestion}
          how="Share of synthetic session events carrying this objection tag."
        />
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Sessions (synthetic)" value={overview.funnel.started} />
        <Tile label="Joint sessions (est.)" value={overview.jointEstimate} />
        <Tile label="Mean RI" value={overview.meanRi} />
        <Tile label="Hotspot districts" value={flagged.length} />
      </div>
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
        <h2 className="font-semibold">RI trend (illustrative)</h2>
        <Sparkline data={trend} label="Mean resistance index" />
      </div>
      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
        <h2 className="font-semibold">Funnel (correlational)</h2>
        <table className="mt-2 w-full text-left text-sm">
          <tbody>
            <FunnelRow label="Started session" n={overview.funnel.started} />
            <FunnelRow label="Saw evidence" n={overview.funnel.sawEvidence} />
            <FunnelRow label="Explored trades (est.)" n={overview.funnel.explored} />
            <FunnelRow label="Plan survey submitted" n={overview.funnel.planSaved} />
          </tbody>
        </table>
      </div>
      <table className="w-full text-left text-sm">
        <caption className="text-left font-semibold">District resistance · cells under k-anon hidden</caption>
        <thead><tr><th>District</th><th>State</th><th>n</th><th>Mean RI</th><th>Hotspot</th></tr></thead>
        <tbody>
          {hotspots.slice(0, 12).map((row) => (
            <tr key={row.districtId}>
              <td>{row.districtName}</td>
              <td>{row.stateName}</td>
              <td className="tabular">{row.n}</td>
              <td className="tabular">{row.meanRi}</td>
              <td>{row.hotspot ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-4 shadow-[0_4px_16px_rgba(var(--shadow),0.06)]">
      <p className="text-muted">{label}</p>
      <p className="tabular text-3xl font-semibold">{value}</p>
    </div>
  );
}

function FunnelRow({ label, n }: { label: string; n: number }) {
  return (
    <tr>
      <td className="py-1">{label}</td>
      <td className="tabular py-1 text-right font-semibold">{n}</td>
    </tr>
  );
}
