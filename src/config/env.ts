import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().default("file:./dev.db"),
  AUTH_SECRET: z.string().default("nourish-dev-auth-secret-change-me"),
  APP_URL: z.string().default("http://localhost:3000"),
  DEMO_MODE: z.string().optional(),
  LLM_PROVIDER: z.enum(["gemini", "openai_compat", "anthropic", "none"]).default("none"),
  LLM_MODEL: z.string().default(""),
  GEMINI_API_KEY: z.string().default(""),
  OPENAI_COMPAT_BASE_URL: z.string().default(""),
  OPENAI_COMPAT_API_KEY: z.string().default(""),
  ANTHROPIC_API_KEY: z.string().default(""),
  SPEECH_PROVIDER: z.enum(["browser", "bhashini", "sarvam"]).default("browser"),
  BHASHINI_API_KEY: z.string().default(""),
  BHASHINI_USER_ID: z.string().default(""),
  SARVAM_API_KEY: z.string().default(""),
  SEED_ADMIN_PASSWORD: z.string().default("nourish-demo-admin"),
  RETENTION_DAYS: z.coerce.number().default(90),
  K_ANON_MIN: z.coerce.number().default(10),
  MIN_COHORT: z.coerce.number().default(20),
});

export type AppEnv = z.infer<typeof schema>;

export function readEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return schema.parse(source);
}

export function isDemoMode(env: AppEnv = readEnv()): boolean {
  if (env.DEMO_MODE === "false") {
    const hasKey =
      (env.LLM_PROVIDER === "gemini" && env.GEMINI_API_KEY.length > 0) ||
      (env.LLM_PROVIDER === "openai_compat" && env.OPENAI_COMPAT_API_KEY.length > 0) ||
      (env.LLM_PROVIDER === "anthropic" && env.ANTHROPIC_API_KEY.length > 0);
    return !hasKey;
  }
  if (env.DEMO_MODE === "true") return true;
  const hasKey =
    (env.LLM_PROVIDER === "gemini" && env.GEMINI_API_KEY.length > 0) ||
    (env.LLM_PROVIDER === "openai_compat" && env.OPENAI_COMPAT_API_KEY.length > 0) ||
    (env.LLM_PROVIDER === "anthropic" && env.ANTHROPIC_API_KEY.length > 0);
  return !hasKey || env.LLM_PROVIDER === "none";
}
