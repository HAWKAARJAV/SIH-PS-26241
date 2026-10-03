"use client";

import { useState } from "react";

export function SuggestForm() {
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  async function send() {
    const res = await fetch("/api/v1/playbook-suggestions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ note }),
    });
    const data = await res.json();
    setMsg(data.message ?? data.error ?? "Sent");
    if (res.ok) setNote("");
  }
  return (
    <form className="rounded-[20px] bg-warm p-4" onSubmit={(e) => { e.preventDefault(); void send(); }}>
      <h2 className="font-display text-2xl">Suggest a playbook update</h2>
      <p className="text-sm">An admin approves this. The guide does not learn from it on its own.</p>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-line p-3" aria-label="Suggestion" />
      <button type="submit" className="mt-2 min-h-12 rounded-full bg-primary px-5 text-white">Send to admin</button>
      {msg ? <p className="mt-2" role="status">{msg}</p> : null}
    </form>
  );
}
