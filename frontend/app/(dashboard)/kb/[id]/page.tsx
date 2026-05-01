"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Settings, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useKnowledgeBase } from "@/hooks/use-knowledge-bases";

export default function KBOverviewPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: kb, isLoading } = useKnowledgeBase(id);

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
        <Link href={`/kb/${id}/settings`}>
          <Button variant="ghost" size="icon" className="text-text-secondary">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
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

      <Card className="border-border bg-surface">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2">
            <FileText className="h-7 w-7 text-text-muted" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-text-primary">
            No documents yet
          </h3>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Upload PDFs, Markdown files, or submit URLs to start indexing
          </p>
          <Button className="mt-6 bg-accent text-white hover:bg-accent-hover" disabled>
            <Upload className="mr-2 h-4 w-4" />
            Upload Documents (Phase 2)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
