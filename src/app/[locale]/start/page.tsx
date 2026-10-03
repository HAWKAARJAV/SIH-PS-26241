import { Link } from "@/lib/i18n/navigation";
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
  const t = await getTranslations();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">{t("start.title")}</h1>
      <div className="grid grid-cols-2 gap-3">
        {langs.map((lang) => (
          <Link key={lang.code} href="/start" locale={lang.code} className="flex min-h-16 items-center justify-center rounded-[20px] border border-line bg-surface text-xl font-semibold">
            {lang.name}
          </Link>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/onboarding?who=learner&mode=solo" className="min-h-16 rounded-[20px] bg-neem p-4 font-semibold">{t("start.learner")}</Link>
        <Link href="/onboarding?who=parent&mode=solo" className="min-h-16 rounded-[20px] bg-clay p-4 font-semibold">{t("start.parent")}</Link>
        <Link href="/onboarding?who=together&mode=together" className="min-h-16 rounded-[20px] bg-primary-soft p-4 font-semibold">{t("start.together")}</Link>
      </div>
      <Link href="/onboarding?who=parent&mode=assisted&assisted=1" className="block rounded-[20px] border border-line bg-warm p-4">
        <span className="text-xl font-semibold">{t("start.assisted")}</span>
        <p className="mt-1 text-muted">{t("start.assistedHint")}</p>
      </Link>
    </div>
  );
}
