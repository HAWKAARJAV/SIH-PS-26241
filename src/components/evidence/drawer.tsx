"use client";

import type { EvidenceCard } from "@/data/services/outcomes";
import { VerificationBadge } from "@/components/ui/primitives";

export function EvidenceDrawer({ card, open, onClose }: { card: EvidenceCard; open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-[rgba(42,33,27,0.35)] p-4 sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Evidence proof"
    >
      <div className="max-h-[80dvh] w-full max-w-lg overflow-auto rounded-[var(--radius-sheet)] bg-surface p-6 shadow-[0_20px_48px_rgba(var(--shadow),0.12)]">
        <h2 className="font-display text-3xl">How this number was made</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <VerificationBadge tier={card.tier} />
        </div>
        <dl className="mt-4 space-y-3 text-base">
          <div><dt className="text-muted">What</dt><dd>{card.placedDefinition}</dd></div>
          <div><dt className="text-muted">When</dt><dd>{card.period}</dd></div>
          <div><dt className="text-muted">How many</dt><dd className="tabular">{card.cohortSize}</dd></div>
          <div><dt className="text-muted">Dataset</dt><dd>{card.datasetLabel}</dd></div>
          <div><dt className="text-muted">Source</dt><dd><a className="text-info underline" href={card.sourceUrl}>{card.sourceTitle}</a></dd></div>
        </dl>
        {card.fallback ? <p className="mt-3 text-sm text-muted">{card.scopeNote}</p> : null}
        <button type="button" className="mt-6 min-h-12 w-full rounded-full bg-primary font-semibold text-white" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export function SourceStrip({ title, url, period, n }: { title: string; url: string; period: string; n: number }) {
  return (
    <p className="text-sm text-muted">
      <a href={url} className="font-semibold text-info underline">{title}</a>
      {" · "}
      {period}
      {" · "}
      <span className="tabular">n={n}</span>
    </p>
  );
}
