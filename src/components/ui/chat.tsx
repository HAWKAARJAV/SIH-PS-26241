import { BRAND } from "@/config/brand";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

const bubble: Record<string, string> = {
  PARENT: "bg-clay text-ink",
  LEARNER: "bg-neem text-ink",
  DISHA: "border border-line bg-surface text-ink shadow-[0_8px_24px_rgba(var(--shadow),0.08)]",
  COUNSELLOR: "bg-info-soft text-ink",
  TOGETHER: "bg-warm text-ink",
};

export function Avatar({ role }: { role: string }) {
  const initial = role === "DISHA" ? "D" : role === "PARENT" ? "P" : role === "LEARNER" ? "L" : role[0] ?? "?";
  const tone =
    role === "PARENT" ? "bg-primary text-white" : role === "LEARNER" ? "bg-growth text-white" : role === "DISHA" ? "bg-surface border border-line text-primary" : "bg-info text-white";
  return <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold", tone)} aria-hidden>{initial}</span>;
}

export function ChatBubble({
  role,
  label,
  children,
  footer,
}: {
  role: string;
  label: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <article className={cn("flex gap-3 rounded-[var(--radius-card)] p-4", bubble[role] ?? bubble.DISHA)}>
      <Avatar role={role} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-muted">{label}</p>
        <div className="mt-1">{children}</div>
        {footer ? <div className="mt-2 flex flex-wrap gap-2">{footer}</div> : null}
      </div>
    </article>
  );
}

export function TypingIndicator() {
  return (
    <p className="text-sm text-muted" role="status">
      {BRAND.persona} is writing…
    </p>
  );
}

export function QuickReplyChips({ chips, onPick, disabled }: { chips: string[]; onPick: (c: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Quick concerns">
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          disabled={disabled}
          className="min-h-12 rounded-full border border-line bg-surface px-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:opacity-50"
          onClick={() => onPick(chip)}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
