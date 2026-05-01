export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-display text-5xl font-bold text-text-primary">
        Pragmara
      </h1>
      <p className="mt-4 text-lg text-text-secondary">
        RAG-as-a-Service for Technical Documentation
      </p>
      <div className="mt-8 flex gap-4">
        <span className="rounded-full bg-success/15 px-3 py-1 text-sm text-success">
          Backend Ready
        </span>
        <span className="rounded-full bg-accent-dim px-3 py-1 text-sm text-accent">
          Frontend Setup
        </span>
      </div>
    </main>
  );
}
