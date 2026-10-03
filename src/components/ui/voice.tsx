"use client";

import { cn } from "@/lib/cn";

export function VoiceButton({ onListen, busy, label = "Speak" }: { onListen: () => void; busy?: boolean; label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={busy}
      onClick={onListen}
      className={cn(
        "relative flex min-h-12 min-w-12 items-center justify-center rounded-full bg-growth text-white transition-transform active:scale-[0.98] disabled:opacity-50",
        busy && "animate-pulse",
      )}
    >
      <MicIcon />
    </button>
  );
}

export function SpeakerButton({ onSpeak, rate, onToggleRate }: { onSpeak: () => void; rate: number; onToggleRate: () => void }) {
  return (
    <>
      <button type="button" className="min-h-12 font-semibold text-info" onClick={onSpeak}>Tap to hear</button>
      <button type="button" className="min-h-12 text-sm font-semibold text-muted" onClick={onToggleRate}>{rate === 1 ? "Slower" : "Normal speed"}</button>
    </>
  );
}

function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
      <path d="M19 11v1a7 7 0 0 1-14 0v-1M12 19v3" />
    </svg>
  );
}
