export default function MethodologyPage() {
  return (
    <article className="prose-measure space-y-3">
      <h1 className="font-display text-4xl">How every number is made</h1>
      <p>V3 is a steward-signed dataset with a checksum. V2 is a public reference with a URL and date. V1 is reported and not for headlines. V0 is synthetic demo data and always says so.</p>
      <p>We show a median and a P25–P75 range, with the cohort size and period. Placement is also “N out of 10”. Placed means wage work, apprenticeship, or own work inside the dataset window, default 6 months.</p>
      <p>If a cohort is under 20 people we step from centre to district to state and say so. If nothing qualifies, we say there is no verified data and offer a counsellor.</p>
      <p>Resistance Index = 100 × (0.35·U + 0.25·S + 0.20·I + 0.10·E + 0.10·P). U is open objection intensity over 6. S is parent sentiment over the last 3 turns. I is stance. E is an escalation request. P is repeats of the same worry. Sentiment lift is the drop in that index. These relationships are descriptive, not proof that a chart caused a change.</p>
    </article>
  );
}
