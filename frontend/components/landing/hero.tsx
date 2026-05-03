import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(108,99,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(108,99,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(108,99,255,0.08)_0%,transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="font-display text-5xl font-bold leading-tight text-text-primary sm:text-6xl lg:text-7xl">
          Your docs,{" "}
          <span className="text-accent">answerable.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary sm:text-xl">
          Upload documentation. Get a query API. Streaming answers with
          citations and evaluation scores — powered by RAG.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button render={<Link href="/auth/login" />} size="lg" className="px-8 text-base">
            Start for free
          </Button>
          <Button render={<a href="#demo" />} variant="outline" size="lg" className="px-8 text-base">
            See live demo
          </Button>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted">
          <span>FastAPI</span>
          <span className="h-3 w-px bg-border" />
          <span>Next.js</span>
          <span className="h-3 w-px bg-border" />
          <span>Qdrant</span>
          <span className="h-3 w-px bg-border" />
          <span>Groq</span>
          <span className="h-3 w-px bg-border" />
          <span>Voyage AI</span>
        </div>
      </div>
    </section>
  );
}
