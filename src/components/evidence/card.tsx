"use client";

import { useState } from "react";
import type { EvidenceCard } from "@/data/services/outcomes";
import { IconArray, RangeBar, VerificationBadge } from "@/components/ui/primitives";
import { EvidenceDrawer, SourceStrip } from "@/components/evidence/drawer";
import { formatInr } from "@/lib/format/money";

export function EvidenceCardView({ card, locale }: { card: EvidenceCard; locale: string }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-[0_8px_24px_rgba(var(--shadow),0.08)]">
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
      <SourceStrip title={card.sourceTitle} url={card.sourceUrl} period={card.period} n={card.cohortSize} />
      <button type="button" className="mt-3 min-h-12 font-semibold text-info" onClick={() => setOpen(true)}>
        Show proof
      </button>
      <EvidenceDrawer card={card} open={open} onClose={() => setOpen(false)} />
    </article>
  );
}
