"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setError("No verification token provided.");
      return;
    }

    api
      .get(`/auth/verify?token=${token}`)
      .then((res) => {
        login(res.data.access_token);
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setError(
          err.response?.data?.detail || "Verification failed. The link may have expired."
        );
      });
  }, [searchParams, login, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="mt-4 text-text-secondary">Verifying your login...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-success" />
            <h2 className="mt-4 text-xl font-semibold text-text-primary">
              You&apos;re in!
            </h2>
            <p className="mt-2 text-text-secondary">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-danger" />
            <h2 className="mt-4 text-xl font-semibold text-text-primary">
              Verification failed
            </h2>
            <p className="mt-2 text-text-secondary">{error}</p>
            <Button
              className="mt-6 bg-accent text-white hover:bg-accent-hover"
              onClick={() => router.push("/auth/login")}
            >
              Back to login
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
