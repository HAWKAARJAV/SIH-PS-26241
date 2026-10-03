import { Link } from "@/lib/i18n/navigation";

export default function NotFound() {
  return (
    <div className="rounded-[20px] bg-warm p-6">
      <h1 className="font-display text-4xl">That page is not here</h1>
      <p className="mt-2 text-muted">Go back home, or open Help if you were in the middle of a plan.</p>
      <Link href="/" className="mt-4 inline-flex min-h-12 items-center rounded-full bg-primary px-5 text-white">Home</Link>
    </div>
  );
}
