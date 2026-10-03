export type LlmMessage = { role: "system" | "user" | "assistant"; content: string };

export interface LlmProvider {
  id: string;
  complete(messages: LlmMessage[], opts: { timeoutMs: number; model: string }): Promise<string>;
}

export class LlmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmError";
  }
}
