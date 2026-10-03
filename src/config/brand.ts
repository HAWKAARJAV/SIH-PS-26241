export const BRAND = {
  name: "Nourish",
  persona: process.env.NEXT_PUBLIC_GUIDE_NAME ?? "Disha",
  tagline: "Skills that feed a family.",
  disclaimer:
    "Prototype for Smart India Hackathon 2026 — not an official government portal.",
} as const;

export type Brand = typeof BRAND;
