import { Upload, Database, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload",
    description: "Drop PDFs, Markdown files, or paste URLs. We parse and clean your docs automatically.",
  },
  {
    icon: Database,
    title: "Index",
    description: "Documents are chunked, embedded with Voyage AI, and stored in a vector database.",
  },
  {
    icon: MessageSquare,
    title: "Query",
    description: "Ask questions via API or chat. Get streaming answers with citations and evaluation scores.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center font-display text-3xl font-bold text-text-primary sm:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-text-secondary">
          Three steps from documentation to answerable knowledge base.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              {i < steps.length - 1 && (
                <div className="absolute top-10 left-[calc(50%+48px)] hidden h-px w-[calc(100%-96px)] bg-gradient-to-r from-border to-transparent md:block" />
              )}

              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <step.icon className="h-8 w-8" strokeWidth={1.5} />
              </div>

              <span className="mt-2 font-mono text-xs text-text-muted">
                0{i + 1}
              </span>

              <h3 className="mt-3 font-display text-xl font-semibold text-text-primary">
                {step.title}
              </h3>

              <p className="mt-2 max-w-xs text-sm text-text-secondary">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
