"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Database,
  FileText,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "API Docs", href: "/api-docs", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[260px] flex-shrink-0 border-r border-border bg-background md:flex md:flex-col">
      <div className="flex h-14 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Database className="h-5 w-5 text-accent" />
          <span className="font-display text-lg font-bold text-text-primary">
            Pragmara
          </span>
        </Link>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "border-l-2 border-accent bg-accent-dim text-text-primary"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4" />

        <div className="px-3">
          <p className="mb-2 text-xs font-medium uppercase text-text-muted">
            Knowledge Bases
          </p>
          <div className="space-y-1">
            <p className="px-3 py-2 text-sm text-text-muted">
              No knowledge bases yet
            </p>
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-surface-2 p-3">
          <p className="text-xs text-text-secondary">Queries this month</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            0 <span className="text-xs font-normal text-text-muted">/ 50</span>
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-border">
            <div className="h-full w-0 rounded-full bg-accent" />
          </div>
        </div>
      </div>
    </aside>
  );
}
