"use client";

import { EvidenceCardView } from "@/components/evidence/card";
import type { EvidenceCard } from "@/data/services/outcomes";
import { HELPLINES } from "@/config/helplines";
import { BRAND } from "@/config/brand";
import { useEffect, useState } from "react";

type Msg = { id: string; speaker: string; text: string; card?: EvidenceCard | null; trace?: unknown };
type Concern = { tag: string; intensity: number; speaker: string };

const CHIPS = ["कमाई कितनी होगी?", "क्या नौकरी पक्की है?", "लोग क्या कहेंगे?", "क्या बेटियों के लिए सुरक्षित है?", "डिग्री से बेहतर है क्या?", "फीस और खर्च कितना?"];
const STAGES = ["Understand", "Explore", "Compare", "Decide", "Plan"];

type Recog = {
  lang: string;
  start: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
};

export function RoomClient({ locale }: { locale: string }) {
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

  useEffect(() => {
    setJudge(localStorage.getItem("nourish.judge") === "1");
    setSessionId(localStorage.getItem("nourish.session"));
    setJoin(localStorage.getItem("nourish.join") ?? "");
    const ua = navigator.userAgent;
    setInApp(/WhatsApp|Instagram|FBAN|FBAV/i.test(ua));
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
    const timer = window.setInterval(() => void pull(), 4000);
    return () => {
      stop = true;
      window.clearInterval(timer);
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
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: id, text: value, speaker }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chat failed");
      setMsgs((m) => [...m, { id: data.message.id, speaker: "DISHA", text: data.message.text, card: data.card, trace: data.trace }]);
      setConcerns(data.objections ?? []);
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
      setError("This browser has no mic. Open in Chrome, or type the worry.");
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
    setError(kind === "wrong_number" ? "Marked as a wrong number. A steward can see it in AI Quality." : "Reported. Thank you.");
  }

  const stage = STAGES[Math.min(STAGES.length - 1, Math.floor(msgs.filter((m) => m.speaker !== "DISHA").length / 2))] ?? "Understand";
  const alignment = concerns.length === 0 ? "Still listening" : concerns.length === 1 ? "One shared worry" : "More than one worry is open";

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <section>
        <ol className="mb-3 flex flex-wrap gap-2" aria-label="Stage">
          {STAGES.map((name) => (
            <li key={name} className={`rounded-full px-3 py-1 text-sm ${name === stage ? "bg-primary text-white" : "bg-sunken text-muted"}`}>{name}</li>
          ))}
        </ol>
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Speaker">
          {(["PARENT", "LEARNER", "TOGETHER"] as const).map((role) => (
            <button key={role} type="button" className={`min-h-12 rounded-full px-4 ${speaker === role ? "bg-primary text-white" : "border border-line bg-surface"}`} onClick={() => setSpeaker(role)}>
              {role === "PARENT" ? "Parent" : role === "LEARNER" ? "Learner" : "Together"}
            </button>
          ))}
        </div>
        {inApp ? <p className="mb-3 rounded-2xl bg-warning-soft p-3 text-sm text-warning">WhatsApp’s browser often hides the mic. Open this page in Chrome, or type.</p> : null}
        {wiped ? <p className="mb-3 rounded-2xl bg-warm p-3">Assisted Mode cleared this screen after five quiet minutes.</p> : null}
        <div className="space-y-3" aria-live="polite">
          {msgs.length === 0 ? <p className="rounded-[20px] bg-warm p-4">Tell {BRAND.persona} what is on your mind. A parent’s worry is welcome first.</p> : null}
          {msgs.map((msg) => (
            <article key={msg.id} className={`rounded-[20px] p-4 ${msg.speaker === "PARENT" ? "bg-clay" : msg.speaker === "LEARNER" ? "bg-neem" : msg.speaker === "COUNSELLOR" ? "bg-info-soft" : "border border-line bg-surface"}`}>
              <p className="text-sm font-semibold text-muted">{msg.speaker === "DISHA" ? `${BRAND.persona} · AI guide` : msg.speaker}</p>
              <p className="mt-1">{msg.text}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className="min-h-12 text-info" onClick={() => speak(msg.text)}>Tap to hear</button>
                <button type="button" className="min-h-12 text-sm" onClick={() => setRate((r) => (r === 1 ? 0.8 : 1))}>{rate === 1 ? "1×" : "0.8×"}</button>
                {msg.speaker === "DISHA" ? (
                  <>
                    <button type="button" className="min-h-12 text-sm" onClick={() => void report(msg.id, "report")}>Report this answer</button>
                    <button type="button" className="min-h-12 text-sm" onClick={() => void report(msg.id, "wrong_number")}>Wrong number</button>
                  </>
                ) : null}
              </div>
              {msg.card ? <div className="mt-3"><EvidenceCardView card={msg.card} locale={locale} /></div> : null}
              {judge && msg.trace ? <pre className="mt-2 overflow-auto rounded-xl bg-sunken p-3 text-xs">{JSON.stringify(msg.trace, null, 2)}</pre> : null}
            </article>
          ))}
          {busy ? <p className="text-sm text-muted">{BRAND.persona} is writing…</p> : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <button key={chip} type="button" className="min-h-12 rounded-full border border-line bg-surface px-3" onClick={() => void send(chip)}>{chip}</button>
          ))}
        </div>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) void send(text.trim()); }}>
          <label className="sr-only" htmlFor="composer">Message</label>
          <input id="composer" value={text} onChange={(e) => setText(e.target.value)} className="min-h-12 flex-1 rounded-2xl border border-line bg-surface px-4" placeholder="Say the worry in your own words" />
          <button type="button" className="min-h-12 min-w-12 rounded-full bg-growth px-4 text-white" onClick={listen} aria-label="Speak">Mic</button>
          <button className="min-h-12 rounded-full bg-primary px-5 text-white" disabled={busy} type="submit">{busy ? "…" : "Send"}</button>
        </form>
        {error ? <p className="mt-2 text-danger" role="alert">{error}</p> : null}
      </section>
      <aside className="space-y-3">
        <div className="rounded-[20px] border border-line bg-warm p-4">
          <h2 className="font-semibold">Join code</h2>
          <p className="tabular text-3xl">{join || "Send a message to get a code"}</p>
          <p className="text-sm text-muted">The other phone opens Family Room and enters this code. Messages refresh every few seconds.</p>
          <JoinBox onJoined={(id, joinCode) => { setSessionId(id); setJoin(joinCode); localStorage.setItem("nourish.session", id); localStorage.setItem("nourish.join", joinCode); }} />
        </div>
        <div className="rounded-[20px] border border-line bg-surface p-4">
          <h2 className="font-semibold">Concern ledger</h2>
          {concerns.length === 0 ? <p className="text-sm text-muted">No open worry yet.</p> : (
            <ul className="mt-2 space-y-1 text-sm">{concerns.map((c) => <li key={`${c.tag}-${c.speaker}`}>{c.speaker}: {c.tag.replaceAll("_", " ").toLowerCase()} · {c.intensity}</li>)}</ul>
          )}
          <p className="mt-3 text-sm"><span className="font-semibold">Consensus. </span>{alignment}</p>
        </div>
        <div className="rounded-[20px] bg-info-soft p-4 text-sm">
          <p className="font-semibold">If you need a person now</p>
          <ul className="mt-2 space-y-1">
            {HELPLINES.map((h) => <li key={h.id}><a className="underline" href={h.tel}>{h.name} {h.number}</a></li>)}
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
      <input aria-label="Join code" value={code} onChange={(e) => setCode(e.target.value)} className="min-h-12 min-w-0 flex-1 rounded-xl border border-line px-3" inputMode="numeric" placeholder="6-digit code" />
      <button className="min-h-12 rounded-full bg-info px-4 text-white" type="submit">Join</button>
      {err ? <span className="w-full text-danger">{err}</span> : null}
    </form>
  );
}
