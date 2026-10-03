"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#FBF6EE", color: "#2A211B", fontFamily: "sans-serif", padding: 24 }}>
        <h1>Something went wrong</h1>
        <p>Try again. If you were saving a plan, it may still be on this device.</p>
        <button type="button" onClick={() => reset()}>Try again</button>
        <p>Prototype for Smart India Hackathon 2026 — not an official government portal.</p>
      </body>
    </html>
  );
}
