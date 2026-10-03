"use client";

import { INTEREST_NAMES, PLACE_NAMES, WORRY_PLAIN } from "@/lib/worries";
import { toPng } from "html-to-image";
import { useEffect, useRef, useState } from "react";

export default function PlanPage() {
  const ref = useRef<HTMLElement>(null);
  const [profile, setProfile] = useState<Record<string, string> | null>(null);
  const [joinCode, setJoinCode] = useState("");
  useEffect(() => {
    const raw = localStorage.getItem("nourish.profile");
    setProfile(raw ? JSON.parse(raw) as Record<string, string> : null);
    setJoinCode(localStorage.getItem("nourish.join") ?? "");
  }, []);
  async function shareImage() {
    if (!ref.current) return;
    const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 1, width: 1080, height: 1920 });
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], "nourish-plan.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Nourish plan", text: "Our family plan" });
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent("Our Nourish plan is ready to print from the browser.")}`, "_blank");
  }
  if (!profile) {
    return <div className="rounded-[20px] bg-warm p-6"><h1 className="font-display text-3xl">My Plan</h1><p>Shortlist a path from onboarding first. Then this page can be printed or sent.</p></div>;
  }
  return (
    <div>
      <article ref={ref} className="space-y-3 rounded-[20px] bg-surface p-6">
        <p className="text-sm text-warning">Illustrative family summary · demo</p>
        <h1 className="font-display text-4xl">Our plan</h1>
        <p>Trade they asked about: {INTEREST_NAMES[profile.interest ?? ""] ?? profile.interest}.</p>
        <p>Place: {PLACE_NAMES[profile.districtId ?? ""] ?? profile.districtId}, {PLACE_NAMES[profile.stateId ?? ""] ?? ""}.</p>
        <p>Worry they came in with: {WORRY_PLAIN[profile.worry ?? ""] ?? profile.worry}.</p>
        <p>Class completed: {profile.classDone === "ITI" ? "Already in an ITI" : `Class ${profile.classDone ?? "—"}`}.</p>
        <h2 className="font-display text-2xl">Next steps</h2>
        <ol className="list-decimal pl-5">
          <li>Visit one centre in daylight.</li>
          <li>Ask the four questions on the provider page.</li>
          <li>Compare with a degree path before paying.</li>
        </ol>
        <p className="text-sm">Prototype for Smart India Hackathon 2026 — not an official government portal.</p>
        {joinCode ? (
          <p className="rounded-xl bg-warm p-3 text-sm">
            Resume on another phone: open Family Room and enter join code <span className="tabular font-bold">{joinCode}</span>
          </p>
        ) : null}
      </article>
      <div className="no-print mt-4 flex gap-2">
        <button type="button" className="min-h-12 rounded-full bg-primary px-5 text-white" onClick={() => window.print()}>Print / PDF</button>
        <button type="button" className="min-h-12 rounded-full bg-growth px-5 text-white" onClick={() => void shareImage()}>WhatsApp image</button>
      </div>
      <Survey />
    </div>
  );
}

function Survey() {
  const [done, setDone] = useState("");
  const [answers, setAnswers] = useState({ understood: 0, confident: 0, willVisit: 0 });
  const questions = [
    ["understood", "Did you understand?"],
    ["confident", "Do you feel more sure?"],
    ["willVisit", "Will you visit a centre?"],
  ] as const;
  async function save() {
    const sessionId = localStorage.getItem("nourish.session");
    if (!sessionId) {
      setDone("Open a family room first. Then come back and pick one answer for each question.");
      return;
    }
    if (questions.some(([key]) => answers[key] === 0)) {
      setDone("Pick one answer for each of the three questions.");
      return;
    }
    const res = await fetch("/api/v1/survey", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, ...answers }),
    });
    setDone(res.ok ? "Saved. Thank you." : "Could not save. Try again.");
  }
  return (
    <section className="no-print mt-6 rounded-[20px] border border-line bg-warm p-4">
      <h2 className="font-display text-2xl">Three short questions</h2>
      {questions.map(([key, label]) => (
        <div key={key} className="mt-3">
          <p>{label}</p>
          <div className="mt-1 flex gap-2">
            {[["Not really", 1], ["Somewhat", 2], ["Yes", 3]].map(([face, value]) => (
              <button key={face} type="button" aria-label={`${label}: ${face}`} className={`min-h-12 rounded-full px-3 ${answers[key] === value ? "bg-primary text-white" : "bg-surface"}`} onClick={() => setAnswers((a) => ({ ...a, [key]: value }))}>{face}</button>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className="mt-4 min-h-12 rounded-full bg-info px-5 text-white" onClick={() => void save()}>Send answers</button>
      {done ? <p className="mt-2" role="status">{done}</p> : null}
    </section>
  );
}
