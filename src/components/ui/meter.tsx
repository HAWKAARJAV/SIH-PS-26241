import { cn } from "@/lib/cn";

export function StageStepper({ stages, current }: { stages: string[]; current: string }) {
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Session stage">
      {stages.map((name) => (
        <li
          key={name}
          className={cn(
            "rounded-full px-3 py-1 text-sm font-semibold",
            name === current ? "bg-primary text-white" : "bg-sunken text-muted",
          )}
        >
          {name}
        </li>
      ))}
    </ol>
  );
}

export function ProgressRing({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, value));
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  return (
    <div className="flex items-center gap-3">
      <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden>
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--growth-soft)" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="var(--growth)"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
        />
      </svg>
      <div>
        <p className="tabular text-2xl font-semibold">{v}%</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}

export function ConsensusMeter({ openConcerns, alignment }: { openConcerns: number; alignment: string }) {
  const score = openConcerns === 0 ? 72 : Math.max(18, 72 - openConcerns * 14);
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <h2 className="font-semibold">Consensus</h2>
      <ProgressRing value={score} label={alignment} />
      <p className="mt-2 text-xs text-muted">Illustrative overlap of interests and open worries. Not a guarantee.</p>
    </div>
  );
}
