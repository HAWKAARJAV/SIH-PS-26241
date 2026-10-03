import { BRAND } from "@/config/brand";
import { FAMILY_WORRIES } from "@/lib/worries";
import { Link } from "@/lib/i18n/navigation";
import { HeroEvidencePreview } from "@/components/evidence/hero-preview";
import { HeroScene } from "@/components/landing/hero-scene";
import { getTranslations, setRequestLocale } from "next-intl/server";

const outcomes = ["o1", "o2", "o3", "o4", "o5"] as const;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <div className="space-y-12">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("home.kicker")}</p>
          <h1 className="mt-2 font-display text-5xl leading-tight sm:text-6xl">
            {locale === "en" ? <>Skills that <span className="hand-underline">feed</span> a family.</> : t("home.title")}
          </h1>
          <p className="prose-measure mt-4 text-xl text-muted">{t("home.lede")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/start?mode=together" className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-semibold text-white shadow-[0_8px_24px_rgba(var(--shadow),0.12)] transition-transform active:scale-[0.98]">{t("home.together")}</Link>
            <Link href="/start?mode=solo" className="inline-flex min-h-12 items-center rounded-full border border-line bg-surface px-6 font-semibold transition-transform active:scale-[0.98]">{t("home.justMe")}</Link>
            <Link href="/demo" className="inline-flex min-h-12 items-center rounded-full bg-info-soft px-6 font-semibold text-info">{t("common.demo")}</Link>
          </div>
        </div>
        <HeroScene>
          <HeroEvidencePreview locale={locale} />
        </HeroScene>
      </div>
      <p className="prose-measure text-lg">{t("home.problem")}</p>
      <ul className="grid gap-3 sm:grid-cols-3">
        {[t("home.trust1"), t("home.trust2"), t("home.trust3")].map((line) => (
          <li key={line} className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3 text-sm font-medium shadow-[0_4px_16px_rgba(var(--shadow),0.05)]">{line}</li>
        ))}
      </ul>
      <section>
        <h2 className="font-display text-3xl">{t("home.outcomesTitle")}</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-2">
          {outcomes.map((key, index) => (
            <li key={key} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
              <p className="text-sm font-semibold text-primary">{BRAND.name} · {index + 1}</p>
              <h3 className="mt-1 font-display text-2xl">{t(`home.${key}t`)}</h3>
              <p className="mt-2 text-muted">{t(`home.${key}b`)}</p>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h2 className="font-display text-3xl">{t("home.askTitle")}</h2>
        <p className="mt-2 max-w-2xl text-muted">{t("home.askHint")}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {FAMILY_WORRIES.map((worry) => (
            <li key={worry.id}>
              <Link
                href={`/onboarding?who=together&mode=together&worry=${worry.id}`}
                className="inline-flex min-h-12 items-center rounded-full border border-line bg-warm px-4 font-semibold"
              >
                {t(`room.chips.${worry.chip}`)}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4">
          <Link href="/admin/login" className="font-semibold text-info underline">{t("home.staff")}</Link>
        </p>
      </section>
    </div>
  );
}
