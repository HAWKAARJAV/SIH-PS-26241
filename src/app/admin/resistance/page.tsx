import { requireStaff } from "@/lib/auth/guard";
import { resistanceRows } from "@/data/services/dashboard";

export const dynamic = "force-dynamic";

export default async function ResistancePage() {
  await requireStaff();
  const rows = await resistanceRows();
  const states = [...new Set(rows.map((r) => r.stateCode))];
  return (
    <section>
      <h1 className="font-display text-3xl">Resistance</h1>
      <p>Cartogram is a state grid, not a geographic outline.</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {states.map((code) => {
          const mine = rows.filter((r) => r.stateCode === code);
          const hot = mine.some((r) => r.hotspot);
          return <div key={code} className={`rounded-2xl p-4 ${hot ? "bg-dviz-4 text-white" : "bg-dviz-2"}`}><p className="text-xl font-semibold">{code}</p><p>{mine.length} districts</p></div>;
        })}
      </div>
      <table className="mt-4 w-full text-left">
        <caption className="text-left">Ranked districts</caption>
        <thead><tr><th>District</th><th>State</th><th>Mean RI</th><th>n</th></tr></thead>
        <tbody>
          {[...rows].sort((a, b) => b.meanRi - a.meanRi).map((row) => (
            <tr key={row.districtId}>
              <td>{row.districtName}{row.syntheticRibbon ? " (synthetic)" : ""}</td>
              <td>{row.stateName}</td>
              <td className="tabular">{row.meanRi}</td>
              <td className="tabular">{row.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
