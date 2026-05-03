"use client";

import { Activity, Clock, Coins, MessageSquare, ShieldCheck, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OverviewCardsProps {
  totalQueries: number;
  totalTokens: number;
  avgFaithfulness: number | null;
  avgRelevance: number | null;
  p50Latency: number | null;
  p95Latency: number | null;
}

export function OverviewCards({
  totalQueries,
  totalTokens,
  avgFaithfulness,
  avgRelevance,
  p50Latency,
  p95Latency,
}: OverviewCardsProps) {
  const cards = [
    { label: "Total Queries", value: totalQueries.toLocaleString(), icon: MessageSquare },
    { label: "Total Tokens", value: totalTokens.toLocaleString(), icon: Coins },
    { label: "Avg Faithfulness", value: avgFaithfulness !== null ? `${(avgFaithfulness * 100).toFixed(0)}%` : "—", icon: ShieldCheck },
    { label: "Avg Relevance", value: avgRelevance !== null ? `${(avgRelevance * 100).toFixed(0)}%` : "—", icon: Target },
    { label: "P50 Latency", value: p50Latency !== null ? `${p50Latency}ms` : "—", icon: Clock },
    { label: "P95 Latency", value: p95Latency !== null ? `${p95Latency}ms` : "—", icon: Activity },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="border-border bg-surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-text-muted" />
              <span className="text-xs text-text-muted">{label}</span>
            </div>
            <p className="mt-2 text-xl font-bold text-text-primary">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
