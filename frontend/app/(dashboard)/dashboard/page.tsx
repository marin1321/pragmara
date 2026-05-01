"use client";

import Link from "next/link";
import { Database, MessageSquare, Clock, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KBCard } from "@/components/kb/kb-card";
import { useKnowledgeBases } from "@/hooks/use-knowledge-bases";

const stats = [
  { label: "Knowledge Bases", value: "0", icon: Database },
  { label: "Queries This Month", value: "0", icon: MessageSquare },
  { label: "Avg Latency", value: "—", icon: Clock },
  { label: "Avg Faithfulness", value: "—", icon: TrendingUp },
];

export default function DashboardPage() {
  const { data, isLoading } = useKnowledgeBases();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Overview of your knowledge bases and usage
          </p>
        </div>
        <Link href="/kb/new">
          <Button className="bg-accent text-white hover:bg-accent-hover">
            <Plus className="mr-2 h-4 w-4" />
            New KB
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-surface">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2">
                  <stat.icon className="h-4 w-4 text-text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Your Knowledge Bases
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl bg-surface" />
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.items.map((kb) => (
              <KBCard
                key={kb.id}
                id={kb.id}
                name={kb.name}
                description={kb.description}
                docCount={kb.doc_count}
                status={kb.status}
              />
            ))}
          </div>
        ) : (
          <Card className="border-border bg-surface">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-dim">
                <Database className="h-7 w-7 text-accent" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-text-primary">
                No knowledge bases yet
              </h3>
              <p className="mt-2 text-center text-sm text-text-secondary">
                Create your first knowledge base to start indexing documents
              </p>
              <Link href="/kb/new">
                <Button className="mt-6 bg-accent text-white hover:bg-accent-hover">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Knowledge Base
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
