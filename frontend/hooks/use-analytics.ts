"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface DailyMetric {
  date: string;
  query_count: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_faithfulness: number | null;
  avg_relevance: number | null;
  avg_context_precision: number | null;
  avg_latency_ms: number | null;
}

interface OverviewMetrics {
  total_queries: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_faithfulness: number | null;
  avg_relevance: number | null;
  avg_context_precision: number | null;
  p50_latency_ms: number | null;
  p95_latency_ms: number | null;
}

interface AnalyticsResponse {
  overview: OverviewMetrics;
  daily: DailyMetric[];
}

interface RecentQuery {
  id: string;
  question: string;
  answer: string | null;
  model: string;
  faithfulness_score: number | null;
  relevance_score: number | null;
  context_precision_score: number | null;
  latency_ms: number | null;
  created_at: string;
}

interface RecentQueriesResponse {
  items: RecentQuery[];
  total: number;
}

export function useAnalytics(kbId: string, days: number = 30) {
  return useQuery<AnalyticsResponse>({
    queryKey: ["analytics", kbId, days],
    queryFn: async () => {
      const res = await api.get(`/v1/kb/${kbId}/analytics?days=${days}`);
      return res.data;
    },
    enabled: !!kbId,
  });
}

export function useRecentQueries(kbId: string) {
  return useQuery<RecentQueriesResponse>({
    queryKey: ["recent-queries", kbId],
    queryFn: async () => {
      const res = await api.get(`/v1/kb/${kbId}/analytics/recent`);
      return res.data;
    },
    enabled: !!kbId,
  });
}
