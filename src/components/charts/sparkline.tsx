"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("./sparkline-inner").then((m) => m.SparklineInner), {
  ssr: false,
  loading: () => <div className="h-12 w-full animate-pulse rounded-lg bg-sunken" aria-hidden />,
});

export function Sparkline({ data, label }: { data: number[]; label: string }) {
  if (typeof document !== "undefined" && document.documentElement.dataset.lite === "1") {
    return (
      <p className="text-sm text-muted">
        {label}: {data[data.length - 1] ?? "—"} (lite mode hides chart)
      </p>
    );
  }
  return <Chart data={data} label={label} />;
}
