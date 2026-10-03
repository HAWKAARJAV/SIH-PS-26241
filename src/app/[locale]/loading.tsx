export default function Loading() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <div className="h-10 w-48 animate-pulse rounded-2xl bg-primary-soft" />
      <div className="h-28 animate-pulse rounded-[20px] bg-warm" />
      <div className="h-28 animate-pulse rounded-[20px] bg-warm" />
    </div>
  );
}
