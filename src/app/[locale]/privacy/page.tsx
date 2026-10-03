"use client";

import { useState } from "react";

export default function PrivacyPage() {
  const [msg, setMsg] = useState("");
  async function act(action: "delete" | "withdraw") {
    const familyId = localStorage.getItem("nourish.family");
    if (!familyId) { setMsg("No family room on this device."); return; }
    const res = await fetch("/api/v1/rights", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ familyId, action }) });
    if (!res.ok) { setMsg("Could not update. Try again."); return; }
    if (action === "delete") {
      localStorage.removeItem("nourish.family");
      localStorage.removeItem("nourish.session");
    }
    setMsg(action === "delete" ? "Your room data is marked deleted and the transcript is removed." : "Consent is withdrawn.");
  }
  return (
    <article className="space-y-3">
      <h1 className="font-display text-4xl">Privacy</h1>
      <p>We collect a language, a place, an age band, and the words you type. We do not collect Aadhaar or PAN. Under-18 rooms need a parent code. In this demo that code is simulated and labelled.</p>
      <p>Transcripts are due to be purged after 90 days. Analytics for staff are grouped. Cells with fewer than 10 people are hidden. Counsellors see a case only if you allowed sharing. Admins do not see transcripts.</p>
      <button type="button" className="min-h-12 rounded-full bg-danger px-5 text-white" onClick={() => void act("delete")}>Delete my data</button>
      <button type="button" className="ml-2 min-h-12 rounded-full border px-5" onClick={() => void act("withdraw")}>Withdraw consent</button>
      {msg ? <p role="status">{msg}</p> : null}
    </article>
  );
}
