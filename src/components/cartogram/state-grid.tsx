import { cn } from "@/lib/cn";

export type StateCell = {
  code: string;
  name: string;
  meanRi: number;
  districts: number;
  hotspot: boolean;
};

function ramp(ri: number, hotspot: boolean) {
  if (hotspot) return "bg-dviz-5 text-white";
  if (ri >= 55) return "bg-dviz-4 text-white";
  if (ri >= 45) return "bg-dviz-3 text-ink";
  if (ri >= 35) return "bg-dviz-2 text-ink";
  return "bg-dviz-1 text-ink";
}

export function StateCartogram({ states }: { states: StateCell[] }) {
  const sorted = [...states].sort((a, b) => b.meanRi - a.meanRi);
  return (
    <div>
      <p className="text-sm text-muted">Tile grid cartogram · mean resistance index by state (synthetic sessions).</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" role="img" aria-label="State resistance cartogram">
        {sorted.map((s) => (
          <div key={s.code} className={cn("rounded-2xl p-4 shadow-[0_4px_12px_rgba(var(--shadow),0.08)]", ramp(s.meanRi, s.hotspot))}>
            <p className="text-lg font-bold">{s.code}</p>
            <p className="text-sm opacity-90">{s.name}</p>
            <p className="mt-2 tabular text-2xl font-semibold">{s.meanRi}</p>
            <p className="text-xs">{s.districts} districts{s.hotspot ? " · hotspot" : ""}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-full bg-dviz-1 px-2 py-1">lower RI</span>
        <span className="rounded-full bg-dviz-5 px-2 py-1 text-white">hotspot</span>
      </div>
    </div>
  );
}
