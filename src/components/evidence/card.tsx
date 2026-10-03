"use client";

import { useState } from "react";
import type { EvidenceCard } from "@/data/services/outcomes";
import { IconArray, RangeBar, VerificationBadge } from "@/components/ui/primitives";
import { formatInr } from "@/lib/format/money";

export function EvidenceCardView({ card, locale }: { card: EvidenceCard; locale: string }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="rounded-[20px] border border-line bg-surface p-4 shadow-[0_8px_24px_rgba(98,60,28,0.08)]">
      {card.tier === "V0" ? <p className="mb-2 text-sm font-semibold text-warning">In demo data…</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <VerificationBadge tier={card.tier} />
        <span className="text-sm text-muted">{card.scopeNote}</span>
      </div>
      {card.outOfTen != null ? (
        <div className="mt-4">
          <p className="tabular text-2xl font-semibold">{card.outOfTen} out of 10</p>
          <IconArray filled={card.outOfTen} />
          <p className="mt-1 text-sm text-muted">{card.rateLabel}</p>
        </div>
      ) : null}
      {card.p25 != null && card.median != null && card.p75 != null ? (
        <div className="mt-4">
          <p className="tabular text-lg">{formatInr(card.median, locale)} / month median</p>
          <RangeBar p25={card.p25} median={card.median} p75={card.p75} />
          <p className="mt-1 text-sm text-muted">{formatInr(card.p25, locale)} to {formatInr(card.p75, locale)}</p>
        </div>
      ) : null}
      <p className="mt-3 text-sm text-muted">
        {card.period} · n={card.cohortSize} · {card.sourceTitle}
      </p>
      <button type="button" className="mt-3 min-h-12 font-semibold text-info" onClick={() => setOpen(true)}>
        Show proof
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-[rgba(42,33,27,0.35)] p-4 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-label="Evidence">
          <div className="max-h-[80dvh] w-full max-w-lg overflow-auto rounded-[28px] bg-surface p-6">
            <h2 className="font-display text-3xl">How this number was made</h2>
            <dl className="mt-4 space-y-2 text-base">
              <div><dt className="text-muted">What</dt><dd>{card.placedDefinition}</dd></div>
              <div><dt className="text-muted">When</dt><dd>{card.period}</dd></div>
              <div><dt className="text-muted">How many</dt><dd className="tabular">{card.cohortSize}</dd></div>
              <div><dt className="text-muted">Tier</dt><dd>{card.tier}. {card.datasetLabel}</dd></div>
              <div><dt className="text-muted">Source</dt><dd><a className="text-info underline" href={card.sourceUrl}>{card.sourceTitle}</a></dd></div>
            </dl>
            {card.fallback ? <p className="mt-3">{card.scopeNote}</p> : null}
            <button type="button" className="mt-4 min-h-12 rounded-full bg-primary px-5 text-white" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
