import { randomUUID } from "crypto";
import { z } from "zod";
import { isDemoMode } from "@/config/env";
import { scriptedTurn } from "@/ai/scripted/brain";
import { guardReply, resolveSlots, type FactSlot } from "@/ai/guard/number-guard";
import { redactPii } from "@/lib/privacy/redact";
import { getProvider } from "@/ai/providers";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db";
import { resolveEvidence } from "@/data/services/outcomes";
import { SENSITIVE } from "@/ai/scripted/taxonomy";

const turnSchema = z.object({
  language: z.string(),
  text: z.string(),
  usedFactIds: z.array(z.string()),
});

export async function runTurn(input: {
  sessionId: string;
  text: string;
  speaker: "PARENT" | "LEARNER" | "TOGETHER";
}) {
  const started = Date.now();
  const session = await prisma.session.findUnique({
    where: { id: input.sessionId },
    include: { family: { include: { persons: true } }, messages: true, objections: true },
  });
  if (!session || session.family.deletedAt) throw new Error("Session not found");
  const redacted = redactPii(input.text);
  const girl = session.family.persons.some((p) => p.gender === "girl");
  const tradeInterest = session.family.persons.find((p) => p.interests)?.interests.split(",")[0] || "electrician";
  const parentSilent = countParentSilence(session.messages.map((m) => m.speaker));
  const sameTag = session.objections.filter((o) => o.status === "open").length;
  const evidence = await resolveEvidence({
    tradeId: `tr-${tradeInterest}`,
    districtId: session.family.districtId,
    stateId: session.family.stateId,
    locale: session.locale,
  });
  const scripted = scriptedTurn({
    text: redacted,
    locale: session.locale,
    speaker: input.speaker,
    parentSilentTurns: parentSilent,
    tradeSlug: tradeInterest,
    girl,
    attemptCount: sameTag >= 2 ? 2 : 0,
    hasVerifiedFact: Boolean(evidence.card),
  });
  let provider = "scripted";
  let fallback = true;
  let rawText = scripted.blocks.filter((b) => b.type === "text" || b.type === "question").map((b) => ("text" in b ? b.text : "")).join(" ");
  if (!isDemoMode()) {
    const llm = getProvider();
    if (llm) {
      try {
        const completion = await llm.complete(
          [
            { role: "system", content: "Reply as Disha. Use only {{fact:ID}} tokens for numbers. Never invent digits. Return JSON {language,text,usedFactIds}." },
            { role: "user", content: redacted },
          ],
          { timeoutMs: 12000, model: process.env.LLM_MODEL ?? "" },
        );
        const parsed = turnSchema.safeParse(JSON.parse(completion));
        if (parsed.success) {
          rawText = parsed.data.text;
          provider = llm.id;
          fallback = false;
        }
      } catch (error) {
        logger.warn({ err: error }, "llm fallback");
      }
    }
  }
  const facts: Record<string, FactSlot> = {};
  if (evidence.card) {
    facts[evidence.card.id] = {
      id: evidence.card.id,
      tier: evidence.card.tier,
      valueLabel: evidence.card.valueLabel,
      rangeLabel: evidence.card.rangeLabel,
      rateLabel: evidence.card.rateLabel,
    };
    facts[`outcome:${tradeInterest}`] = facts[evidence.card.id]!;
  }
  let resolved = resolveSlots(rawText, facts);
  const allow: string[] = [...(redacted.match(/\d+/g) ?? []), "10", "8", "12"];
  let guard = guardReply(resolved.text, allow);
  if (!guard.ok) {
    rawText = scripted.blocks.filter((b) => b.type === "text" || b.type === "question").map((b) => ("text" in b ? b.text : "")).join(" ");
    resolved = resolveSlots(rawText, facts);
    guard = guardReply(resolved.text, allow);
    provider = "scripted";
    fallback = true;
  }
  if (!guard.ok) {
    resolved = { text: "I will not state a number I cannot show from the dataset. A counsellor can help.", usedFactIds: [], missing: [] };
    guard = { ok: true, violations: [] };
  }
  const needsHuman = scripted.needsHuman.flag || SENSITIVE.test(redacted);
  const trace = {
    language: scripted.language,
    tags: scripted.objections.map((o) => o.tag),
    factIds: evidence.card ? [evidence.card.id] : [],
    guard: guard.ok,
    escalation: needsHuman,
    latencyMs: Date.now() - started,
    provider,
    fallback,
    scripted: fallback,
  };
  const now = new Date().toISOString();
  await prisma.message.create({
    data: { id: randomUUID(), sessionId: session.id, speaker: input.speaker, text: redacted, redacted, lang: scripted.language, createdAt: now },
  });
  const reply = await prisma.message.create({
    data: {
      id: randomUUID(),
      sessionId: session.id,
      speaker: "DISHA",
      text: resolved.text,
      redacted: resolved.text,
      lang: scripted.language,
      traceJson: JSON.stringify(trace),
      createdAt: now,
    },
  });
  for (const objection of scripted.objections) {
    await prisma.objectionEvent.create({
      data: {
        id: randomUUID(),
        sessionId: session.id,
        tag: objection.tag,
        speaker: objection.speaker,
        intensity: objection.intensity,
        status: "open",
        createdAt: now,
      },
    });
  }
  if (scripted.sentiment.parent != null || scripted.sentiment.learner != null) {
    await prisma.sentimentSample.create({
      data: { id: randomUUID(), sessionId: session.id, parent: scripted.sentiment.parent, learner: scripted.sentiment.learner, createdAt: now },
    });
  }
  await prisma.stanceSample.create({
    data: { id: randomUUID(), sessionId: session.id, parent: scripted.stance.parent, learner: scripted.stance.learner, createdAt: now },
  });
  if (evidence.card) {
    await prisma.evidenceView.create({ data: { id: randomUUID(), sessionId: session.id, factId: evidence.card.id, createdAt: now } });
  }
  return {
    message: reply,
    trace,
    card: scripted.usedFactIds.length > 0 ? evidence.card : null,
    needsHuman,
    reason: scripted.needsHuman.reason,
    chips: scripted.suggestedChips,
    objections: scripted.objections,
    sentiment: scripted.sentiment,
    stance: scripted.stance,
    helplines: needsHuman && SENSITIVE.test(redacted),
  };
}

function countParentSilence(speakers: string[]) {
  let n = 0;
  for (let i = speakers.length - 1; i >= 0; i--) {
    if (speakers[i] === "PARENT") break;
    if (speakers[i] === "LEARNER") n += 1;
  }
  return n;
}
