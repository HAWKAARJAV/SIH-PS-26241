import { BRAND } from "@/config/brand";

export default function AboutPage() {
  return (
    <article className="prose-measure space-y-3">
      <h1 className="font-display text-4xl">About {BRAND.name}</h1>
      <p>{BRAND.tagline} {BRAND.persona} is the AI guide. Families do not need an account. Staff do.</p>
      <p>Nourish is a prototype for Smart India Hackathon 2026, problem SIH26241. It is not an official portal of the Ministry of Skill Development and Entrepreneurship.</p>
    </article>
  );
}
