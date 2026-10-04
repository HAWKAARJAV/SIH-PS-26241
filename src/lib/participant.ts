import { createHmac, timingSafeEqual } from "crypto";

export type Participant = { sessionId: string; role: "PARENT" | "LEARNER"; exp: number };

function secret() {
  return process.env.AUTH_SECRET ?? "nourish-demo-participant";
}

export function signParticipant(sessionId: string, role: "PARENT" | "LEARNER", ttlMs = 24 * 60 * 60 * 1000): string {
  const payload = Buffer.from(JSON.stringify({ sessionId, role, exp: Date.now() + ttlMs })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readParticipant(token: string | undefined | null): Participant | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Participant;
    if (parsed.exp < Date.now()) return null;
    if (parsed.role !== "PARENT" && parsed.role !== "LEARNER") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function participantFromRequest(request: Request): Participant | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)nourish_participant=([^;]+)/);
  return readParticipant(match?.[1] ? decodeURIComponent(match[1]) : null);
}
