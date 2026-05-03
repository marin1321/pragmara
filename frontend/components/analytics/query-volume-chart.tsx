"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface QueryVolumeChartProps {
  data: Array<{ date: string; query_count: number }>;
}

export function QueryVolumeChart({ data }: QueryVolumeChartProps) {
  if (data.length === 0) {
    return <EmptyChart message="No query data yet" />;
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-4 text-sm font-medium text-text-secondary">Query Volume</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="queryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(var(--text-muted))", fontSize: 11 }}
            tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
          />
          <YAxis tick={{ fill: "hsl(var(--text-muted))", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
            labelStyle={{ color: "hsl(var(--text-primary))" }}
          />
          <Area
            type="monotone"
            dataKey="query_count"
            stroke="hsl(var(--accent))"
            fill="url(#queryGradient)"
            strokeWidth={2}
            name="Queries"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-lg border border-border bg-surface">
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  );
}
