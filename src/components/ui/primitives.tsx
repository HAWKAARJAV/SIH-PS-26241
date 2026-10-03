import { cn } from "@/lib/cn";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "quiet";
  asChild?: boolean;
};

export function Button({ className, variant = "primary", asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-base font-semibold transition-transform active:scale-[0.98] disabled:opacity-50",
        variant === "primary" && "bg-primary text-white hover:bg-primary-hover",
        variant === "ghost" && "bg-surface text-ink border border-line hover:bg-warm",
        variant === "quiet" && "bg-primary-soft text-primary hover:bg-accent-soft",
        className,
      )}
      {...props}
    />
  );
}

export function Chip({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span className={cn("inline-flex min-h-12 items-center rounded-full border px-4 text-sm", active ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-ink")}>
      {children}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-line bg-warm p-6">
      <Courtyard className="mb-4 h-16 w-16" />
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="prose-measure mt-2 text-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function VerificationBadge({ tier }: { tier: string }) {
  const label = tier === "V0" ? "Demo data" : tier === "V1" ? "Not independently verified" : tier === "V2" ? "Public reference" : "Verified";
  return <span className="inline-flex min-h-8 items-center rounded-full bg-accent-soft px-3 text-sm font-semibold text-warning">{label} · {tier}</span>;
}

export function IconArray({ filled }: { filled: number }) {
  return (
    <div className="flex flex-wrap gap-1" aria-label={`${filled} out of 10`}>
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className={cn("h-6 w-4 rounded-sm", i < filled ? "bg-growth" : "bg-growth-soft")} />
      ))}
    </div>
  );
}

export function RangeBar({ p25, median, p75 }: { p25: number; median: number; p75: number }) {
  const span = Math.max(p75 - p25, 1);
  const mid = ((median - p25) / span) * 100;
  return (
    <div className="relative h-3 rounded-full bg-dviz-1">
      <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-dviz-3/70" />
      <div className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary" style={{ left: `${mid}%` }} />
      <span className="sr-only">Median sits between the lower and upper amounts</span>
    </div>
  );
}

export function Courtyard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <rect width="80" height="80" rx="16" fill="#F9E4DB" />
      <circle cx="40" cy="28" r="10" fill="#E9A23B" />
      <path d="M16 58c6-10 14-14 24-14s18 4 24 14" fill="#4F7A55" />
      <circle cx="28" cy="48" r="6" fill="#B8472E" />
      <circle cx="52" cy="48" r="6" fill="#2F5D7C" />
    </svg>
  );
}
