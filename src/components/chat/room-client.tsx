"use client";

import { DecisionBoard } from "@/components/family/decision-board";
import { EvidenceCardView } from "@/components/evidence/card";
import { JudgePanel } from "@/components/chat/judge-panel";
import { ChatBubble, QuickReplyChips, TypingIndicator } from "@/components/ui/chat";
import { ConsensusMeter, StageStepper } from "@/components/ui/meter";
import { VoiceButton, SpeakerButton } from "@/components/ui/voice";
import type { EvidenceCard } from "@/data/services/outcomes";
import { worryChip } from "@/lib/worries";
import { HELPLINES } from "@/config/helplines";
import { BRAND } from "@/config/brand";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type Msg = { id: string; speaker: string; text: string; card?: EvidenceCard | null; trace?: unknown };
type Concern = { tag: string; intensity: number; speaker: string };

const STAGES = ["Understand", "Explore", "Compare", "Decide", "Plan"];

type Recog = {
  lang: string;
  start: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
};

const CHIP_KEYS = ["income", "job", "status", "girls", "degree", "fees"] as const;

export function RoomClient({ locale }: { locale: string }) {
  const t = useTranslations("room");
  const tCommon = useTranslations("common");
  const chips = useMemo(() => CHIP_KEYS.map((k) => t(`chips.${k}`)), [t]);
  const [speaker, setSpeaker] = useState<"PARENT" | "LEARNER" | "TOGETHER">("PARENT");
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [join, setJoin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [judge, setJudge] = useState(false);
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [rate, setRate] = useState(1);
  const [wiped, setWiped] = useState(false);
  const [inApp, setInApp] = useState(false);
  const [live, setLive] = useState<"Live" | "Reconnecting" | "">("");
  const [presetWorry, setPresetWorry] = useState<string | null>(null);

  useEffect(() => {
    setJudge(localStorage.getItem("nourish.judge") === "1");
    setSessionId(localStorage.getItem("nourish.session"));
    setJoin(localStorage.getItem("nourish.join") ?? "");
    setInApp(/WhatsApp|Instagram|FBAN|FBAV/i.test(navigator.userAgent));
    try {
      const profile = JSON.parse(localStorage.getItem("nourish.profile") ?? "{}") as { worry?: string };
      setPresetWorry(profile.worry ?? null);
    } catch {
      setPresetWorry(null);
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let stop = false;
    async function pull() {
      const res = await fetch(`/api/v1/sessions/${sessionId}`);
      if (!res.ok || stop) return;
      const data = (await res.json()) as { joinCode: string; messages: Msg[]; objections: Concern[] };
      setJoin(data.joinCode);
      localStorage.setItem("nourish.join", data.joinCode);
      setMsgs((prev) => data.messages.map((m) => ({ ...m, card: prev.find((p) => p.id === m.id)?.card })));
      setConcerns(data.objections);
    }
    void pull();
    let timer: number | undefined;
    let source: EventSource | null = null;
    function startPoll() {
      setLive("Reconnecting");
      timer = window.setInterval(() => void pull(), 2000);
    }
    if (typeof EventSource !== "undefined") {
      source = new EventSource(`/api/v1/rooms/${sessionId}/events`);
      source.onopen = () => setLive("Live");
      source.onmessage = () => void pull();
      source.onerror = () => {
        source?.close();
        if (!timer) startPoll();
      };
    } else {
      startPoll();
    }
    return () => {
      stop = true;
      source?.close();
      if (timer) window.clearInterval(timer);
    };
  }, [sessionId]);

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("nourish.profile") ?? "{}") as { assisted?: string | boolean };
    if (profile.assisted !== "1" && profile.assisted !== true) return;
    const timer = window.setTimeout(() => {
      localStorage.removeItem("nourish.session");
      localStorage.removeItem("nourish.family");
      localStorage.removeItem("nourish.join");
      setMsgs([]);
      setSessionId(null);
      setJoin("");
      setWiped(true);
    }, 5 * 60 * 1000);
    return () => window.clearTimeout(timer);
  }, [text, msgs.length]);

  async function ensureSession() {
    if (sessionId) return sessionId;
    const profile = JSON.parse(localStorage.getItem("nourish.profile") ?? "{}") as Record<string, string>;
    const res = await fetch("/api/v1/families", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        locale,
        mode: profile.mode ?? "together",
        stateId: profile.stateId ?? "st-up",
        districtId: profile.districtId ?? "d-neemganj",
        incomeBand: profile.incomeBand ?? "prefer-not",
        worry: profile.worry ?? "INCOME_POTENTIAL",
        assisted: profile.assisted === "1",
        persons: [
          { role: "PARENT", ageBand: "adult", gender: "skip" },
          { role: "LEARNER", ageBand: profile.ageBand ?? "18-25", gender: profile.gender ?? "skip", interests: profile.interest ?? "electrician", classDone: profile.classDone ?? "10" },
        ],
        consents: ["counselling"],
      }),
    });
    if (!res.ok) throw new Error("Could not open a room");
    const data = (await res.json()) as { sessionId: string; joinCode: string };
    localStorage.setItem("nourish.session", data.sessionId);
    localStorage.setItem("nourish.join", data.joinCode);
    setJoin(data.joinCode);
    setSessionId(data.sessionId);
    return data.sessionId;
  }

  async function send(value: string) {
    setError("");
    setBusy(true);
    try {
      const id = await ensureSession();
      setMsgs((m) => [...m, { id: crypto.randomUUID(), speaker, text: value }]);
      const dishaId = crypto.randomUUID();
      setMsgs((m) => [...m, { id: dishaId, speaker: "DISHA", text: "" }]);
      const res = await fetch("/api/v1/chat/stream", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: id, text: value, speaker }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Chat failed");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data: ")) continue;
          const payload = JSON.parse(line.slice(6)) as { type: string; text?: string; message?: Msg; card?: EvidenceCard; trace?: unknown; objections?: Concern[] };
          if (payload.type === "token" && payload.text) {
            full += payload.text;
            setMsgs((m) => m.map((row) => (row.id === dishaId ? { ...row, text: full } : row)));
          }
          if (payload.type === "done" && payload.message) {
            setMsgs((m) =>
              m.map((row) =>
                row.id === dishaId
                  ? { ...row, id: payload.message!.id, text: payload.message!.text, card: payload.card ?? null, trace: payload.trace }
                  : row,
              ),
            );
            setConcerns(payload.objections ?? []);
          }
          if (payload.type === "error") throw new Error("Stream failed");
        }
      }
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setBusy(false);
    }
  }

  function speak(line: string) {
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(line);
    utter.lang = locale === "ta" ? "ta-IN" : locale === "mr" ? "mr-IN" : locale === "hi" ? "hi-IN" : "en-IN";
    utter.rate = rate;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function listen() {
    const host = window as Window & { SpeechRecognition?: new () => Recog; webkitSpeechRecognition?: new () => Recog };
    const Ctor = host.SpeechRecognition ?? host.webkitSpeechRecognition;
    if (!Ctor) {
      setError("This browser has no mic. Open in Chrome, or type.");
      return;
    }
    const rec = new Ctor();
    rec.lang = locale === "ta" ? "ta-IN" : locale === "mr" ? "mr-IN" : locale === "hi" ? "hi-IN" : "en-IN";
    rec.onerror = () => setError("The mic did not catch that. Try again, or type.");
    rec.onresult = (ev) => {
      const said = ev.results[0]?.[0]?.transcript ?? "";
      if (said) void send(said);
    };
    rec.start();
  }

  async function report(messageId: string, kind: "report" | "wrong_number") {
    await fetch("/api/v1/flags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, messageId, kind, note: "" }),
    });
    setError(kind === "wrong_number" ? "Marked as a wrong number." : "Reported. Thank you.");
  }

  const evidenceSeen = msgs.some((m) => m.card);
  const userTurns = msgs.filter((m) => m.speaker !== "DISHA").length;
  const stage =
    evidenceSeen && userTurns > 4
      ? "Compare"
      : evidenceSeen
        ? "Explore"
        : STAGES[Math.min(STAGES.length - 1, Math.floor(userTurns / 2))] ?? "Understand";
  const alignment = concerns.length === 0 ? "Still listening" : concerns.length === 1 ? "One shared worry" : "More than one worry is open";

  function labelFor(role: string) {
    if (role === "DISHA") return `${BRAND.persona} · ${tCommon("aiLabel")}`;
    if (role === "PARENT") return t("parent");
    if (role === "LEARNER") return t("learner");
    return role;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section>
        <DecisionBoard concerns={concerns} speaker={speaker} evidenceSeen={evidenceSeen} presetWorry={presetWorry} />
        <p className="mb-2 text-sm font-semibold text-muted">{t("stageLabel")}</p>
        <StageStepper stages={STAGES} current={stage} />
        <p className="mb-2 mt-4 text-sm font-semibold" id="who-speaks">{t("whoSpeaks")}</p>
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-labelledby="who-speaks">
          {(["PARENT", "LEARNER", "TOGETHER"] as const).map((role) => (
            <button
              key={role}
              type="button"
              aria-pressed={speaker === role}
              className={`min-h-12 rounded-full px-4 font-semibold transition-transform active:scale-[0.98] ${speaker === role ? "bg-primary text-white" : "border border-line bg-surface"}`}
              onClick={() => setSpeaker(role)}
            >
              {role === "PARENT" ? t("parent") : role === "LEARNER" ? t("learner") : t("together")}
            </button>
          ))}
        </div>
        {inApp ? <p className="mb-3 rounded-[var(--radius-card)] bg-warning-soft p-3 text-sm text-warning">WhatsApp’s browser often hides the mic. Open in Chrome, or type.</p> : null}
        {wiped ? <p className="mb-3 rounded-[var(--radius-card)] bg-warm p-3">Assisted Mode cleared this screen after five quiet minutes.</p> : null}
        <div className="space-y-3" aria-live="polite" aria-relevant="additions">
          {msgs.length === 0 ? <p className="rounded-[var(--radius-card)] bg-warm p-4">{t("empty")}</p> : null}
          {msgs.map((msg) => (
            <div key={msg.id}>
              <ChatBubble
                role={msg.speaker}
                label={labelFor(msg.speaker)}
                footer={
                  <>
                    <SpeakerButton onSpeak={() => speak(msg.text)} rate={rate} onToggleRate={() => setRate((r) => (r === 1 ? 0.8 : 1))} />
                    {msg.speaker === "DISHA" ? (
                      <>
                        <button type="button" className="min-h-12 text-sm font-semibold" onClick={() => void report(msg.id, "report")}>{t("report")}</button>
                        <button type="button" className="min-h-12 text-sm font-semibold" onClick={() => void report(msg.id, "wrong_number")}>{t("wrongNumber")}</button>
                      </>
                    ) : null}
                  </>
                }
              >
                <p>{msg.text}</p>
                {msg.card ? <div className="mt-3"><EvidenceCardView card={msg.card} locale={locale} /></div> : null}
              </ChatBubble>
              {judge && msg.trace ? <JudgePanel trace={msg.trace} /> : null}
            </div>
          ))}
          {busy ? <TypingIndicator /> : null}
        </div>
        <div className="mt-4">
          <QuickReplyChips chips={chips} onPick={(c) => void send(c)} disabled={busy} />
        </div>
        <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) void send(text.trim()); }}>
          <label className="sr-only" htmlFor="composer">{t("placeholder")}</label>
          <input id="composer" value={text} onChange={(e) => setText(e.target.value)} className="min-h-12 flex-1 rounded-[var(--radius-input)] border border-line bg-surface px-4" placeholder={t("placeholder")} />
          <VoiceButton onListen={listen} busy={busy} label="Speak your worry" />
          <button className="min-h-12 rounded-full bg-primary px-5 font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50" disabled={busy || !text.trim()} type="submit">{busy ? "…" : t("send")}</button>
        </form>
        {error ? <p className="mt-2 text-danger" role="alert">{error}</p> : null}
      </section>
      <aside className="space-y-4">
        <div className="rounded-[var(--radius-card)] border border-line bg-warm p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">{t("joinTitle")}</h2>
            {live ? <span className="rounded-full bg-surface px-2 py-1 text-xs font-semibold">{live}</span> : null}
          </div>
          <p className="tabular text-3xl font-bold text-primary">{join || "——"}</p>
          {sessionId && join ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="QR code for the other phone" className="mt-2 h-28 w-28 rounded-xl bg-white" src={`/api/v1/sessions/${sessionId}/qr`} />
          ) : null}
          <p className="text-sm text-muted">{t("shareCode")}</p>
          <h3 className="mt-4 font-semibold">{t("haveCode")}</h3>
          <JoinBox onJoined={(id, joinCode) => { setSessionId(id); setJoin(joinCode); localStorage.setItem("nourish.session", id); localStorage.setItem("nourish.join", joinCode); }} />
        </div>
        <ConsensusMeter openConcerns={concerns.length} alignment={alignment} />
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
          <h2 className="font-semibold">{t("ledger")}</h2>
          {concerns.length === 0 ? <p className="text-sm text-muted">—</p> : (
            <ul className="mt-2 space-y-2 text-sm">
              {concerns.map((c) => (
                <li key={`${c.tag}-${c.speaker}`} className="flex justify-between gap-2">
                  <span>{labelFor(c.speaker)}: {worryChip(c.tag) ? t(`chips.${worryChip(c.tag)}`) : c.tag.replaceAll("_", " ").toLowerCase()}</span>
                  <span className="font-semibold">{t("strength", { n: c.intensity })}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-[var(--radius-card)] bg-info-soft p-4 text-sm">
          <p className="font-semibold">{tCommon("talk")}</p>
          <ul className="mt-2 space-y-1">
            {HELPLINES.map((h) => <li key={h.id}><a className="font-semibold underline" href={h.tel}>{h.name} {h.number}</a></li>)}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function JoinBox({ onJoined }: { onJoined: (id: string, code: string) => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  return (
    <form className="mt-3 flex flex-wrap gap-2" onSubmit={async (e) => {
      e.preventDefault();
      setErr("");
      const res = await fetch("/api/v1/join", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Code not found"); return; }
      onJoined(data.sessionId, code);
    }}>
      <input aria-label="Join code" value={code} onChange={(e) => setCode(e.target.value)} className="min-h-12 min-w-0 flex-1 rounded-xl border border-line px-3" inputMode="numeric" placeholder="000000" />
      <button className="min-h-12 rounded-full bg-info px-4 font-semibold text-white" type="submit">Open that room</button>
      {err ? <span className="w-full text-danger" role="alert">{err}</span> : null}
    </form>
  );
}
