import { z } from "zod";

export const objectionSchema = z.object({
  tag: z.string(),
  speaker: z.string(),
  intensity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({ type: z.literal("evidence"), factIds: z.array(z.string()) }),
  z.object({ type: z.literal("ladder"), tradeSlug: z.string() }),
  z.object({ type: z.literal("compare"), options: z.array(z.string()) }),
  z.object({ type: z.literal("question"), text: z.string() }),
  z.object({ type: z.literal("actions"), actions: z.array(z.string()) }),
]);

export const aiTurnSchema = z.object({
  language: z.string(),
  blocks: z.array(blockSchema),
  objections: z.array(objectionSchema),
  sentiment: z.object({ parent: z.number().min(-1).max(1).optional(), learner: z.number().min(-1).max(1).optional() }),
  stance: z.object({
    parent: z.enum(["OPEN", "HESITANT", "RESISTANT", "VETO"]).optional(),
    learner: z.enum(["OPEN", "HESITANT", "RESISTANT", "VETO"]).optional(),
  }),
  usedFactIds: z.array(z.string()),
  needsHuman: z.object({ flag: z.boolean(), reason: z.string().optional() }),
  suggestedChips: z.array(z.string()),
});

export type AiTurn = z.infer<typeof aiTurnSchema>;

export const llmJsonSchema = z.object({
  language: z.string(),
  text: z.string(),
  usedFactIds: z.array(z.string()).default([]),
});
