import { BRAND } from "@/config/brand";
import { Link } from "@/lib/i18n/navigation";
import { HeroEvidencePreview } from "@/components/evidence/hero-preview";
import { HeroScene } from "@/components/landing/hero-scene";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <div className="space-y-10">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{BRAND.name}</p>
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
      <ul className="grid gap-3 sm:grid-cols-3">
        {[t("home.trust1"), t("home.trust2"), t("home.trust3")].map((line) => (
          <li key={line} className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3 text-sm font-medium shadow-[0_4px_16px_rgba(var(--shadow),0.05)]">{line}</li>
        ))}
      </ul>
    </div>
  );
}
