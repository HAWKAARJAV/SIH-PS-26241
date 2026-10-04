"use client";

import { useRouter } from "@/lib/i18n/navigation";
import { FAMILY_WORRIES } from "@/lib/worries";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const STATES = [
  { id: "st-up", name: "Uttar Pradesh" },
  { id: "st-mh", name: "Maharashtra" },
  { id: "st-tn", name: "Tamil Nadu" },
  { id: "st-br", name: "Bihar" },
];
const DISTRICTS: Record<string, { id: string; name: string }[]> = {
  "st-up": [{ id: "d-neemganj", name: "Neemganj" }, { id: "d-loharpur", name: "Loharpur" }],
  "st-mh": [{ id: "d-mangoan", name: "Mangoan" }, { id: "d-talewadi", name: "Talewadi" }],
  "st-tn": [{ id: "d-thenpadi", name: "Thenpadi" }, { id: "d-mullai", name: "Mullai" }],
  "st-br": [{ id: "d-gangauli", name: "Gangauli" }, { id: "d-sonpurwa", name: "Sonpurwa" }],
};

const CLASSES = ["8", "10", "12", "ITI"];

function Wizard() {
  const params = useSearchParams();
  const router = useRouter();
  const t = useTranslations("room");
  const [step, setStep] = useState(0);
  const [stateId, setStateId] = useState("st-up");
  const [districtId, setDistrictId] = useState("d-neemganj");
  const [ageBand, setAgeBand] = useState("15-17");
  const [gender, setGender] = useState("skip");
  const [interest, setInterest] = useState("electrician");
  const [classDone, setClassDone] = useState("10");
  const [incomeBand, setIncomeBand] = useState("prefer-not");
  const preset = params.get("worry");
  const [worry, setWorry] = useState(FAMILY_WORRIES.some((row) => row.id === preset) ? preset! : "INCOME_POTENTIAL");
  const [consents, setConsents] = useState<string[]>(["counselling"]);
  const [otp, setOtp] = useState("");
  const [demoCodeLabel, setDemoCodeLabel] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    void fetch("/api/v1/demo/parent-code").then(async (res) => {
      if (!res.ok) return;
      const data = await res.json() as { label?: string; code?: string };
      if (data.label && data.code) setDemoCodeLabel(`${data.label} ${data.code}`);
    });
  }, []);
  const assisted = params.get("assisted") === "1";
  const under18 = ageBand === "15-17";

  async function finish() {
    setError("");
    if (!consents.includes("counselling")) {
      setError("Counselling consent is needed to open a room.");
      return;
    }
    const res = await fetch("/api/v1/families", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        locale: document.documentElement.lang || "en",
        mode: params.get("mode") ?? "together",
        stateId, districtId, incomeBand, worry, assisted,
        parental: under18,
        otp: under18 ? otp : undefined,
        persons: [
          { role: "PARENT", gender: "skip" },
          { role: "LEARNER", ageBand, gender, interests: interest, classDone },
        ],
        consents,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Could not save"); return; }
    localStorage.setItem("nourish.session", data.sessionId);
    localStorage.setItem("nourish.family", data.familyId);
    localStorage.setItem("nourish.join", data.joinCode);
    localStorage.setItem("nourish.profile", JSON.stringify({ stateId, districtId, ageBand, gender, interest, classDone, incomeBand, worry, assisted: assisted ? "1" : "0", mode: params.get("mode") }));
    router.push("/room");
  }

  return (
    <div className={`space-y-4 ${assisted ? "text-xl" : ""}`}>
      <p className="text-sm text-muted">Step {step + 1} of 4</p>
      {step === 0 ? (
        <fieldset className="space-y-3">
          <legend className="font-display text-3xl">Where do you live?</legend>
          <p className="text-muted">Pay and placement are shown for this district when the dataset has a group large enough.</p>
          <select className="min-h-12 w-full rounded-xl border border-line bg-surface px-3" value={stateId} onChange={(e) => { setStateId(e.target.value); setDistrictId(DISTRICTS[e.target.value]?.[0]?.id ?? ""); }} aria-label="State">
            {STATES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="min-h-12 w-full rounded-xl border border-line bg-surface px-3" value={districtId} onChange={(e) => setDistrictId(e.target.value)} aria-label="District">
            {(DISTRICTS[stateId] ?? []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </fieldset>
      ) : null}
      {step === 1 ? (
        <fieldset className="space-y-3">
          <legend className="font-display text-3xl">About the learner</legend>
          <select className="min-h-12 w-full rounded-xl border px-3" value={ageBand} onChange={(e) => setAgeBand(e.target.value)} aria-label="Age band">
            <option value="15-17">15–17</option>
            <option value="18-25">18–25</option>
          </select>
          <div className="flex flex-wrap gap-2">
            {([["girl", "Girl"], ["boy", "Boy"], ["other", "Other"], ["skip", "Rather not say"]] as const).map(([g, label]) => (
              <button type="button" key={g} aria-pressed={gender === g} className={`min-h-12 rounded-full px-4 ${gender === g ? "bg-primary text-white" : "bg-surface border"}`} onClick={() => setGender(g)}>{label}</button>
            ))}
          </div>
          <p className="text-sm font-semibold text-muted">Class completed</p>
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((c) => (
              <button type="button" key={c} aria-pressed={classDone === c} className={`min-h-12 rounded-full px-4 ${classDone === c ? "bg-primary text-white" : "border bg-surface"}`} onClick={() => setClassDone(c)}>{c === "ITI" ? "Already in ITI" : `Class ${c}`}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {([["electrician", "Electrician"], ["sewing", "Sewing"], ["gda", "Patient care"], ["solar", "Solar"]] as const).map(([id, label]) => (
              <button type="button" key={id} aria-pressed={interest === id} className={`min-h-16 rounded-2xl border ${interest === id ? "bg-primary-soft" : "bg-surface"}`} onClick={() => setInterest(id)}>{label}</button>
            ))}
          </div>
        </fieldset>
      ) : null}
      {step === 2 ? (
        <fieldset className="space-y-3">
          <legend className="font-display text-3xl">Household</legend>
          <select className="min-h-12 w-full rounded-xl border px-3" value={incomeBand} onChange={(e) => setIncomeBand(e.target.value)} aria-label="Income band">
            <option value="under-10k">Under ₹10,000</option>
            <option value="10-25k">₹10,000–25,000</option>
            <option value="25-50k">₹25,000–50,000</option>
            <option value="over-50k">Over ₹50,000</option>
            <option value="prefer-not">Prefer not to say</option>
          </select>
          <div className="flex flex-wrap gap-2">
            {FAMILY_WORRIES.map((w) => (
              <button type="button" key={w.id} aria-pressed={worry === w.id} className={`min-h-12 rounded-full px-3 ${worry === w.id ? "bg-accent-soft" : "bg-surface border"}`} onClick={() => setWorry(w.id)}>{t(`chips.${w.chip}`)}</button>
            ))}
          </div>
        </fieldset>
      ) : null}
      {step === 3 ? (
        <fieldset className="space-y-3">
          <legend className="font-display text-3xl">Consent</legend>
          <p>We store this room to counsel you. We never ask for Aadhaar or PAN. You can delete it later.</p>
          {([
            ["counselling", "Counsel us in this room"],
            ["counsellor sharing", "Let a counsellor read this room"],
            ["anonymised analytics", "Count this visit without our names"],
          ] as const).map(([c, label]) => (
            <label key={c} className="flex min-h-12 items-center gap-3">
              <input type="checkbox" checked={consents.includes(c)} onChange={(e) => setConsents((prev) => e.target.checked ? [...prev, c] : prev.filter((x) => x !== c))} />
              {label}
            </label>
          ))}
          {under18 ? (
            <div>
              <p>{demoCodeLabel || "Simulated parent code. A live build would use a real OTP adapter."}</p>
              <input className="min-h-12 w-full rounded-xl border px-3" value={otp} onChange={(e) => setOtp(e.target.value)} aria-label="Simulated parent code" inputMode="numeric" />
            </div>
          ) : null}
        </fieldset>
      ) : null}
      {error ? <p className="text-danger" role="alert">{error}</p> : null}
      <div className="flex gap-2">
        {step > 0 ? <button type="button" className="min-h-12 rounded-full border px-4" onClick={() => setStep((s) => s - 1)}>Back</button> : null}
        {step < 3 ? <button type="button" className="min-h-12 rounded-full bg-primary px-5 text-white" onClick={() => setStep((s) => s + 1)}>{["Next: the learner", "Next: the household", "Next: consent"][step]}</button> : null}
        {step === 3 ? <button type="button" className="min-h-12 rounded-full bg-primary px-5 text-white" onClick={() => void finish()}>Open Family Room</button> : null}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return <Suspense fallback={<p>Loading…</p>}><Wizard /></Suspense>;
}
