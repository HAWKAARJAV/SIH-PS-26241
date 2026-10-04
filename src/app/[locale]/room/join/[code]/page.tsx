"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { RoomClient } from "@/components/chat/room-client";

export default function JoinPage() {
  const params = useParams<{ code: string; locale: string }>();
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  async function join(role: "PARENT" | "LEARNER") {
    setBusy(true);
    setError("");
    const res = await fetch("/api/v1/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: params.code, role }),
    });
    const data = (await res.json()) as { sessionId?: string; error?: string };
    setBusy(false);
    if (!res.ok || !data.sessionId) {
      setError(data.error ?? "Code not found");
      return;
    }
    localStorage.setItem("nourish.session", data.sessionId);
    localStorage.setItem("nourish.join", params.code);
    localStorage.setItem("nourish.role", role);
    setReady(true);
  }

  if (ready) return <RoomClient locale={params.locale} />;
  return (
    <article className="mx-auto max-w-md space-y-4">
      <h1 className="font-display text-4xl">Who are you?</h1>
      <p>This phone joins the family room. Your messages will be tagged with the role you pick.</p>
      {error ? <p role="alert" className="text-danger">{error}</p> : null}
      <div className="grid gap-3">
        <button type="button" disabled={busy} className="min-h-16 rounded-[20px] bg-clay font-semibold" onClick={() => void join("PARENT")}>Parent</button>
        <button type="button" disabled={busy} className="min-h-16 rounded-[20px] bg-neem font-semibold" onClick={() => void join("LEARNER")}>Learner</button>
      </div>
    </article>
  );
}
