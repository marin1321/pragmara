"use client";

import { useCallback, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CitationsPanel } from "./citations-panel";
import { streamQuery } from "@/lib/sse-client";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Array<{
    source: string;
    page: number | null;
    section: string | null;
    excerpt: string;
    score: number;
  }>;
}

interface QueryConsoleProps {
  kbId: string;
  apiKey: string;
}

export function QueryConsole({ kbId, apiKey }: QueryConsoleProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentCitations, setCurrentCitations] = useState<Message["citations"]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const question = input.trim();
      if (!question || isStreaming) return;

      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: question }]);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setCurrentCitations([]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        for await (const event of streamQuery(kbId, question, apiKey, controller.signal)) {
          if (event.type === "token") {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === "assistant") {
                last.content += event.content;
              }
              return updated;
            });
            scrollToBottom();
          } else if (event.type === "citations") {
            setCurrentCitations(event.data);
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === "assistant") {
                last.citations = event.data;
              }
              return updated;
            });
          } else if (event.type === "error") {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === "assistant") {
                last.content = `Error: ${event.message}`;
              }
              return updated;
            });
          }
        }
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name !== "AbortError") {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant") {
              last.content = `Error: ${error.message}`;
            }
            return updated;
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [input, isStreaming, kbId, apiKey]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Chat thread */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-text-muted">
                Ask a question about your documents...
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-lg p-4 ${
                msg.role === "user"
                  ? "ml-8 bg-accent-dim text-text-primary"
                  : "mr-8 bg-surface text-text-primary"
              }`}
            >
              <p className="text-xs font-medium text-text-muted mb-1">
                {msg.role === "user" ? "You" : "Pragmara"}
              </p>
              <div className="text-sm whitespace-pre-wrap">
                {msg.content}
                {isStreaming && i === messages.length - 1 && msg.role === "assistant" && (
                  <span className="inline-block w-2 h-4 ml-0.5 bg-accent animate-pulse" />
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border pt-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question... (Cmd+Enter to send)"
            rows={2}
            className="flex-1 resize-none rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="self-end bg-accent text-white hover:bg-accent-hover"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Citations panel */}
      <div className="hidden w-[300px] flex-shrink-0 overflow-y-auto lg:block">
        <CitationsPanel citations={currentCitations || []} />
      </div>
    </div>
  );
}
