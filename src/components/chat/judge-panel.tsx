type Trace = {
  language?: string;
  tags?: string[];
  factIds?: string[];
  guard?: boolean;
  escalation?: boolean | { flag?: boolean };
  latencyMs?: number;
  provider?: string;
  fallback?: boolean;
  retrieval?: { id: string; title: string; tier: string }[];
};

export function JudgePanel({ trace }: { trace: unknown }) {
  const t = (trace ?? {}) as Trace;
  const esc = typeof t.escalation === "object" ? t.escalation?.flag : t.escalation;
  return (
    <aside className="mt-3 rounded-xl border border-dashed border-plum/40 bg-sunken p-3 text-sm" aria-label="AI trace">
      <p className="font-semibold text-plum">Judge Mode · AI trace</p>
      <dl className="mt-2 grid gap-1 sm:grid-cols-2">
        <div><dt className="text-muted">Language</dt><dd>{t.language ?? "—"}</dd></div>
        <div><dt className="text-muted">Provider</dt><dd>{t.provider ?? "—"}{t.fallback ? " (fallback)" : ""}</dd></div>
        <div><dt className="text-muted">Guard</dt><dd>{t.guard ? "pass" : "fail"}</dd></div>
        <div><dt className="text-muted">Latency</dt><dd className="tabular">{t.latencyMs ?? "—"} ms</dd></div>
        <div className="sm:col-span-2"><dt className="text-muted">Objection tags</dt><dd>{(t.tags ?? []).join(", ") || "—"}</dd></div>
        <div className="sm:col-span-2"><dt className="text-muted">Fact IDs</dt><dd className="font-mono text-xs">{(t.factIds ?? []).join(", ") || "—"}</dd></div>
        <div className="sm:col-span-2"><dt className="text-muted">Escalation</dt><dd>{esc ? "yes" : "no"}</dd></div>
        {t.retrieval?.length ? (
          <div className="sm:col-span-2">
            <dt className="text-muted">Retrieved cards</dt>
            <dd>{t.retrieval.map((r) => `${r.title} (${r.tier})`).join(" · ")}</dd>
          </div>
        ) : null}
      </dl>
    </aside>
  );
}
