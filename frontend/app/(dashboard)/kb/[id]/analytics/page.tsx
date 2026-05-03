"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useKnowledgeBase } from "@/hooks/use-knowledge-bases";
import { useAnalytics, useRecentQueries } from "@/hooks/use-analytics";
import { OverviewCards } from "@/components/analytics/overview-cards";
import { RecentQueriesTable } from "@/components/analytics/recent-queries-table";

const QueryVolumeChart = dynamic(
  () => import("@/components/analytics/query-volume-chart").then((m) => m.QueryVolumeChart),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full bg-surface" /> }
);

const TokenUsageChart = dynamic(
  () => import("@/components/analytics/token-usage-chart").then((m) => m.TokenUsageChart),
  { ssr: false, loading: () => <Skeleton className="h-[300px] w-full bg-surface" /> }
);

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export default function AnalyticsPage() {
  const params = useParams();
  const id = params.id as string;
  const [days, setDays] = useState(30);

  const { data: kb, isLoading: kbLoading } = useKnowledgeBase(id);
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(id, days);
  const { data: recentData } = useRecentQueries(id);

  if (kbLoading) {
    return <Skeleton className="h-96 w-full bg-surface" />;
  }

  if (!kb) {
    return <p className="text-text-secondary">Knowledge base not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/kb/${id}`}
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {kb.name}
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-text-primary">
            Analytics
          </h1>
        </div>

        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {RANGES.map(({ label, days: d }) => (
            <Button
              key={d}
              variant="ghost"
              size="sm"
              onClick={() => setDays(d)}
              className={days === d ? "bg-accent-dim text-accent" : "text-text-muted"}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {analyticsLoading ? (
        <Skeleton className="h-24 w-full bg-surface" />
      ) : analytics ? (
        <>
          <OverviewCards
            totalQueries={analytics.overview.total_queries}
            totalTokens={analytics.overview.total_input_tokens + analytics.overview.total_output_tokens}
            avgFaithfulness={analytics.overview.avg_faithfulness}
            avgRelevance={analytics.overview.avg_relevance}
            p50Latency={analytics.overview.p50_latency_ms}
            p95Latency={analytics.overview.p95_latency_ms}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <QueryVolumeChart data={analytics.daily} />
            <TokenUsageChart data={analytics.daily} />
          </div>
        </>
      ) : null}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Recent Queries</h2>
        <RecentQueriesTable queries={recentData?.items || []} />
      </div>
    </div>
  );
}
