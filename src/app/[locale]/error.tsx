"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-[20px] border border-line bg-danger-soft p-6">
      <h1 className="font-display text-3xl">This page did not load</h1>
      <p className="mt-2">Check your connection and try again. Your saved plan stays on this device.</p>
      <button type="button" className="mt-4 min-h-12 rounded-full bg-primary px-5 text-white" onClick={() => reset()}>Try again</button>
    </div>
  );
}
