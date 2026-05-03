"use client";

import { useState } from "react";
import { EndpointCard } from "@/components/docs/endpoint-card";
import { CodeBlock } from "@/components/docs/code-block";

const sections = [
  { id: "auth", label: "Authentication" },
  { id: "kb", label: "Knowledge Bases" },
  { id: "docs", label: "Documents" },
  { id: "query", label: "Query" },
  { id: "keys", label: "API Keys" },
  { id: "analytics", label: "Analytics" },
];

const endpoints = {
  auth: [
    {
      method: "POST" as const,
      path: "/auth/magic-link",
      description: "Send a magic link to the user's email. The link contains a token that can be exchanged for a JWT.",
      auth: "None" as const,
      examples: [
        {
          language: "curl",
          code: `curl -X POST https://api.pragmara.dev/auth/magic-link \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com"}'`,
        },
        {
          language: "Python",
          code: `import requests

response = requests.post(
    "https://api.pragmara.dev/auth/magic-link",
    json={"email": "user@example.com"}
)
print(response.json())`,
        },
        {
          language: "TypeScript",
          code: `const response = await fetch("https://api.pragmara.dev/auth/magic-link", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@example.com" }),
});
const data = await response.json();`,
        },
      ],
    },
    {
      method: "GET" as const,
      path: "/auth/verify?token=...",
      description: "Verify the magic link token and return a JWT access token for subsequent requests.",
      auth: "None" as const,
      examples: [
        {
          language: "curl",
          code: `curl "https://api.pragmara.dev/auth/verify?token=YOUR_MAGIC_LINK_TOKEN"`,
        },
      ],
    },
  ],
  kb: [
    {
      method: "POST" as const,
      path: "/v1/kb",
      description: "Create a new Knowledge Base. Returns the KB ID and metadata.",
      auth: "JWT" as const,
      examples: [
        {
          language: "curl",
          code: `curl -X POST https://api.pragmara.dev/v1/kb \\
  -H "Authorization: Bearer YOUR_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My Docs", "description": "Internal API documentation"}'`,
        },
        {
          language: "Python",
          code: `import requests

response = requests.post(
    "https://api.pragmara.dev/v1/kb",
    headers={"Authorization": "Bearer YOUR_JWT"},
    json={"name": "My Docs", "description": "Internal API documentation"}
)
kb = response.json()
print(kb["id"])`,
        },
        {
          language: "TypeScript",
          code: `const response = await fetch("https://api.pragmara.dev/v1/kb", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_JWT",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: "My Docs", description: "Internal API documentation" }),
});
const kb = await response.json();`,
        },
      ],
    },
    {
      method: "GET" as const,
      path: "/v1/kb",
      description: "List all Knowledge Bases for the authenticated user.",
      auth: "JWT" as const,
      examples: [
        {
          language: "curl",
          code: `curl https://api.pragmara.dev/v1/kb \\
  -H "Authorization: Bearer YOUR_JWT"`,
        },
      ],
    },
    {
      method: "DELETE" as const,
      path: "/v1/kb/{id}",
      description: "Delete a Knowledge Base and all associated documents, chunks, and API keys.",
      auth: "JWT" as const,
      examples: [
        {
          language: "curl",
          code: `curl -X DELETE https://api.pragmara.dev/v1/kb/KB_ID \\
  -H "Authorization: Bearer YOUR_JWT"`,
        },
      ],
    },
  ],
  docs: [
    {
      method: "POST" as const,
      path: "/v1/kb/{id}/documents",
      description: "Upload a document (PDF or Markdown) for ingestion. Max file size: 10MB.",
      auth: "JWT" as const,
      examples: [
        {
          language: "curl",
          code: `curl -X POST https://api.pragmara.dev/v1/kb/KB_ID/documents \\
  -H "Authorization: Bearer YOUR_JWT" \\
  -F "file=@./docs/guide.pdf"`,
        },
        {
          language: "Python",
          code: `import requests

with open("docs/guide.pdf", "rb") as f:
    response = requests.post(
        "https://api.pragmara.dev/v1/kb/KB_ID/documents",
        headers={"Authorization": "Bearer YOUR_JWT"},
        files={"file": f}
    )
print(response.json())`,
        },
      ],
    },
    {
      method: "POST" as const,
      path: "/v1/kb/{id}/documents/url",
      description: "Submit a URL for ingestion. The page content will be extracted and indexed.",
      auth: "JWT" as const,
      examples: [
        {
          language: "curl",
          code: `curl -X POST https://api.pragmara.dev/v1/kb/KB_ID/documents/url \\
  -H "Authorization: Bearer YOUR_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://docs.example.com/guide"}'`,
        },
      ],
    },
    {
      method: "GET" as const,
      path: "/v1/kb/{id}/documents",
      description: "List all documents in a Knowledge Base with ingestion status.",
      auth: "JWT" as const,
      examples: [
        {
          language: "curl",
          code: `curl https://api.pragmara.dev/v1/kb/KB_ID/documents \\
  -H "Authorization: Bearer YOUR_JWT"`,
        },
      ],
    },
  ],
  query: [
    {
      method: "POST" as const,
      path: "/v1/kb/{id}/query",
      description: "Query a Knowledge Base. Returns a streaming SSE response with tokens, citations, and usage info.",
      auth: "API Key" as const,
      examples: [
        {
          language: "curl",
          code: `curl -N -X POST https://api.pragmara.dev/v1/kb/KB_ID/query \\
  -H "X-Pragmara-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"question": "How do I authenticate requests?"}'`,
        },
        {
          language: "Python",
          code: `import requests

response = requests.post(
    "https://api.pragmara.dev/v1/kb/KB_ID/query",
    headers={
        "X-Pragmara-Key": "YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={"question": "How do I authenticate requests?"},
    stream=True,
)

for line in response.iter_lines():
    if line:
        print(line.decode())`,
        },
        {
          language: "TypeScript",
          code: `const response = await fetch("https://api.pragmara.dev/v1/kb/KB_ID/query", {
  method: "POST",
  headers: {
    "X-Pragmara-Key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ question: "How do I authenticate requests?" }),
});

const reader = response.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // Parse SSE events: data: {"type":"token","content":"..."}
  console.log(chunk);
}`,
        },
      ],
    },
  ],
  keys: [
    {
      method: "POST" as const,
      path: "/v1/kb/{id}/keys",
      description: "Create a new API key scoped to a Knowledge Base. The key is only shown once.",
      auth: "JWT" as const,
      examples: [
        {
          language: "curl",
          code: `curl -X POST https://api.pragmara.dev/v1/kb/KB_ID/keys \\
  -H "Authorization: Bearer YOUR_JWT" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Production Key"}'`,
        },
      ],
    },
    {
      method: "GET" as const,
      path: "/v1/kb/{id}/keys",
      description: "List all API keys for a Knowledge Base (keys are masked).",
      auth: "JWT" as const,
      examples: [
        {
          language: "curl",
          code: `curl https://api.pragmara.dev/v1/kb/KB_ID/keys \\
  -H "Authorization: Bearer YOUR_JWT"`,
        },
      ],
    },
    {
      method: "DELETE" as const,
      path: "/v1/kb/{id}/keys/{key_id}",
      description: "Revoke an API key. It will immediately stop working for queries.",
      auth: "JWT" as const,
      examples: [
        {
          language: "curl",
          code: `curl -X DELETE https://api.pragmara.dev/v1/kb/KB_ID/keys/KEY_ID \\
  -H "Authorization: Bearer YOUR_JWT"`,
        },
      ],
    },
  ],
  analytics: [
    {
      method: "GET" as const,
      path: "/v1/kb/{id}/analytics",
      description: "Get aggregated analytics for a Knowledge Base: query count, token usage, and quality scores.",
      auth: "JWT" as const,
      examples: [
        {
          language: "curl",
          code: `curl "https://api.pragmara.dev/v1/kb/KB_ID/analytics?days=30" \\
  -H "Authorization: Bearer YOUR_JWT"`,
        },
      ],
    },
    {
      method: "GET" as const,
      path: "/v1/kb/{id}/analytics/recent",
      description: "Get the 10 most recent queries with their answers and evaluation scores.",
      auth: "JWT" as const,
      examples: [
        {
          language: "curl",
          code: `curl https://api.pragmara.dev/v1/kb/KB_ID/analytics/recent \\
  -H "Authorization: Bearer YOUR_JWT"`,
        },
      ],
    },
  ],
};

export default function APIDocsPage() {
  const [activeSection, setActiveSection] = useState("auth");

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-24">
      <h1 className="font-display text-4xl font-bold text-text-primary">API Reference</h1>
      <p className="mt-4 text-text-secondary">
        Complete endpoint documentation with examples in curl, Python, and TypeScript.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <h3 className="font-display text-lg font-semibold text-text-primary">Authentication</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Pragmara uses two authentication methods:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-text-secondary">
          <li>
            <strong className="text-text-primary">JWT (Bearer Token):</strong>{" "}
            Used for dashboard operations (managing KBs, documents, API keys). Obtained via magic link login.
          </li>
          <li>
            <strong className="text-text-primary">API Key (X-Pragmara-Key header):</strong>{" "}
            Used for querying Knowledge Bases. Scoped to a specific KB. Rate limited to 100 req/min.
          </li>
        </ul>
        <div className="mt-4">
          <CodeBlock
            language="Header format"
            code={`Authorization: Bearer <jwt_token>    # For dashboard endpoints\nX-Pragmara-Key: <api_key>             # For query endpoint`}
          />
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-8 lg:flex-row">
        <nav className="lg:sticky lg:top-24 lg:w-48 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                    activeSection === section.id
                      ? "bg-accent/10 font-medium text-accent"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 space-y-4">
          {endpoints[activeSection as keyof typeof endpoints]?.map((ep) => (
            <EndpointCard key={`${ep.method}-${ep.path}`} {...ep} />
          ))}
        </div>
      </div>
    </div>
  );
}
