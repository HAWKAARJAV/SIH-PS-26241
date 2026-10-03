"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RoomClient } from "@/components/chat/room-client";

export default function JoinPage() {
  const params = useParams<{ code: string; locale: string }>();
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void fetch("/api/v1/join", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: params.code }) })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Code not found"); return; }
        localStorage.setItem("nourish.session", data.sessionId);
        localStorage.setItem("nourish.join", params.code);
        setReady(true);
      });
  }, [params.code]);
  if (error) return <p role="alert">{error}</p>;
  if (!ready) return <p>Loading…</p>;
  return <RoomClient locale={params.locale} />;
}
