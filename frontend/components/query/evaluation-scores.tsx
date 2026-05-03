"use client";

import { ShieldCheck, Target, Layers } from "lucide-react";

interface EvaluationScoresProps {
  faithfulness: number | null;
  relevance: number | null;
  contextPrecision: number | null;
}

const metrics = [
  { key: "faithfulness" as const, label: "Faithfulness", icon: ShieldCheck, tooltip: "Does the answer stay grounded in the provided context?" },
  { key: "relevance" as const, label: "Relevance", icon: Target, tooltip: "Does the answer address the question asked?" },
  { key: "contextPrecision" as const, label: "Context Precision", icon: Layers, tooltip: "Are the retrieved chunks relevant to the question?" },
];

function scoreColor(score: number): string {
  if (score >= 0.7) return "bg-success";
  if (score >= 0.4) return "bg-warning";
  return "bg-danger";
}

function scoreLabelColor(score: number): string {
  if (score >= 0.7) return "text-success";
  if (score >= 0.4) return "text-warning";
  return "text-danger";
}

export function EvaluationScores({ faithfulness, relevance, contextPrecision }: EvaluationScoresProps) {
  const scores = { faithfulness, relevance, contextPrecision };
  const hasAnyScore = Object.values(scores).some((s) => s !== null);

  if (!hasAnyScore) return null;

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-border bg-surface-2 p-3">
      <p className="text-xs font-medium text-text-muted">Evaluation Scores</p>
      {metrics.map(({ key, label, icon: Icon, tooltip }) => {
        const score = scores[key];
        if (score === null) return null;

        return (
          <div key={key} className="flex items-center gap-2" title={tooltip}>
            <Icon className="h-3.5 w-3.5 flex-shrink-0 text-text-muted" />
            <span className="w-28 text-xs text-text-secondary">{label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${scoreColor(score)}`}
                style={{ width: `${Math.round(score * 100)}%` }}
              />
            </div>
            <span className={`w-10 text-right text-xs font-mono font-medium ${scoreLabelColor(score)}`}>
              {(score * 100).toFixed(0)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
