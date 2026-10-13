/**
 * AI Engine Service
 *
 * Calls the StackPilot AiBackend HTTP API to run the LangGraph pipeline
 * (Planner → Architect → H1 Coder) and returns the generated files.
 */

import { EventEmitter } from "events";

// ── Config ───────────────────────────────────────────────────────────────────
const AI_BACKEND_URL =
  process.env.AI_BACKEND_URL || "http://localhost:8000";

// ── Types ────────────────────────────────────────────────────────────────────
export interface GeneratedFile {
  path: string;
  code: string;
  action?: string;
  purpose?: string;
}

export interface AiGenerateResult {
  projectName: string;
  files: GeneratedFile[];
  architecture?: any;
  planner?: any;
}

export interface StreamEvent {
  type: "log" | "step" | "result" | "error" | "done";
  data: Record<string, unknown>;
  timestamp: string;
}

// ── Health Check ─────────────────────────────────────────────────────────────
export async function checkAiBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${AI_BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}

// ── One-shot Generate ────────────────────────────────────────────────────────
export interface AiEngineOptions {
  model?: string | undefined;
  effort?: string | undefined;
  signal?: AbortSignal | undefined;
}

// ── One-shot Generate ────────────────────────────────────────────────────────
/**
 * Call the AiBackend `/api/generate` endpoint. Waits for the full pipeline
 * to complete and returns the project name + generated files array.
 */
export async function callAiEngine(
  prompt: string,
  options?: AiEngineOptions
): Promise<AiGenerateResult> {
  const fetchInit: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      ...(options?.model ? { model: options.model } : {}),
      ...(options?.effort ? { effort: options.effort } : {}),
    }),
    ...(options?.signal ? { signal: options.signal } : {}),
  };

  const res = await fetch(`${AI_BACKEND_URL}/api/generate`, fetchInit);

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(
      json.error || json.message || `AiBackend returned HTTP ${res.status}`
    );
  }

  return {
    projectName: json.data?.projectName ?? "stackpilot-project",
    files: json.data?.files ?? [],
    architecture: json.data?.architecture,
    planner: json.data?.planner,
  };
}

// ── Streaming Generate ──────────────────────────────────────────────────────
/**
 * Call the AiBackend `/api/generate/stream` SSE endpoint.
 * Returns an EventEmitter that fires:
 *   - "log"    (line: string)
 *   - "step"   (step: string)
 *   - "result" (data: AiGenerateResult)
 *   - "error"  (error: string)
 *   - "done"   ()
 */
export function callAiEngineStream(
  prompt: string,
  options?: AiEngineOptions
): EventEmitter {
  const emitter = new EventEmitter();

  (async () => {
    try {
      const streamInit: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          ...(options?.model ? { model: options.model } : {}),
          ...(options?.effort ? { effort: options.effort } : {}),
        }),
        ...(options?.signal ? { signal: options.signal } : {}),
      };

      const res = await fetch(`${AI_BACKEND_URL}/api/generate/stream`, streamInit);

      if (!res.ok) {
        const text = await res.text();
        let errorMsg = `AiBackend returned HTTP ${res.status}`;
        try {
          const json = JSON.parse(text);
          errorMsg = json.error || json.message || errorMsg;
        } catch { /* use raw status */ }
        emitter.emit("error", errorMsg);
        emitter.emit("done");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        emitter.emit("error", "No response body from AiBackend");
        emitter.emit("done");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const event: StreamEvent = JSON.parse(trimmed.slice(6));

            switch (event.type) {
              case "log":
                emitter.emit("log", String((event.data as any).line || ""));
                break;
              case "step":
                emitter.emit("step", String((event.data as any).step || ""));
                break;
              case "result":
                emitter.emit("result", {
                  projectName:
                    (event.data as any).projectName ?? "stackpilot-project",
                  files: (event.data as any).files ?? [],
                  architecture: (event.data as any).architecture,
                  planner: (event.data as any).planner,
                } as AiGenerateResult);
                break;
              case "error":
                emitter.emit(
                  "error",
                  String((event.data as any).error || "Unknown error")
                );
                break;
              case "done":
                emitter.emit("done");
                break;
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }

      // Ensure done is always emitted
      emitter.emit("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      emitter.emit("error", msg);
      emitter.emit("done");
    }
  })();

  return emitter;
}
