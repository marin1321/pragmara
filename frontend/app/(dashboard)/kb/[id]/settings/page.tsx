"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useKnowledgeBase, useDeleteKB } from "@/hooks/use-knowledge-bases";

export default function KBSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: kb, isLoading } = useKnowledgeBase(id);
  const deleteKB = useDeleteKB();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = async () => {
    await deleteKB.mutateAsync(id);
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-surface" />
        <Skeleton className="h-48 w-full bg-surface" />
      </div>
    );
  }

  if (!kb) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href={`/kb/${id}`}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {kb.name}
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">
          Settings
        </h1>
      </div>

      <Card className="border-border bg-surface">
        <CardHeader>
          <h2 className="text-sm font-medium text-text-secondary">General</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-text-secondary">Name</Label>
            <Input
              value={kb.name}
              disabled
              className="border-border bg-surface-2 text-text-primary"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-text-secondary">Slug</Label>
            <Input
              value={kb.slug}
              disabled
              className="border-border bg-surface-2 font-mono text-sm text-text-muted"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-text-secondary">Qdrant Collection</Label>
            <Input
              value={kb.qdrant_collection}
              disabled
              className="border-border bg-surface-2 font-mono text-sm text-text-muted"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-danger/20 bg-surface">
        <CardHeader>
          <h2 className="text-sm font-medium text-danger">Danger Zone</h2>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-text-secondary">
            Deleting a knowledge base removes all documents, chunks, and query
            history permanently. This action cannot be undone.
          </p>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-danger text-danger hover:bg-danger/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Knowledge Base
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border bg-surface">
              <DialogHeader>
                <DialogTitle className="text-text-primary">
                  Delete &quot;{kb.name}&quot;?
                </DialogTitle>
                <DialogDescription className="text-text-secondary">
                  This will permanently delete the knowledge base, all documents,
                  and the Qdrant collection. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setDeleteOpen(false)}
                  className="text-text-secondary"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteKB.isPending}
                  className="bg-danger text-white hover:bg-danger/90"
                >
                  {deleteKB.isPending ? "Deleting..." : "Delete permanently"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
