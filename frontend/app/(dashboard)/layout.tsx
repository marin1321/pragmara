"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/lib/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
