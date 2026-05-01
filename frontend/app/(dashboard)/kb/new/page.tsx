"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateKB } from "@/hooks/use-knowledge-bases";

export default function NewKBPage() {
  const router = useRouter();
  const createKB = useCreateKB();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const kb = await createKB.mutateAsync({
        name,
        description: description || undefined,
      });
      router.push(`/kb/${kb.id}`);
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">
          Create Knowledge Base
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          A knowledge base holds your documents and provides a query API
        </p>
      </div>

      <Card className="border-border bg-surface">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-text-secondary">
                Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. React Documentation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-border bg-surface-2 text-text-primary placeholder:text-text-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-text-secondary">
                Description{" "}
                <span className="text-text-muted">(optional)</span>
              </Label>
              <Input
                id="description"
                placeholder="What documents will this KB contain?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-border bg-surface-2 text-text-primary placeholder:text-text-muted"
              />
            </div>

            {createKB.isError && (
              <p className="text-sm text-danger">
                Failed to create knowledge base. Please try again.
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-accent text-white hover:bg-accent-hover"
              disabled={createKB.isPending || !name.trim()}
            >
              {createKB.isPending ? "Creating..." : "Create Knowledge Base"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
