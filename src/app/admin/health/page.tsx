import { requireStaff } from "@/lib/auth/guard";
import { isDemoMode } from "@/config/env";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  await requireStaff();
  return (
    <section>
      <h1 className="font-display text-3xl">System health</h1>
      <p>Demo mode: {isDemoMode() ? "on" : "off"}.</p>
      <p>Database: SQLite file by default. Postgres is a provider swap documented in deployment notes.</p>
    </section>
  );
}
