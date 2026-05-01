"use client";

import { useState } from "react";
import { Database, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/magic-link", { email });
      setIsSent(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md border-border bg-surface">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-dim">
            <Database className="h-6 w-6 text-accent" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Sign in to Pragmara
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Enter your email to receive a magic login link
          </p>
        </CardHeader>

        <CardContent>
          {isSent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
                <Mail className="h-6 w-6 text-success" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">
                Check your email
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                We sent a login link to{" "}
                <span className="font-medium text-text-primary">{email}</span>
              </p>
              <Button
                variant="ghost"
                className="mt-4 text-accent"
                onClick={() => setIsSent(false)}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-text-secondary">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-border bg-surface-2 text-text-primary placeholder:text-text-muted"
                />
              </div>

              {error && (
                <p className="text-sm text-danger">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-accent text-white hover:bg-accent-hover"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send magic link"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
