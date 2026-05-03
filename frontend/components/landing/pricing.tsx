import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Pragmara",
    features: [
      "1 Knowledge Base",
      "50 queries/month",
      "5 documents per KB",
      "Streaming responses",
      "Citation tracking",
    ],
    cta: "Start free",
    href: "/auth/login",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For teams with serious documentation",
    features: [
      "Unlimited Knowledge Bases",
      "500 queries/month",
      "Unlimited documents",
      "Evaluation scores",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Get Pro",
    href: "/auth/login",
    highlighted: true,
  },
  {
    name: "API",
    price: "Pay-per-use",
    period: "",
    description: "For custom integrations at scale",
    features: [
      "Everything in Pro",
      "Unlimited queries",
      "Custom rate limits",
      "Dedicated support",
      "SLA guarantee",
      "Webhook events",
    ],
    cta: "Contact us",
    href: "mailto:contact@pragmara.dev",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center font-display text-3xl font-bold text-text-primary sm:text-4xl">
          Simple pricing
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-text-secondary">
          Start free, upgrade when you need more. No hidden fees.
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-xl border p-8 ${
                tier.highlighted
                  ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                  : "border-border bg-surface"
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
                  Recommended
                </span>
              )}

              <h3 className="font-display text-xl font-semibold text-text-primary">
                {tier.name}
              </h3>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-text-primary">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-sm text-text-secondary">{tier.period}</span>
                )}
              </div>

              <p className="mt-2 text-sm text-text-secondary">{tier.description}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check className="h-4 w-4 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                render={<Link href={tier.href} />}
                variant={tier.highlighted ? "default" : "outline"}
                className="mt-8 w-full"
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-text-muted">
          * Pricing is illustrative. This is an open-source portfolio project.
        </p>
      </div>
    </section>
  );
}
