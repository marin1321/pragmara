"use client";

import { FileText } from "lucide-react";

interface Citation {
  source: string;
  page: number | null;
  section: string | null;
  excerpt: string;
  score: number;
}

interface CitationsPanelProps {
  citations: Citation[];
}

export function CitationsPanel({ citations }: CitationsPanelProps) {
  if (citations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text-secondary">
        Sources ({citations.length})
      </h3>
      {citations.map((citation, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-surface p-3"
        >
          <div className="flex items-start gap-2">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-accent-dim text-xs font-medium text-accent">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 text-text-muted" />
                <span className="truncate text-xs font-medium text-text-primary">
                  {citation.source}
                </span>
              </div>
              <div className="mt-0.5 flex gap-2 text-xs text-text-muted">
                {citation.page && <span>Page {citation.page}</span>}
                {citation.section && <span>· {citation.section}</span>}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-text-secondary line-clamp-3">
                {citation.excerpt}
              </p>
              <div className="mt-2 h-1 rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.round(citation.score * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
