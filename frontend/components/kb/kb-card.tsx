"use client";

import Link from "next/link";
import { Database, FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KBCardProps {
  id: string;
  name: string;
  description: string | null;
  docCount: number;
  status: string;
}

export function KBCard({ id, name, description, docCount, status }: KBCardProps) {
  return (
    <Link href={`/kb/${id}`}>
      <Card className="border-border bg-surface transition-colors hover:border-accent/30 hover:bg-surface-2">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-accent" />
            <h3 className="font-medium text-text-primary">{name}</h3>
          </div>
          <Badge
            variant="outline"
            className={
              status === "active"
                ? "border-success/30 bg-success/15 text-success"
                : "border-warning/30 bg-warning/15 text-warning"
            }
          >
            {status}
          </Badge>
        </CardHeader>
        <CardContent>
          {description && (
            <p className="mb-3 text-sm text-text-secondary line-clamp-2">
              {description}
            </p>
          )}
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <FileText className="h-3 w-3" />
            <span>{docCount} documents</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
