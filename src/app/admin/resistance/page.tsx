import { requireStaff } from "@/lib/auth/guard";
import { resistanceRows } from "@/data/services/dashboard";
import { stateCartogram, topObjectionInsight } from "@/data/services/admin-metrics";
import { StateCartogram } from "@/components/cartogram/state-grid";
import { InsightCard } from "@/components/admin/insight-card";

export const dynamic = "force-dynamic";

export default async function ResistancePage() {
  await requireStaff();
  const [rows, states, insight] = await Promise.all([resistanceRows(), stateCartogram(), topObjectionInsight()]);
  const topDistrict = [...rows].sort((a, b) => b.meanRi - a.meanRi)[0];
  return (
    <section className="space-y-6">
      <h1 className="font-display text-3xl">Resistance</h1>
      <StateCartogram states={states} />
      {insight ? (
        <InsightCard
          title={`${insight.pct}% of sessions raise ${insight.tag.replaceAll("_", " ").toLowerCase()}`}
          body={insight.suggestion}
          how="Share of synthetic session events with this objection tag in the payload, last full seed window."
          district={topDistrict?.districtName}
        />
      ) : null}
      <table className="w-full text-left text-sm">
        <caption className="text-left font-semibold">Ranked districts</caption>
        <thead><tr><th>District</th><th>State</th><th>Mean RI</th><th>n</th><th>Data</th></tr></thead>
        <tbody>
          {[...rows].sort((a, b) => b.meanRi - a.meanRi).map((row) => (
            <tr key={row.districtId}>
              <td>{row.districtName}</td>
              <td>{row.stateName}</td>
              <td className="tabular">{row.meanRi}</td>
              <td className="tabular">{row.n}</td>
              <td>{row.syntheticRibbon ? "Synthetic" : "Mixed"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
