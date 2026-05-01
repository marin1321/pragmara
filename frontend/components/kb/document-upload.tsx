"use client";

import { useCallback, useState } from "react";
import { FileUp, Globe, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUploadDocument, useSubmitURL } from "@/hooks/use-documents";

interface DocumentUploadProps {
  kbId: string;
}

const ACCEPTED_TYPES = ".pdf,.md,.txt,.markdown";
const MAX_SIZE = 50 * 1024 * 1024;

export function DocumentUpload({ kbId }: DocumentUploadProps) {
  const uploadDoc = useUploadDocument(kbId);
  const submitURL = useSubmitURL(kbId);
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > MAX_SIZE) {
        alert("File too large. Maximum size is 50MB.");
        return;
      }
      uploadDoc.mutate(file);
    },
    [uploadDoc]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleURLSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      submitURL.mutate(url.trim());
      setUrl("");
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? "border-accent bg-accent-dim"
            : "border-border hover:border-accent/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="mb-3 h-8 w-8 text-text-muted" />
        <p className="text-sm text-text-secondary">
          Drag & drop a file here, or
        </p>
        <label className="mt-2 cursor-pointer">
          <span className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent-dim transition-colors">
            <FileUp className="h-4 w-4" />
            Browse files
          </span>
          <input
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </label>
        <p className="mt-2 text-xs text-text-muted">
          PDF, Markdown, or TXT — max 50MB
        </p>
        {uploadDoc.isPending && (
          <p className="mt-2 text-sm text-accent">Uploading...</p>
        )}
      </div>

      <form onSubmit={handleURLSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="https://docs.example.com/page"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border-border bg-surface-2 pl-9 text-text-primary placeholder:text-text-muted"
          />
        </div>
        <Button
          type="submit"
          disabled={!url.trim() || submitURL.isPending}
          className="bg-accent text-white hover:bg-accent-hover"
        >
          {submitURL.isPending ? "Adding..." : "Add URL"}
        </Button>
      </form>
    </div>
  );
}
