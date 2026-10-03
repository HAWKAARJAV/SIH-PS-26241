"use client";

import { useState } from "react";

const sample = `trade_slug,scope,district,state,provider_name,cohort_period,cohort_size,placement_rate,earnings_p25,earnings_median,earnings_p75
electrician,district,Neemganj,Uttar Pradesh,,Apr 2025 – Mar 2026,40,0.7,11000,15000,21000
sewing,district,Mullai,Tamil Nadu,,Apr 2025 – Mar 2026,32,0.45,9000,12000,16000`;

export function ImportPanel({ email }: { email: string }) {
  const [out, setOut] = useState("");
  async function dry() {
    const [header, ...lines] = sample.trim().split("\n");
    const headers = header!.split(",");
    const rows = lines.map((line) => {
      const cells = line.split(",");
      return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]));
    });
    const res = await fetch("/api/v1/import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ filename: "organiser.csv", headers, rows }) });
    const data = await res.json();
    setOut(JSON.stringify(data, null, 2));
  }
  return (
    <div className="rounded-[20px] border border-line bg-surface p-4">
      <p>Signed in as {email}. Dry-run uses the organiser sample. A second steward must approve.</p>
      <button type="button" className="mt-2 min-h-12 rounded-full bg-primary px-4 text-white" onClick={() => void dry()}>Dry-run sample</button>
      {out ? <pre className="mt-3 overflow-auto text-xs">{out}</pre> : null}
    </div>
  );
}
