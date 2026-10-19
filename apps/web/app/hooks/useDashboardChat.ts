"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ChatMessage, ActivityStep, StageStatus } from "@/components/chat/types";

const STORAGE_KEY = "stackpilot_workspace_messages_v2";
const TITLE_STORAGE_KEY = "stackpilot_workspace_title_v2";
const DRAFT_STORAGE_KEY = "stackpilot_workspace_draft_v2";

const DEFAULT_STAGES = [
  { id: "understanding", label: "Understanding request & requirements" },
  { id: "planning", label: "Planning architecture & tech stack" },
  { id: "inspecting", label: "Inspecting workspace structure" },
  { id: "synthesizing", label: "Synthesizing code & file changes" },
  { id: "validation", label: "Running integrity & validation checks" },
  { id: "preparing", label: "Preparing workspace & preview" },
];

function determineStageIndex(stepText: string): number {
  const lower = stepText.toLowerCase();
  if (lower.includes("pipeline") || lower.includes("prepared") || lower.includes("preview")) return 5;
  if (lower.includes("verified") || lower.includes("validat") || lower.includes("checks")) return 4;
  if (lower.includes("synthesiz") || lower.includes("code") || lower.includes("generating")) return 3;
  if (lower.includes("inspect") || lower.includes("structure") || lower.includes("files")) return 2;
  if (lower.includes("architect") || lower.includes("domain") || lower.includes("plan")) return 1;
  return 0; // understanding
}

function buildInitialStages(): ActivityStep[] {
  return DEFAULT_STAGES.map((s, idx) => ({
    id: s.id,
    label: s.label,
    status: (idx === 0 ? "running" : "queued") as StageStatus,
    details: [],
  }));
}

function updateStagesWithLog(current: ActivityStep[], stepText: string): ActivityStep[] {
  const targetIdx = determineStageIndex(stepText);
  return current.map((stage, idx) => {
    if (idx < targetIdx) {
      return { ...stage, status: "completed" as StageStatus };
    }
    if (idx === targetIdx) {
      const details = stage.details || [];
      return {
        ...stage,
        status: "running" as StageStatus,
        details: details.includes(stepText) ? details : [...details, stepText],
      };
    }
    return { ...stage, status: "queued" as StageStatus };
  });
}

function finalizeStages(current: ActivityStep[]): ActivityStep[] {
  return current.map((s) => ({ ...s, status: "completed" as StageStatus }));
}

export interface SendOptions {
  context?: any;
  model?: string;
  effort?: string;
}

export interface UseDashboardChatOptions {
  onResult?: (result: any) => Promise<any> | void;
}

export function useDashboardChat(options?: UseDashboardChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [chatTitle, setChatTitle] = useState("Chat");
  const abortControllerRef = useRef<AbortController | null>(null);
  const onResultRef = useRef(options?.onResult);

  useEffect(() => {
    onResultRef.current = options?.onResult;
  }, [options?.onResult]);

  // Restore messages on mount and purge legacy cache
  useEffect(() => {
    try {
      localStorage.removeItem("stackpilot_dashboard_messages");
      localStorage.removeItem("stackpilot_dashboard_title");
      localStorage.removeItem("stackpilot_dashboard_draft");
      localStorage.removeItem("stackpilot_workspace_messages");

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      }
      const savedTitle = localStorage.getItem(TITLE_STORAGE_KEY);
      if (savedTitle) {
        setChatTitle(savedTitle);
      }
    } catch {}
  }, []);

  // Persist messages whenever they change and not streaming
  useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {}
    }
  }, [messages, isStreaming]);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setIsThinking(false);
  }, []);

  const clear = useCallback(() => {
    stop();
    setMessages([]);
    setChatTitle("Chat");
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TITLE_STORAGE_KEY);
    } catch {}
  }, [stop]);

  const send = useCallback(
    async (text: string, sendOptions?: SendOptions) => {
      if (!text.trim() || isStreaming) return;

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Update auto-title from first user message
      if (messages.length === 0) {
        const titleSnippet = text.trim().slice(0, 32);
        setChatTitle(titleSnippet);
        try {
          localStorage.setItem(TITLE_STORAGE_KEY, titleSnippet);
        } catch {}
      }

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };

      const assistantId = crypto.randomUUID();
      const initialStages = buildInitialStages();

      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        steps: [],
        activitySteps: initialStages,
        model: sendOptions?.model || "Auto Router",
        status: "running",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      setIsThinking(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: text.trim(),
            context: sendOptions?.context,
            model: sendOptions?.model,
            effort: sendOptions?.effort,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
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
              const event = JSON.parse(trimmed.slice(6));

              if (event.type === "step") {
                setIsThinking(false);
                const stepText = event.data?.step;
                if (stepText) {
                  setMessages((prev) =>
                    prev.map((m) => {
                      if (m.id !== assistantId) return m;
                      const nextSteps = [...(m.steps || []), stepText];
                      const nextStages = updateStagesWithLog(
                        m.activitySteps || buildInitialStages(),
                        stepText
                      );
                      return {
                        ...m,
                        steps: nextSteps,
                        activitySteps: nextStages,
                      };
                    })
                  );
                }
              } else if (event.type === "token") {
                setIsThinking(false);
                const token = event.data?.token || "";
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          content: (m.content || "") + token,
                        }
                      : m
                  )
                );
              } else if (event.type === "done") {
                setIsStreaming(false);
                setIsThinking(false);
                const resultData = event.data?.result;

                setMessages((prev) =>
                  prev.map((m) => {
                    if (m.id !== assistantId) return m;
                    return {
                      ...m,
                      status: "completed",
                      activitySteps: finalizeStages(m.activitySteps || buildInitialStages()),
                      engineeringResult: resultData
                        ? {
                            projectName: resultData.projectName,
                            architecture: resultData.architecture,
                            files: resultData.files,
                            summary: resultData.summary,
                          }
                        : m.engineeringResult,
                    };
                  })
                );

                // Call background scaffold if handler provided
                if (resultData && onResultRef.current) {
                  try {
                    const scaffoldResult = await onResultRef.current(resultData);
                    if (scaffoldResult?.projectId) {
                      setMessages((prev) =>
                        prev.map((m) =>
                          m.id === assistantId && m.engineeringResult
                            ? {
                                ...m,
                                engineeringResult: {
                                  ...m.engineeringResult,
                                  projectId: scaffoldResult.projectId,
                                },
                              }
                            : m
                        )
                      );
                    }
                  } catch (e) {
                    console.error("Scaffold hook failed:", e);
                  }
                }
              }
            } catch {}
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    status: "cancelled",
                    content: m.content || "Generation stopped by user.",
                  }
                : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    error: true,
                    status: "failed",
                    content: "Unable to complete request. Please try again or check your model settings.",
                  }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        setIsThinking(false);
      }
    },
    [isStreaming, messages.length]
  );

  const retryLast = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      send(lastUserMsg.content);
    }
  }, [messages, send]);

  const regenerateLast = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      send(lastUserMsg.content);
    }
  }, [messages, send]);

  return {
    messages,
    isStreaming,
    isThinking,
    chatTitle,
    send,
    stop,
    clear,
    retryLast,
    regenerateLast,
  };
}
