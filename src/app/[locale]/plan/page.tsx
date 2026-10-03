"use client";

import { toPng } from "html-to-image";
import { useEffect, useRef, useState } from "react";

export default function PlanPage() {
  const ref = useRef<HTMLElement>(null);
  const [profile, setProfile] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    const raw = localStorage.getItem("nourish.profile");
    setProfile(raw ? JSON.parse(raw) as Record<string, string> : null);
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
        <p>Interest: {profile.interest}. District: {profile.districtId}. Worry: {profile.worry}.</p>
        <h2 className="font-display text-2xl">Next steps</h2>
        <ol className="list-decimal pl-5">
          <li>Visit one centre in daylight.</li>
          <li>Ask the four questions on the provider page.</li>
          <li>Compare with a degree path before paying.</li>
        </ol>
        <p className="text-sm">Prototype for Smart India Hackathon 2026 — not an official government portal.</p>
      </article>
      <div className="no-print mt-4 flex gap-2">
        <button type="button" className="min-h-12 rounded-full bg-primary px-5 text-white" onClick={() => window.print()}>Print / PDF</button>
        <button type="button" className="min-h-12 rounded-full bg-growth px-5 text-white" onClick={() => void shareImage()}>WhatsApp image</button>
      </div>
    </div>
  );
}
