import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="font-display text-4xl">That page is not here</h1>
      <p className="mt-2">Prototype for Smart India Hackathon 2026 — not an official government portal.</p>
      <Link className="mt-4 inline-flex min-h-12 items-center text-primary" href="/en">Go to Nourish</Link>
    </main>
  );
}
