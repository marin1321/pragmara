"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, LayoutDashboard, FileText, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "API Docs", href: "/api-docs", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center border-b border-border bg-background px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" className="mr-3" />}
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] bg-background p-0">
          <div className="flex h-14 items-center px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <Database className="h-5 w-5 text-accent" />
              <span className="font-display text-lg font-bold text-text-primary">
                Pragmara
              </span>
            </Link>
          </div>
          <nav className="space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
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
        </SheetContent>
      </Sheet>

      <Link href="/dashboard" className="flex items-center gap-2">
        <Database className="h-5 w-5 text-accent" />
        <span className="font-display text-base font-bold text-text-primary">
          Pragmara
        </span>
      </Link>
    </header>
  );
}
