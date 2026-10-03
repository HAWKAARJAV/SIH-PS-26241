type Edge = { id: string; toLabel: string; requirements: string; creditHint: string | null };

export function LadderSteps({
  tradeName,
  entry,
  nsqfLevel,
  framework,
  edges,
}: {
  tradeName: string;
  entry: string;
  nsqfLevel: string;
  framework: string;
  edges: Edge[];
}) {
  const steps = [
    { title: "Entry", body: `${entry}. NSQF ${nsqfLevel} (${framework}). Verify on NQR with the centre.` },
    ...edges.map((e) => ({ title: e.toLabel, body: `${e.requirements} ${e.creditHint ?? ""}`.trim() })),
    { title: "Technician or supervisor", body: "After supervised work on real jobs. Not guaranteed." },
    { title: "Academic bridge", body: "NCrF credits may count toward a diploma or degree via ABC. A degree path may still fit your family." },
  ];
  return (
    <ol className="relative mt-6 space-y-0">
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
          <div className="flex flex-col items-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{i + 1}</span>
            {i < steps.length - 1 ? <span className="mt-1 w-0.5 flex-1 bg-primary/30" aria-hidden /> : null}
          </div>
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4 pt-3">
            <h2 className="font-display text-xl">{step.title}</h2>
            <p className="mt-1 text-muted">{step.body}</p>
            {i === 0 ? <p className="mt-2 text-sm font-semibold text-info">{tradeName} pathway</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
