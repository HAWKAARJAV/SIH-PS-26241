export function TradeIcon({ slug, className }: { slug: string; className?: string }) {
  const label = slug.replaceAll("-", " ");
  return (
    <span
      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-lg font-bold text-primary ${className ?? ""}`}
      aria-hidden
    >
      {label.slice(0, 2).toUpperCase()}
    </span>
  );
}
