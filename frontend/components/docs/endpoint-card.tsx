"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CodeBlock } from "./code-block";

interface EndpointCardProps {
  method: "GET" | "POST" | "DELETE";
  path: string;
  description: string;
  auth: "None" | "JWT" | "API Key";
  examples: Array<{
    language: string;
    code: string;
  }>;
}

const methodColors: Record<string, string> = {
  GET: "bg-success/15 text-success",
  POST: "bg-accent/15 text-accent",
  DELETE: "bg-danger/15 text-danger",
};

export function EndpointCard({ method, path, description, auth, examples }: EndpointCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-surface-2"
      >
        <span className={`shrink-0 rounded px-2 py-0.5 font-mono text-xs font-medium ${methodColors[method]}`}>
          {method}
        </span>
        <span className="font-mono text-sm text-text-primary">{path}</span>
        <span className="ml-auto hidden text-xs text-text-muted sm:block">{auth}</span>
        <ChevronDown
          className={`h-4 w-4 text-text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-border px-6 py-4">
          <p className="text-sm text-text-secondary">{description}</p>

          {examples.length > 0 && (
            <div className="mt-4">
              <div className="flex gap-2 border-b border-border pb-2">
                {examples.map((ex, i) => (
                  <button
                    key={ex.language}
                    onClick={() => setActiveTab(i)}
                    className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                      activeTab === i
                        ? "bg-accent/15 text-accent"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {ex.language}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <CodeBlock
                  code={examples[activeTab].code}
                  language={examples[activeTab].language}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
