import { Link } from "@/lib/i18n/navigation";
import { LanguageTile } from "@/components/ui/language-tile";
import { getTranslations, setRequestLocale } from "next-intl/server";

const langs = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "mr", name: "मराठी" },
  { code: "ta", name: "தமிழ்" },
];

export default async function StartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("start");
  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h1 className="font-display text-4xl sm:text-5xl">{t("title")}</h1>
      <div>
        <p className="mb-3 text-sm font-semibold text-muted">Language</p>
        <div className="grid grid-cols-2 gap-3">
          {langs.map((lang) => (
            <LanguageTile key={lang.code} code={lang.code} name={lang.name} active={lang.code === locale} />
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/onboarding?who=learner&mode=solo" className="flex min-h-20 items-center justify-center rounded-[var(--radius-card)] bg-neem p-4 text-center font-semibold shadow-[0_4px_16px_rgba(var(--shadow),0.06)] active:scale-[0.98]">{t("learner")}</Link>
        <Link href="/onboarding?who=parent&mode=solo" className="flex min-h-20 items-center justify-center rounded-[var(--radius-card)] bg-clay p-4 text-center font-semibold active:scale-[0.98]">{t("parent")}</Link>
        <Link href="/onboarding?who=together&mode=together" className="flex min-h-20 items-center justify-center rounded-[var(--radius-card)] bg-primary-soft p-4 text-center font-semibold text-primary active:scale-[0.98]">{t("together")}</Link>
      </div>
      <Link href="/onboarding?who=parent&mode=assisted&assisted=1" className="block rounded-[var(--radius-card)] border border-line bg-warm p-5 shadow-[0_8px_24px_rgba(var(--shadow),0.06)]">
        <span className="text-xl font-semibold">{t("assisted")}</span>
        <p className="mt-2 text-muted">{t("assistedHint")}</p>
      </Link>
    </div>
  );
}
