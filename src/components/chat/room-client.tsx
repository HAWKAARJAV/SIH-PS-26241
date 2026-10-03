"use client";

import { EvidenceCardView } from "@/components/evidence/card";
import type { EvidenceCard } from "@/data/services/outcomes";
import { HELPLINES } from "@/config/helplines";
import { BRAND } from "@/config/brand";
import { useEffect, useMemo, useState } from "react";

type Msg = { id: string; speaker: string; text: string; card?: EvidenceCard | null; trace?: unknown };

const CHIPS = ["कमाई कितनी होगी?", "क्या नौकरी पक्की है?", "लोग क्या कहेंगे?", "क्या बेटियों के लिए सुरक्षित है?", "डिग्री से बेहतर है क्या?", "फीस और खर्च कितना?"];

export function RoomClient({ locale }: { locale: string }) {
  const [speaker, setSpeaker] = useState<"PARENT" | "LEARNER" | "TOGETHER">("PARENT");
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [join, setJoin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [judge, setJudge] = useState(false);
  const [concerns, setConcerns] = useState<{ tag: string; intensity: number; speaker: string }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("nourish.session");
    const judgeOn = localStorage.getItem("nourish.judge") === "1";
    setJudge(judgeOn);
    if (saved) setSessionId(saved);
  }, []);

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

  const code = useMemo(() => (typeof window === "undefined" ? "" : localStorage.getItem("nourish.join") ?? join), [join]);

  function speak(line: string) {
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(line);
    utter.lang = locale === "ta" ? "ta-IN" : locale === "mr" ? "mr-IN" : locale === "hi" ? "hi-IN" : "en-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <section>
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Speaker">
          {(["PARENT", "LEARNER", "TOGETHER"] as const).map((role) => (
            <button key={role} type="button" className={`min-h-12 rounded-full px-4 ${speaker === role ? "bg-primary text-white" : "bg-surface border border-line"}`} onClick={() => setSpeaker(role)}>
              {role === "PARENT" ? "Parent" : role === "LEARNER" ? "Learner" : "Together"}
            </button>
          ))}
        </div>
        <div className="space-y-3" aria-live="polite">
          {msgs.length === 0 ? <p className="rounded-[20px] bg-warm p-4">Tell {BRAND.persona} what is on your mind. A parent’s worry is welcome first.</p> : null}
          {msgs.map((msg) => (
            <article key={msg.id} className={`rounded-[20px] p-4 ${msg.speaker === "PARENT" ? "bg-clay" : msg.speaker === "LEARNER" ? "bg-neem" : "bg-surface border border-line"}`}>
              <p className="text-sm font-semibold text-muted">{msg.speaker === "DISHA" ? `${BRAND.persona} · AI guide` : msg.speaker}</p>
              <p className="mt-1">{msg.text}</p>
              <button type="button" className="mt-2 min-h-12 text-info" onClick={() => speak(msg.text)}>Tap to hear</button>
              {msg.card ? <div className="mt-3"><EvidenceCardView card={msg.card} locale={locale} /></div> : null}
              {judge && msg.trace ? <pre className="mt-2 overflow-auto rounded-xl bg-sunken p-3 text-xs">{JSON.stringify(msg.trace, null, 2)}</pre> : null}
            </article>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <button key={chip} type="button" className="min-h-12 rounded-full border border-line bg-surface px-3" onClick={() => send(chip)}>{chip}</button>
          ))}
        </div>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) void send(text.trim()); }}>
          <label className="sr-only" htmlFor="composer">Message</label>
          <input id="composer" value={text} onChange={(e) => setText(e.target.value)} className="min-h-12 flex-1 rounded-2xl border border-line bg-surface px-4" placeholder="Say the worry in your own words" />
          <button className="min-h-12 rounded-full bg-primary px-5 text-white" disabled={busy} type="submit">{busy ? "…" : "Send"}</button>
        </form>
        {error ? <p className="mt-2 text-danger" role="alert">{error}</p> : null}
        {"speechSynthesis" in (typeof window === "undefined" ? {} : window) ? null : <p className="mt-2 text-sm">Open in Chrome if the mic is missing. You can still type.</p>}
      </section>
      <aside className="space-y-3">
        <div className="rounded-[20px] border border-line bg-warm p-4">
          <h2 className="font-semibold">Join code</h2>
          <p className="tabular text-3xl">{code || "Open the room to get a code"}</p>
          <p className="text-sm text-muted">The other phone opens Family Room and enters this code.</p>
          <JoinBox onJoined={(id, joinCode) => { setSessionId(id); setJoin(joinCode); localStorage.setItem("nourish.session", id); }} />
        </div>
        <div className="rounded-[20px] border border-line bg-surface p-4">
          <h2 className="font-semibold">Concern ledger</h2>
          {concerns.length === 0 ? <p className="text-sm text-muted">No open worry yet.</p> : (
            <ul className="mt-2 space-y-1 text-sm">{concerns.map((c) => <li key={c.tag}>{c.speaker}: {c.tag} · intensity {c.intensity}</li>)}</ul>
          )}
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
    <form className="mt-3 flex gap-2" onSubmit={async (e) => {
      e.preventDefault();
      setErr("");
      const res = await fetch("/api/v1/join", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Code not found"); return; }
      onJoined(data.sessionId, code);
    }}>
      <input aria-label="Join code" value={code} onChange={(e) => setCode(e.target.value)} className="min-h-12 w-full rounded-xl border border-line px-3" inputMode="numeric" placeholder="6-digit code" />
      <button className="min-h-12 rounded-full bg-info px-4 text-white" type="submit">Join</button>
      {err ? <span className="text-danger">{err}</span> : null}
    </form>
  );
}
