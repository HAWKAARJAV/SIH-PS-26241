import MiniSearch from "minisearch";
import { prisma } from "@/lib/db";

type Doc = { id: string; title: string; body: string; topic: string; tier: string };

const caches = new Map<string, MiniSearch<Doc>>();

async function indexForLocale(locale: string): Promise<MiniSearch<Doc>> {
  const hit = caches.get(locale);
  if (hit) return hit;
  const cards = await prisma.knowledgeCard.findMany({
    include: { translations: { where: { locale } } },
  });
  const docs: Doc[] = cards.map((c) => {
    const tr = c.translations[0];
    return {
      id: c.id,
      title: tr?.title ?? c.title,
      body: tr?.body ?? c.body,
      topic: c.topic,
      tier: c.tier,
    };
  });
  const ms = new MiniSearch<Doc>({
    fields: ["title", "body", "topic"],
    storeFields: ["id", "title", "body", "topic", "tier"],
  });
  ms.addAll(docs);
  caches.set(locale, ms);
  return ms;
}

export async function searchKnowledge(locale: string, query: string, limit = 3) {
  const ms = await indexForLocale(locale);
  const q = query.trim();
  if (!q) return [];
  return ms.search(q, { prefix: true, fuzzy: 0.15 }).slice(0, limit).map((r) => ({
    id: r.id,
    title: String(r.title),
    snippet: String(r.body).slice(0, 160),
    topic: String(r.topic),
    tier: String(r.tier),
    score: r.score,
  }));
}

export function detectTradeSlugs(text: string, known: string[]): string[] {
  const lower = text.toLowerCase();
  return known.filter((slug) => lower.includes(slug.replaceAll("-", " ")) || lower.includes(slug));
}
