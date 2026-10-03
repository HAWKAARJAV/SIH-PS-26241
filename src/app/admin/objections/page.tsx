import { requireStaff } from "@/lib/auth/guard";
import { objectionTagCounts } from "@/data/services/dashboard";

export const dynamic = "force-dynamic";

export default async function ObjectionsPage() {
  await requireStaff();
  const tags = await objectionTagCounts();
  const entries = Object.entries(tags).sort((a, b) => b[1] - a[1]);
  return (
    <section>
      <h1 className="font-display text-3xl">Objection explorer</h1>
      <p>Counts are synthetic. Resolution rate is not claimed from this seed because objections are raised, not closed, in the analytics log.</p>
      <table className="mt-4 w-full text-left">
        <caption className="text-left">Tags</caption>
        <thead><tr><th>Tag</th><th>Count</th></tr></thead>
        <tbody>{entries.map(([tag, n]) => <tr key={tag}><td>{tag}</td><td className="tabular">{n}</td></tr>)}</tbody>
      </table>
    </section>
  );
}
