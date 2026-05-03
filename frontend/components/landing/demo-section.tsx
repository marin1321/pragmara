import { DemoWidget } from "./demo-widget";

export function DemoSection() {
  return (
    <section id="demo" className="px-6 py-24">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="font-display text-3xl font-bold text-text-primary sm:text-4xl">
          Try it now
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-text-secondary">
          Ask anything about the sample documentation — no signup needed.
        </p>

        <div className="mt-12">
          <DemoWidget />
        </div>
      </div>
    </section>
  );
}
