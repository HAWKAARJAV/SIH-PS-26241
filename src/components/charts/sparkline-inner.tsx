"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

export function SparklineInner({ data, label }: { data: number[]; label: string }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-14 w-full" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
          <Line type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
