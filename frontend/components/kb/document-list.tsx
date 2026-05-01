"use client";

import { FileText, Globe, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteDocument } from "@/hooks/use-documents";

interface Document {
  id: string;
  name: string;
  source_type: string;
  chunk_count: number;
  token_count: number;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface DocumentListProps {
  kbId: string;
  documents: Document[];
}

const statusStyles: Record<string, string> = {
  pending: "border-text-muted/30 bg-text-muted/10 text-text-muted",
  processing: "border-warning/30 bg-warning/15 text-warning",
  indexed: "border-success/30 bg-success/15 text-success",
  failed: "border-danger/30 bg-danger/15 text-danger",
};

export function DocumentList({ kbId, documents }: DocumentListProps) {
  const deleteDoc = useDeleteDocument(kbId);

  if (documents.length === 0) return null;

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            {doc.source_type === "url" ? (
              <Globe className="h-4 w-4 flex-shrink-0 text-text-muted" />
            ) : (
              <FileText className="h-4 w-4 flex-shrink-0 text-text-muted" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">
                {doc.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                {doc.status === "indexed" && (
                  <span>{doc.chunk_count} chunks · {doc.token_count.toLocaleString()} tokens</span>
                )}
                {doc.status === "failed" && doc.error_message && (
                  <span className="text-danger">{doc.error_message}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusStyles[doc.status] || ""}>
              {doc.status}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-muted hover:text-danger"
              onClick={() => deleteDoc.mutate(doc.id)}
              disabled={deleteDoc.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
