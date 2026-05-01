"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useKnowledgeBase } from "@/hooks/use-knowledge-bases";
import { QueryConsole } from "@/components/query/query-console";
import { APIKeyManager } from "@/components/query/api-key-manager";
import { Skeleton } from "@/components/ui/skeleton";

export default function QueryPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: kb, isLoading } = useKnowledgeBase(id);
  const [apiKey, setApiKey] = useState("");

  if (isLoading) {
    return <Skeleton className="h-96 w-full bg-surface" />;
  }

  if (!kb) {
    return <p className="text-text-secondary">Knowledge base not found.</p>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link
            href={`/kb/${id}`}
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {kb.name}
          </Link>
          <h1 className="mt-2 font-display text-xl font-bold text-text-primary">
            Query Console
          </h1>
        </div>
      </div>

      <div className="mb-4">
        <APIKeyManager kbId={id} selectedKey={apiKey} onSelectKey={setApiKey} />
      </div>

      {apiKey ? (
        <div className="flex-1 min-h-0">
          <QueryConsole kbId={id} apiKey={apiKey} />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-border bg-surface">
          <p className="text-text-muted">
            Create an API key above to start querying your documents
          </p>
        </div>
      )}
    </div>
  );
}
