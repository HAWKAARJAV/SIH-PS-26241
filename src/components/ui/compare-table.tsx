import type { EvidenceCard } from "@/data/services/outcomes";
import { IconArray, RangeBar, VerificationBadge } from "@/components/ui/primitives";

type Row = {
  name: string;
  meta: string;
  worry: string;
  card: EvidenceCard | null;
  note: string;
};

export function CompareTable({ rows, degreeNote }: { rows: Row[]; degreeNote: string }) {
  return (
    <div className="mt-6 space-y-4">
      <div className="hidden gap-3 lg:grid lg:grid-cols-4">
        <div className="text-sm font-semibold text-muted">Option</div>
        <div className="text-sm font-semibold text-muted">What worries us</div>
        <div className="text-sm font-semibold text-muted lg:col-span-2">What the data says</div>
      </div>
      {rows.map((row) => (
        <section key={row.name} className="grid gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-4 lg:grid-cols-4">
          <div>
            <h2 className="font-display text-2xl">{row.name}</h2>
            <p className="text-sm text-muted">{row.meta}</p>
          </div>
          <p className="text-sm">{row.worry}</p>
          <div className="lg:col-span-2">
            {row.card ? (
              <>
                <VerificationBadge tier={row.card.tier} />
                {row.card.outOfTen != null ? (
                  <div className="mt-2">
                    <p className="tabular font-semibold">{row.card.outOfTen} out of 10 placed</p>
                    <IconArray filled={row.card.outOfTen} />
                  </div>
                ) : null}
                {row.card.p25 != null && row.card.median != null && row.card.p75 != null ? (
                  <div className="mt-2">
                    <p className="tabular text-sm">{row.card.rangeLabel}</p>
                    <RangeBar p25={row.card.p25} median={row.card.median} p75={row.card.p75} />
                  </div>
                ) : null}
                <p className="mt-2 text-xs text-muted">{row.card.period} · n={row.card.cohortSize}</p>
              </>
            ) : (
              <p className="text-sm text-muted">No verified figure in this dataset. {row.note}</p>
            )}
          </div>
        </section>
      ))}
      <section className="rounded-[var(--radius-card)] border border-line bg-warm p-4">
        <h2 className="font-display text-2xl">Degree path</h2>
        <p className="mt-2 text-sm">{degreeNote}</p>
      </section>
    </div>
  );
}
