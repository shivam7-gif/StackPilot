"use client";

import { useCallback, useRef, useState } from "react";
import {
  generateStream,
  generate,
  type GenerateRequest,
  type GeneratedFile,
  type StreamCallbacks,
} from "@/config/aiApi";

export interface AiMessage {
  role: "user" | "ai";
  text: string;
}

export interface AiProjectResult {
  projectName: string;
  files: GeneratedFile[];
  architecture?: any;
  planner?: any;
}

export interface UseAiEngineOptions {
  /** Use SSE streaming (default: true). Falls back to one-shot if false. */
  stream?: boolean;
  /** Callback fired when the AI engine generates project files and architecture */
  onResult?: (data: AiProjectResult) => void | Promise<void>;
}

export interface UseAiEngineReturn {
  /** Whether a request is in-flight. */
  busy: boolean;
  /** AI typing indicator (while streaming). */
  aiTyping: boolean;
  /** Conversation messages. */
  messages: AiMessage[];
  /** Engine log lines (live during stream). */
  logs: string[];
  /** The last generation result. */
  result: AiProjectResult | null;
  /** Send a prompt to the AI engine. */
  send: (request: GenerateRequest) => Promise<void>;
  /** Abort the current request. */
  stop: () => void;
  /** Clear messages and reset state. */
  clear: () => void;
}

/**
 * React hook that bridges the PromptBar to the StackPilot AI Engine
 * via the AiBackend HTTP API.
 */
export function useAiEngine(
  options: UseAiEngineOptions = {}
): UseAiEngineReturn {
  const { stream = true, onResult: onResultProp } = options;

  const [busy, setBusy] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<AiProjectResult | null>(null);

  const controllerRef = useRef<AbortController | null>(null);

  const appendAiText = useCallback((line: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "ai") {
        return [
          ...prev.slice(0, -1),
          { ...last, text: `${last.text}\n${line}` },
        ];
      }
      return [...prev, { role: "ai", text: line }];
    });
  }, []);

  const send = useCallback(
    async (request: GenerateRequest) => {
      // Abort any in-flight request
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setBusy(true);
      setAiTyping(true);
      setLogs([]);
      setResult(null);

      // Add user message
      setMessages((prev) => [
        ...prev,
        { role: "user", text: request.prompt },
      ]);

      // Add initial AI thinking message
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `⚡ Processing with ${request.model || "default model"} (${request.effort || "Medium"} effort)...`,
        },
      ]);

      try {
        if (stream) {
          // ── SSE Streaming ──────────────────────────────────────────────
          const callbacks: StreamCallbacks = {
            onLog(line) {
              setLogs((prev) => [...prev, line]);
              appendAiText(line);
            },
            onStep(step) {
              setLogs((prev) => [...prev, `[step] ${step}`]);
            },
            onResult(data) {
              setResult(data);
              appendAiText(
                `\n✅ Generated project: **${data.projectName}** (${data.files.length} files)`
              );
              try {
                onResultProp?.(data);
              } catch (err: any) {
                console.error("[useAiEngine] onResult error:", err);
              }
            },
            onError(error) {
              appendAiText(`\n❌ Error: ${error}`);
            },
            onDone() {
              setAiTyping(false);
              setBusy(false);
            },
          };

          await generateStream(request, callbacks, controller.signal);

          // In case onDone wasn't fired (connection closed cleanly)
          setAiTyping(false);
          setBusy(false);
        } else {
          // ── One-shot ───────────────────────────────────────────────────
          const res = await generate(request, controller.signal);

          if (res.success && res.data) {
            setResult(res.data);
            appendAiText(
              `\n✅ Generated project: **${res.data.projectName}** (${res.data.files.length} files)`
            );
            try {
              onResultProp?.(res.data);
            } catch (err: any) {
              console.error("[useAiEngine] onResult error:", err);
            }
          } else {
            appendAiText(`\n❌ ${res.error || res.message}`);
          }

          setAiTyping(false);
          setBusy(false);
        }
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") {
          appendAiText("\n⏹ Request cancelled.");
        } else {
          const msg = err instanceof Error ? err.message : String(err);
          appendAiText(`\n❌ ${msg}`);
        }
        setAiTyping(false);
        setBusy(false);
      }
    },
    [stream, onResultProp, appendAiText]
  );

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setAiTyping(false);
    setBusy(false);
  }, []);

  const clear = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setMessages([]);
    setLogs([]);
    setResult(null);
    setAiTyping(false);
    setBusy(false);
  }, []);

  return {
    busy,
    aiTyping,
    messages,
    logs,
    result,
    send,
    stop,
    clear,
  };
}
