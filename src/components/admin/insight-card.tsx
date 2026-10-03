import Link from "next/link";

export function InsightCard({
  title,
  body,
  how,
  district,
}: {
  title: string;
  body: string;
  how: string;
  district?: string;
}) {
  return (
    <article className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-[0_8px_24px_rgba(var(--shadow),0.06)]">
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mt-2 text-sm">{body}</p>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-semibold text-info">How this was computed</summary>
        <p className="mt-1 text-muted">{how}</p>
      </details>
      <Link
        href={`/admin/interventions${district ? `?district=${encodeURIComponent(district)}` : ""}`}
        className="mt-4 inline-flex min-h-12 items-center rounded-full bg-primary px-5 font-semibold text-white"
      >
        Create intervention
      </Link>
    </article>
  );
}
