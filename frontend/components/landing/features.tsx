import { Search, Quote, BarChart3, Activity, Code2, FileText } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Hybrid Search",
    description: "Vector + semantic retrieval with cross-encoder reranking for precise results.",
  },
  {
    icon: Quote,
    title: "Citation Tracking",
    description: "Every answer includes source, page, and section references you can verify.",
  },
  {
    icon: BarChart3,
    title: "Evaluation Scores",
    description: "Faithfulness, relevance, and context precision scored automatically per query.",
  },
  {
    icon: Activity,
    title: "Usage Analytics",
    description: "Track query volume, token usage, latency, and quality trends over time.",
  },
  {
    icon: Code2,
    title: "API-First",
    description: "Clean REST API with streaming SSE responses. Integrate anywhere in minutes.",
  },
  {
    icon: FileText,
    title: "Multi-Format Support",
    description: "PDFs, Markdown, and web URLs ingested with intelligent chunking and metadata.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center font-display text-3xl font-bold text-text-primary sm:text-4xl">
          Built for production
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-text-secondary">
          Everything you need to serve AI-powered answers from your documentation.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-surface p-6 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                <feature.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>

              <h3 className="mt-4 font-display text-lg font-semibold text-text-primary">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
