import { RoomClient } from "@/components/chat/room-client";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("room");
  return (
    <div>
      <h1 className="mb-4 font-display text-4xl">{t("title")}</h1>
      <RoomClient locale={locale} />
    </div>
  );
}
