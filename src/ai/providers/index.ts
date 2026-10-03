import { readEnv } from "@/config/env";
import type { LlmProvider } from "./types";
import { LlmError } from "./types";

async function postJson(url: string, body: unknown, headers: Record<string, string>, timeoutMs: number): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new LlmError(`Provider HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export function getProvider(): LlmProvider | null {
  const env = readEnv();
  if (env.LLM_PROVIDER === "gemini" && env.GEMINI_API_KEY) {
    return {
      id: "gemini",
      async complete(messages, opts) {
        const model = opts.model || env.LLM_MODEL;
        if (!model) throw new LlmError("LLM_MODEL is required for Gemini");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
        const data = (await postJson(
          url,
          {
            contents: messages.filter((m) => m.role !== "system").map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
            systemInstruction: { parts: [{ text: messages.find((m) => m.role === "system")?.content ?? "" }] },
          },
          {},
          opts.timeoutMs,
        )) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new LlmError("Empty Gemini response");
        return text;
      },
    };
  }
  if (env.LLM_PROVIDER === "openai_compat" && env.OPENAI_COMPAT_API_KEY && env.OPENAI_COMPAT_BASE_URL) {
    return {
      id: "openai_compat",
      async complete(messages, opts) {
        const model = opts.model || env.LLM_MODEL;
        if (!model) throw new LlmError("LLM_MODEL is required for OpenAI-compatible provider");
        const data = (await postJson(
          `${env.OPENAI_COMPAT_BASE_URL.replace(/\/$/, "")}/chat/completions`,
          { model, messages },
          { authorization: `Bearer ${env.OPENAI_COMPAT_API_KEY}` },
          opts.timeoutMs,
        )) as { choices?: { message?: { content?: string } }[] };
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new LlmError("Empty OpenAI-compatible response");
        return text;
      },
    };
  }
  if (env.LLM_PROVIDER === "anthropic" && env.ANTHROPIC_API_KEY) {
    return {
      id: "anthropic",
      async complete(messages, opts) {
        const model = opts.model || env.LLM_MODEL;
        if (!model) throw new LlmError("LLM_MODEL is required for Anthropic");
        const data = (await postJson(
          "https://api.anthropic.com/v1/messages",
          {
            model,
            max_tokens: 800,
            system: messages.find((m) => m.role === "system")?.content ?? "",
            messages: messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content })),
          },
          { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
          opts.timeoutMs,
        )) as { content?: { text?: string }[] };
        const text = data.content?.[0]?.text;
        if (!text) throw new LlmError("Empty Anthropic response");
        return text;
      },
    };
  }
  return null;
}
