import { Link } from "@/lib/i18n/navigation";
import { TradeIcon } from "@/components/ui/trade-icon";
import { VerificationBadge } from "@/components/ui/primitives";

type Trade = { slug: string; name: string; nsqfLevel: unknown; durationMonths: number; entryQualification: string };

export function TradeCard({ trade }: { trade: Trade }) {
  return (
    <Link
      href={`/trades/${trade.slug}`}
      className="group flex min-h-[7.5rem] gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-[0_8px_24px_rgba(var(--shadow),0.06)] transition-transform active:scale-[0.99]"
    >
      <TradeIcon slug={trade.slug} />
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-2xl group-hover:text-primary">{trade.name}</h2>
        <p className="text-sm text-muted">
          NSQF {String(trade.nsqfLevel)} · {trade.durationMonths} months · {trade.entryQualification}
        </p>
        <div className="mt-2">
          <VerificationBadge tier="V0" />
        </div>
      </div>
    </Link>
  );
}
