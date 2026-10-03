"use client";

import { useRouter } from "@/lib/i18n/navigation";

const personas = [
  { id: "sunita", title: "Sunita & Ravi", locale: "hi", stateId: "st-up", districtId: "d-neemganj", gender: "boy", worry: "DEGREE_PREFERENCE", interest: "electrician" },
  { id: "kavya", title: "Meenakshi & Kavya", locale: "ta", stateId: "st-tn", districtId: "d-mullai", gender: "girl", worry: "GIRLS_SAFETY_TRAVEL", interest: "sewing" },
  { id: "aarti", title: "Pradip & Aarti", locale: "mr", stateId: "st-mh", districtId: "d-mangoan", gender: "girl", worry: "DEGREE_PREFERENCE", interest: "copa" },
  { id: "desk", title: "Assisted help desk", locale: "hi", stateId: "st-up", districtId: "d-loharpur", gender: "boy", worry: "INCOME_POTENTIAL", interest: "plumber", assisted: true },
];

export default function DemoPage() {
  const router = useRouter();
  async function launch(p: typeof personas[number]) {
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
    const data = await res.json();
    localStorage.setItem("nourish.session", data.sessionId);
    localStorage.setItem("nourish.family", data.familyId);
    localStorage.setItem("nourish.join", data.joinCode);
    localStorage.setItem("nourish.profile", JSON.stringify(p));
    router.push("/room", { locale: p.locale });
  }
  return (
    <article className="space-y-4">
      <h1 className="font-display text-4xl">Demo hub</h1>
      <p>No API key is required. Disha uses the scripted guide. Staff password is <span className="tabular">nourish-demo-admin</span>.</p>
      <ul className="text-sm">
        <li>admin@nourish.local</li>
        <li>counsellor@nourish.local</li>
        <li>steward@nourish.local</li>
        <li>state@nourish.local</li>
        <li>viewer@nourish.local</li>
      </ul>
      <div className="grid gap-3 sm:grid-cols-2">
        {personas.map((p) => (
          <button key={p.id} type="button" className="min-h-20 rounded-[20px] border bg-surface p-4 text-left" onClick={() => void launch(p)}>
            <span className="font-display text-2xl">{p.title}</span>
            <span className="block text-sm text-muted">{p.worry}</span>
          </button>
        ))}
      </div>
      <button type="button" className="min-h-12 rounded-full bg-accent-soft px-4" onClick={() => localStorage.setItem("nourish.judge", localStorage.getItem("nourish.judge") === "1" ? "0" : "1")}>Toggle Judge Mode</button>
      <button type="button" className="ml-2 min-h-12 rounded-full border px-4" onClick={() => { localStorage.clear(); void fetch("/api/v1/demo/reset", { method: "POST" }); }}>Reset demo</button>
    </article>
  );
}
