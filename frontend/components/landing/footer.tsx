import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <Link href="/" className="font-display text-lg font-bold text-text-primary">
              Pragmara
            </Link>
            <p className="mt-2 text-sm text-text-secondary">
              RAG-as-a-Service for Technical Documentation
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/marin1321/pragmara"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <Link href="/api-docs" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              API Docs
            </Link>
            <a
              href="https://oscarmarin.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Portfolio
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-8">
          {["FastAPI", "Next.js", "Qdrant", "Groq", "Voyage AI", "Tailwind CSS"].map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-surface-2 px-3 py-1 text-xs text-text-muted"
            >
              {tech}
            </span>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Oscar Marín. Built as a portfolio project.
        </p>
      </div>
    </footer>
  );
}
