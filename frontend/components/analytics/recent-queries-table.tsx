"use client";

import { useState } from "react";

interface RecentQuery {
  id: string;
  question: string;
  answer: string | null;
  faithfulness_score: number | null;
  relevance_score: number | null;
  context_precision_score: number | null;
  latency_ms: number | null;
  created_at: string;
}

interface RecentQueriesTableProps {
  queries: RecentQuery[];
}

function formatScore(score: number | null): string {
  if (score === null) return "—";
  return `${(score * 100).toFixed(0)}%`;
}

function scoreClass(score: number | null): string {
  if (score === null) return "text-text-muted";
  if (score >= 0.7) return "text-success";
  if (score >= 0.4) return "text-warning";
  return "text-danger";
}

export function RecentQueriesTable({ queries }: RecentQueriesTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (queries.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-border bg-surface">
        <p className="text-sm text-text-muted">No queries yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              <th className="px-4 py-3 text-left text-xs font-medium text-text-muted">Question</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-text-muted">Faith.</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-text-muted">Relev.</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-text-muted">Ctx P.</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-text-muted">Latency</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-text-muted">Time</th>
            </tr>
          </thead>
          <tbody>
            {queries.map((q) => (
              <tr
                key={q.id}
                className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              >
                <td className="px-4 py-3 text-text-primary">
                  <p className="truncate max-w-[300px]">{q.question}</p>
                  {expandedId === q.id && q.answer && (
                    <p className="mt-2 text-xs text-text-secondary whitespace-pre-wrap line-clamp-4">
                      {q.answer}
                    </p>
                  )}
                </td>
                <td className={`px-4 py-3 text-center font-mono text-xs ${scoreClass(q.faithfulness_score)}`}>
                  {formatScore(q.faithfulness_score)}
                </td>
                <td className={`px-4 py-3 text-center font-mono text-xs ${scoreClass(q.relevance_score)}`}>
                  {formatScore(q.relevance_score)}
                </td>
                <td className={`px-4 py-3 text-center font-mono text-xs ${scoreClass(q.context_precision_score)}`}>
                  {formatScore(q.context_precision_score)}
                </td>
                <td className="px-4 py-3 text-center font-mono text-xs text-text-secondary">
                  {q.latency_ms ? `${q.latency_ms}ms` : "—"}
                </td>
                <td className="px-4 py-3 text-right text-xs text-text-muted whitespace-nowrap">
                  {new Date(q.created_at).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
