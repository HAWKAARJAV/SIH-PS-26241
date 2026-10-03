import { getLandingEvidencePreview } from "@/data/services/landing";
import { IconArray, RangeBar, VerificationBadge } from "@/components/ui/primitives";
import { formatInr } from "@/lib/format/money";
import { getTranslations } from "next-intl/server";

export async function HeroEvidencePreview({ locale }: { locale: string }) {
  const t = await getTranslations();
  const preview = await getLandingEvidencePreview(locale);
  const { card, tradeName, nsqfLevel } = preview;

  if (!card) {
    return (
      <div className="mt-4 rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
        {t("home.noVerifiedYet")}
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      {card.p25 != null && card.median != null && card.p75 != null ? (
        <div className="rounded-2xl bg-surface p-3 text-sm shadow">
          <div className="flex flex-wrap items-center gap-2">
            <VerificationBadge tier={card.tier} />
            <span className="text-muted">{card.label}</span>
          </div>
          <p className="mt-2 tabular text-base font-semibold">{card.rangeLabel}</p>
          <RangeBar p25={card.p25} median={card.median} p75={card.p75} />
          <p className="mt-1 text-muted">
            {card.period} · n={card.cohortSize} · {card.sourceTitle}
          </p>
        </div>
      ) : null}
      {card.outOfTen != null ? (
        <div className="rounded-2xl bg-growth-soft p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <IconArray filled={card.outOfTen} />
            <VerificationBadge tier={card.tier} />
          </div>
          <p className="mt-1 tabular font-semibold">
            {card.outOfTen} {t("evidence.outOfTen")}
          </p>
          <p className="text-muted">{card.placedDefinition}</p>
        </div>
      ) : null}
      {tradeName && nsqfLevel ? (
        <div className="rounded-2xl bg-info-soft p-3 text-sm">
          {t("home.ladderChip", { trade: tradeName, level: String(nsqfLevel) })}
          {card.median != null ? (
            <span className="text-muted">
              {" "}
              · {formatInr(card.median, locale)} {t("evidence.medianShort")}
            </span>
          ) : null}
        </div>
      ) : null}
      {card.fallback ? <p className="text-xs text-muted">{card.scopeNote}</p> : null}
    </div>
  );
}
