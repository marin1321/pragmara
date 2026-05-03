"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TokenUsageChartProps {
  data: Array<{
    date: string;
    total_input_tokens: number;
    total_output_tokens: number;
  }>;
}

export function TokenUsageChart({ data }: TokenUsageChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-border bg-surface">
        <p className="text-sm text-text-muted">No token data yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-4 text-sm font-medium text-text-secondary">Token Usage</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
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
          <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--text-muted))" }} />
          <Bar dataKey="total_input_tokens" name="Input" fill="hsl(var(--accent))" radius={[2, 2, 0, 0]} />
          <Bar dataKey="total_output_tokens" name="Output" fill="hsl(var(--success))" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
