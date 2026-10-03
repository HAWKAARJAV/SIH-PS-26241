"use client";

import { Courtyard } from "@/components/ui/primitives";
import type { ReactNode } from "react";

export function HeroScene({ children }: { children: ReactNode }) {
  return (
    <div className="decor relative overflow-hidden rounded-[var(--radius-sheet)] border border-line bg-warm p-6 shadow-[0_20px_48px_rgba(var(--shadow),0.10)]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent-soft/80 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-primary-soft/90 blur-xl" aria-hidden />
      <Courtyard className="h-36 w-full" />
      {children}
    </div>
  );
}
