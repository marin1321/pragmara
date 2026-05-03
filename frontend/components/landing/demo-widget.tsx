"use client";

import { useState, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { streamDemoQuery, type SSEEvent } from "@/lib/sse-client";

const EXAMPLE_QUESTIONS = [
  "How do I create a REST API endpoint?",
  "What is dependency injection?",
  "How does authentication work?",
];

export function DemoWidget() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = async (q?: string) => {
    const query = (q || question).trim();
    if (!query || isStreaming) return;

    setAnswer("");
    setError(null);
    setIsStreaming(true);

    abortRef.current = new AbortController();

    try {
      for await (const event of streamDemoQuery(query, abortRef.current.signal)) {
        handleEvent(event);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleEvent = (event: SSEEvent) => {
    switch (event.type) {
      case "token":
        setAnswer((prev) => prev + event.content);
        break;
      case "error":
        setError(event.message);
        break;
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/20">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-danger/60" />
          <div className="h-3 w-3 rounded-full bg-warning/60" />
          <div className="h-3 w-3 rounded-full bg-success/60" />
          <span className="ml-3 font-mono text-xs text-text-muted">
            demo@pragmara
          </span>
        </div>
      </div>

      <div className="min-h-[200px] p-4">
        {answer ? (
          <div className="font-sans text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
            {answer}
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-accent" />
            )}
          </div>
        ) : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : (
          <p className="text-sm text-text-muted">
            Ask a question about the sample documentation...
          </p>
        )}
      </div>

      <div className="border-t border-border p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            disabled={isStreaming}
          />
          <Button type="submit" size="default" disabled={isStreaming || !question.trim()}>
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => {
                setQuestion(q);
                handleSubmit(q);
              }}
              disabled={isStreaming}
              className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-text-secondary transition-colors hover:border-accent/50 hover:text-text-primary disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
