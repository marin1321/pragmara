import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference",
  description:
    "Complete API documentation for Pragmara with curl, Python, and TypeScript examples.",
};

export default function APIDocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
