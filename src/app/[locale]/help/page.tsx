import { HELPLINES } from "@/config/helplines";
import { setRequestLocale } from "next-intl/server";

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <article className="space-y-3">
      <h1 className="font-display text-4xl">Help</h1>
      <p>Tap the mic in the Family Room, speak, and read the words that appear. If you opened this inside WhatsApp, speech may be missing. Open in Chrome, or type.</p>
      <p>Text can grow from the browser zoom. Large text and high contrast stay in light colours.</p>
      <ul>{HELPLINES.map((h) => <li key={h.id}>{h.name}: {h.number}</li>)}</ul>
    </article>
  );
}
