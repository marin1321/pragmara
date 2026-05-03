const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SSETokenEvent {
  type: "token";
  content: string;
}

export interface SSECitationsEvent {
  type: "citations";
  data: Array<{
    source: string;
    page: number | null;
    section: string | null;
    excerpt: string;
    score: number;
  }>;
}

export interface SSEDoneEvent {
  type: "done";
  usage: {
    output_tokens: number;
    latency_ms: number;
    model: string;
  };
  answer: string;
}

export interface SSEErrorEvent {
  type: "error";
  message: string;
}

export type SSEEvent = SSETokenEvent | SSECitationsEvent | SSEDoneEvent | SSEErrorEvent;

export async function* streamQuery(
  kbId: string,
  question: string,
  apiKey: string,
  signal?: AbortSignal
): AsyncGenerator<SSEEvent> {
  const response = await fetch(`${API_BASE_URL}/v1/kb/${kbId}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Pragmara-Key": apiKey,
    },
    body: JSON.stringify({ question }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.slice(6).trim();
        if (jsonStr) {
          try {
            const event = JSON.parse(jsonStr) as SSEEvent;
            yield event;
          } catch {
            // Skip malformed events
          }
        }
      }
    }
  }

  if (buffer.startsWith("data: ")) {
    const jsonStr = buffer.slice(6).trim();
    if (jsonStr) {
      try {
        const event = JSON.parse(jsonStr) as SSEEvent;
        yield event;
      } catch {
        // Skip
      }
    }
  }
}

export async function* streamDemoQuery(
  question: string,
  signal?: AbortSignal
): AsyncGenerator<SSEEvent> {
  const response = await fetch(`${API_BASE_URL}/v1/demo/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.slice(6).trim();
        if (jsonStr) {
          try {
            const event = JSON.parse(jsonStr) as SSEEvent;
            yield event;
          } catch {
            // Skip malformed events
          }
        }
      }
    }
  }

  if (buffer.startsWith("data: ")) {
    const jsonStr = buffer.slice(6).trim();
    if (jsonStr) {
      try {
        const event = JSON.parse(jsonStr) as SSEEvent;
        yield event;
      } catch {
        // Skip
      }
    }
  }
}
