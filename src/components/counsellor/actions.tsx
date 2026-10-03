"use client";

import { useState } from "react";

export function CaseActions({ id }: { id: string }) {
  const [msg, setMsg] = useState("");
  async function act(action: string) {
    const res = await fetch(`/api/v1/escalations/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
    const data = await res.json();
    setMsg(data.message ?? data.error ?? "Updated");
  }
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="min-h-12 rounded-full bg-primary px-4 text-white" onClick={() => void act("accept")}>Accept</button>
      <button type="button" className="min-h-12 rounded-full bg-info px-4 text-white" onClick={() => void act("join")}>Simulate counsellor joining</button>
      <button type="button" className="min-h-12 rounded-full border px-4" onClick={() => void act("resolve")}>Mark intends to enrol</button>
      {msg ? <p role="status">{msg}</p> : null}
    </div>
  );
}
