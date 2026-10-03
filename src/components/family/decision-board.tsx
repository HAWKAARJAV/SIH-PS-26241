"use client";

import { worryChip } from "@/lib/worries";
import { useTranslations } from "next-intl";

type Concern = { tag: string; intensity: number; speaker: string };

export function DecisionBoard({
  concerns,
  speaker,
  evidenceSeen,
  presetWorry,
}: {
  concerns: Concern[];
  speaker: "PARENT" | "LEARNER" | "TOGETHER";
  evidenceSeen: boolean;
  presetWorry?: string | null;
}) {
  const t = useTranslations("room");
  const parentOn = speaker === "PARENT" || speaker === "TOGETHER";
  const learnerOn = speaker === "LEARNER" || speaker === "TOGETHER";

  return (
    <section className="mb-4 rounded-[var(--radius-sheet)] border border-line bg-warm p-4 shadow-[0_8px_24px_rgba(var(--shadow),0.06)]">
      <h2 className="font-display text-2xl">{t("boardTitle")}</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Seat label={t("parentSeat")} on={parentOn} tone="bg-clay" />
        <Seat label={t("learnerSeat")} on={learnerOn} tone="bg-neem" />
      </div>
      <p className="mt-3 text-sm text-muted">{t("boardRule")}</p>
      <h3 className="mt-4 text-sm font-semibold">{t("openWorries")}</h3>
      {concerns.length === 0 ? (
        <p className="mt-1 text-sm">
          {presetWorry && worryChip(presetWorry) ? `${t("cameWith")} ${t(`chips.${worryChip(presetWorry)}`)}` : t("noWorry")}
        </p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {concerns.map((c) => {
            const chip = worryChip(c.tag);
            const label = chip ? t(`chips.${chip}`) : c.tag.replaceAll("_", " ").toLowerCase();
            return (
              <li key={`${c.tag}-${c.speaker}`} className="rounded-full bg-surface px-3 py-2 text-sm font-semibold">
                {c.speaker === "PARENT" ? t("parent") : c.speaker === "LEARNER" ? t("learner") : c.speaker}: {label}
                <span className="ml-2 text-muted">{t("strength", { n: c.intensity })}</span>
              </li>
            );
          })}
        </ul>
      )}
      {evidenceSeen ? <p className="mt-3 text-sm font-semibold text-growth">{t("evidenceIn")}</p> : null}
    </section>
  );
}

function Seat({ label, on, tone }: { label: string; on: boolean; tone: string }) {
  return (
    <p className={`flex min-h-12 items-center rounded-full px-4 font-semibold ${on ? `${tone} text-ink` : "border border-line bg-surface text-muted"}`}>
      {label}
    </p>
  );
}
