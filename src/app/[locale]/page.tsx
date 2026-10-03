import { BRAND } from "@/config/brand";
import { Link } from "@/lib/i18n/navigation";
import { Courtyard } from "@/components/ui/primitives";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{BRAND.name}</p>
        <h1 className="mt-2 font-display text-5xl leading-tight sm:text-6xl">
          {locale === "en" ? <>Skills that <span className="hand-underline">feed</span> a family.</> : t("home.title")}
        </h1>
        <p className="prose-measure mt-4 text-xl text-muted">{t("home.lede")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/start?mode=together" className="inline-flex min-h-12 items-center rounded-full bg-primary px-5 font-semibold text-white">{t("home.together")}</Link>
          <Link href="/start?mode=solo" className="inline-flex min-h-12 items-center rounded-full border border-line bg-surface px-5 font-semibold">{t("home.justMe")}</Link>
        </div>
        <ul className="mt-8 space-y-2 text-base">
          <li>{t("home.trust1")}</li>
          <li>{t("home.trust2")}</li>
          <li>{t("home.trust3")}</li>
        </ul>
      </div>
      <div className="relative rounded-[28px] border border-line bg-warm p-6 shadow-[0_20px_48px_rgba(98,60,28,0.10)]">
        <Courtyard className="h-40 w-full" />
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl bg-surface p-3 text-sm shadow">₹12,000 – ₹16,000 – ₹22,000 · demo data</div>
          <div className="rounded-2xl bg-growth-soft p-3 text-sm">7 out of 10 placed · V0</div>
          <div className="rounded-2xl bg-info-soft p-3 text-sm">Skill ladder · check on NQR</div>
        </div>
      </div>
    </div>
  );
}
