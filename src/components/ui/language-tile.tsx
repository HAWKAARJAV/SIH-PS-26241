import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/cn";

export function LanguageTile({ code, name, active }: { code: string; name: string; active?: boolean }) {
  return (
    <Link
      href="/start"
      locale={code}
      className={cn(
        "flex min-h-16 items-center justify-center rounded-[var(--radius-card)] border text-xl font-semibold transition-transform active:scale-[0.98]",
        active ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface hover:border-primary/40",
      )}
    >
      {name}
    </Link>
  );
}
