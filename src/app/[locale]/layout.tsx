import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { FamilyShell } from "@/components/layout/shell";
import { LocaleAttr } from "@/components/locale-attr";
import { routing, type Locale } from "@/lib/i18n/routing";
import type { ReactNode } from "react";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleAttr locale={locale} />
      <FamilyShell>{children}</FamilyShell>
    </NextIntlClientProvider>
  );
}
