"use client";

import { useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";

const personas = [
  { id: "sunita", title: "Sunita & Ravi", story: "Father in Neemganj wants a degree. Ask what people will say, in Hindi.", locale: "hi", stateId: "st-up", districtId: "d-neemganj", gender: "boy", worry: "DEGREE_PREFERENCE", interest: "electrician" },
  { id: "kavya", title: "Meenakshi & Kavya", story: "Mother asks if the centre is safe for a daughter. Tamil, travel and hostel.", locale: "ta", stateId: "st-tn", districtId: "d-mullai", gender: "girl", worry: "GIRLS_SAFETY_TRAVEL", interest: "sewing" },
  { id: "aarti", title: "Pradip & Aarti", story: "Degree first, then a bridge. Marathi household, computer trade.", locale: "mr", stateId: "st-mh", districtId: "d-mangoan", gender: "girl", worry: "DEGREE_PREFERENCE", interest: "copa" },
  { id: "desk", title: "Assisted help desk", story: "Low-literacy father asks about pay. Big type. Screen clears after five quiet minutes.", locale: "hi", stateId: "st-up", districtId: "d-loharpur", gender: "boy", worry: "INCOME_POTENTIAL", interest: "plumber", assisted: true },
];

export default function DemoPage() {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function launch(p: typeof personas[number]) {
    setError(null);
    setBusyId(p.id);
    try {
      const res = await fetch("/api/v1/families", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          locale: p.locale,
          mode: p.assisted ? "assisted" : "together",
          stateId: p.stateId,
          districtId: p.districtId,
          worry: p.worry,
          assisted: Boolean(p.assisted),
          persons: [{ role: "PARENT" }, { role: "LEARNER", gender: p.gender, interests: p.interest, ageBand: "15-17" }],
          consents: ["counselling", "counsellor sharing"],
          parental: true,
        }),
      });
      const data = (await res.json().catch(() => null)) as { familyId?: string; sessionId?: string; joinCode?: string; error?: string } | null;
      if (!res.ok || !data?.sessionId || !data.familyId) {
        setError(data?.error ?? "Could not start this demo room. Check the server is running and try again.");
        return;
      }
      localStorage.setItem("nourish.session", data.sessionId);
      localStorage.setItem("nourish.family", data.familyId);
      localStorage.setItem("nourish.join", data.joinCode ?? "");
      localStorage.setItem("nourish.profile", JSON.stringify(p));
      router.push("/room", { locale: p.locale });
    } catch {
      setError("Network error. If buttons do nothing, restart with npm run dev:clean and hard-refresh the page.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <article className="space-y-4">
      <h1 className="font-display text-4xl">Four households</h1>
      <p>Each card opens a family room in that language. Disha answers from the dataset. No API key is required. Staff password is <span className="tabular">nourish-demo-admin</span>.</p>
      {error ? (
        <p className="rounded-[20px] border border-warning bg-warning-soft px-4 py-3 text-warning" role="alert">{error}</p>
      ) : null}
      <ul className="text-sm">
        <li>admin@nourish.local</li>
        <li>counsellor@nourish.local</li>
        <li>steward@nourish.local</li>
        <li>state@nourish.local</li>
        <li>viewer@nourish.local</li>
      </ul>
      <div className="grid gap-3 sm:grid-cols-2">
        {personas.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={busyId !== null}
            aria-busy={busyId === p.id}
            className="min-h-20 rounded-[20px] border bg-surface p-4 text-left disabled:opacity-60"
            onClick={() => void launch(p)}
          >
            <span className="font-display text-2xl">{p.title}</span>
            <span className="mt-1 block text-sm text-muted">{busyId === p.id ? "Starting…" : p.story}</span>
          </button>
        ))}
      </div>
      <button type="button" className="min-h-12 rounded-full bg-accent-soft px-4" onClick={() => localStorage.setItem("nourish.judge", localStorage.getItem("nourish.judge") === "1" ? "0" : "1")}>Toggle Judge Mode</button>
      <button type="button" className="ml-2 min-h-12 rounded-full border px-4" onClick={() => { localStorage.clear(); void fetch("/api/v1/demo/reset", { method: "POST" }); }}>Reset demo</button>
    </article>
  );
}
