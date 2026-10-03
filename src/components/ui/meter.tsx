import { cn } from "@/lib/cn";

export function StageStepper({ stages, current }: { stages: string[]; current: string }) {
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Where this talk is">
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
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <h2 className="font-semibold">Agreement so far</h2>
      <p className="mt-2 text-lg font-semibold">{alignment}</p>
      <p className="mt-1 text-sm text-muted">
        {openConcerns === 0
          ? "This stays blank until someone names a worry. It is not a score."
          : `${openConcerns} open ${openConcerns === 1 ? "worry" : "worries"}. It is not a score of the family.`}
      </p>
    </div>
  );
}
