"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useKnowledgeBase } from "@/hooks/use-knowledge-bases";
import { useDocuments } from "@/hooks/use-documents";
import { DocumentUpload } from "@/components/kb/document-upload";
import { DocumentList } from "@/components/kb/document-list";

export default function KBOverviewPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: kb, isLoading } = useKnowledgeBase(id);
  const { data: docsData } = useDocuments(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 bg-surface" />
        <Skeleton className="h-4 w-96 bg-surface" />
        <Skeleton className="h-48 w-full bg-surface" />
      </div>
    );
  }

  if (!kb) {
    return (
      <div className="text-center">
        <p className="text-text-secondary">Knowledge base not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-text-primary">
              {kb.name}
            </h1>
            <Badge
              variant="outline"
              className="border-success/30 bg-success/15 text-success"
            >
              {kb.status}
            </Badge>
          </div>
          {kb.description && (
            <p className="mt-1 text-sm text-text-secondary">{kb.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/kb/${id}/query`}>
            <Button className="bg-accent text-white hover:bg-accent-hover">
              <MessageSquare className="mr-2 h-4 w-4" />
              Query
            </Button>
          </Link>
          <Link href={`/kb/${id}/settings`}>
            <Button variant="ghost" size="icon" className="text-text-secondary">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border bg-surface">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">{kb.doc_count}</p>
            <p className="text-xs text-text-muted">Documents</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">{kb.chunk_count}</p>
            <p className="text-xs text-text-muted">Chunks</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-surface">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">
              {kb.total_tokens.toLocaleString()}
            </p>
            <p className="text-xs text-text-muted">Total Tokens</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Documents</h2>
        <DocumentUpload kbId={id} />
        {docsData && <DocumentList kbId={id} documents={docsData.items} />}
      </div>
    </div>
  );
}
