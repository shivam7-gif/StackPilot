"use client";

/**
 * StackPilot AI API Client
 *
 * HTTP client that connects the web frontend to the AiBackend service.
 * Supports both one-shot generate and real-time SSE streaming.
 */

// ── Config ───────────────────────────────────────────────────────────────────
export const AI_BACKEND_URL =
  process.env.NEXT_PUBLIC_AI_BACKEND_URL || "http://localhost:8000";

// ── Types ────────────────────────────────────────────────────────────────────
export interface GenerateRequest {
  prompt: string;
  model?: string;
  effort?: string;
  attachments?: string[];
}

export interface GeneratedFile {
  path: string;
  code?: string;
  purpose?: string;
  action?: string;
}

export interface GenerateResult {
  success: boolean;
  message: string;
  data?: {
    projectName: string;
    files: GeneratedFile[];
    architecture?: any;
    planner?: any;
  };
  error?: string;
}

export interface StreamEvent {
  type: "log" | "step" | "result" | "error" | "done";
  data: Record<string, unknown>;
  timestamp: string;
}

export interface StreamCallbacks {
  onLog?: (line: string) => void;
  onStep?: (step: string) => void;
  onResult?: (data: {
    projectName: string;
    files: GeneratedFile[];
    architecture?: any;
    planner?: any;
  }) => void;
  onError?: (error: string) => void;
  onDone?: () => void;
}

// ── Health Check ─────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${AI_BACKEND_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}

// ── One-shot Generate ────────────────────────────────────────────────────────
export async function generate(
  request: GenerateRequest,
  signal?: AbortSignal
): Promise<GenerateResult> {
  const res = await fetch(`${AI_BACKEND_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  const json: GenerateResult = await res.json();

  if (!res.ok) {
    throw new Error(json.error || json.message || `HTTP ${res.status}`);
  }

  return json;
}

// ── Streaming Generate (SSE) ─────────────────────────────────────────────────
export async function generateStream(
  request: GenerateRequest,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${AI_BACKEND_URL}/api/generate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMsg = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text);
      errorMsg = json.error || json.message || errorMsg;
    } catch {
      /* use raw status */
    }
    callbacks.onError?.(errorMsg);
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    callbacks.onError?.("No response body");
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE lines (format: "data: {json}\n\n")
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const event: StreamEvent = JSON.parse(trimmed.slice(6));

          switch (event.type) {
            case "log":
              callbacks.onLog?.(String((event.data as any).line || ""));
              break;
            case "step":
              callbacks.onStep?.(String((event.data as any).step || ""));
              break;
            case "result":
              callbacks.onResult?.(event.data as any);
              break;
            case "error":
              callbacks.onError?.(String((event.data as any).error || "Unknown error"));
              break;
            case "done":
              callbacks.onDone?.();
              break;
          }
        } catch {
          // Skip malformed SSE lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ── Fetch Available Models ───────────────────────────────────────────────────
export async function fetchModels(): Promise<
  Array<{ id: string; name: string; provider: string; tag: string }>
> {
  try {
    const res = await fetch(`${AI_BACKEND_URL}/api/models`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.models || [];
  } catch {
    return [];
  }
}
