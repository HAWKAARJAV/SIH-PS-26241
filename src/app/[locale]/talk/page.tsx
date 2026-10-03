"use client";

import { HELPLINES } from "@/config/helplines";
import { useState } from "react";

export default function TalkPage() {
  const [when, setWhen] = useState("evening");
  const [status, setStatus] = useState("");
  async function ask() {
    const familyId = localStorage.getItem("nourish.family");
    const sessionId = localStorage.getItem("nourish.session");
    const res = await fetch("/api/v1/escalations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ familyId, sessionId, when, language: document.documentElement.lang || "en" }),
    });
    const data = await res.json();
    if (!res.ok) { setStatus(data.error ?? "Could not queue"); return; }
    setStatus(`Queued. Place ${data.position}. A counsellor SLA is 4 hours in this prototype.`);
  }
  return (
    <article className="space-y-4">
      <h1 className="font-display text-4xl">Talk to a human</h1>
      <p>Call, WhatsApp, or ask for a callback. If you are offline, the request waits on this phone until you reconnect.</p>
      <label className="block">Preferred time
        <select className="mt-1 min-h-12 w-full rounded-xl border px-3" value={when} onChange={(e) => setWhen(e.target.value)}>
          <option value="morning">Morning</option>
          <option value="evening">Evening</option>
        </select>
      </label>
      <button type="button" className="min-h-12 rounded-full bg-info px-5 text-white" onClick={() => void ask()}>Request a counsellor</button>
      {status ? <p role="status">{status}</p> : null}
      <ul className="space-y-2">
        {HELPLINES.map((h) => (
          <li key={h.id}><a className="font-semibold text-info underline" href={h.tel}>{h.name}: {h.number}</a><span className="block text-sm text-muted">Checked {h.verifiedAt}. Re-check before a live demo. {h.note}</span></li>
        ))}
      </ul>
    </article>
  );
}
