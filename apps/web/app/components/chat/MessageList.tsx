"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import type { ChatMessage } from "./types";
import { UserMessage } from "./UserMessage";
import { AssistantMessage } from "./AssistantMessage";

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  isThinking?: boolean;
  onRegenerateLast?: () => void;
  onRetryLast?: () => void;
  onOpenIde?: (projectId?: string) => void;
  onOpenPreview?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming = false,
  isThinking = false,
  onRegenerateLast,
  onRetryLast,
  onOpenIde,
  onOpenPreview,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const userScrolledUpRef = useRef(false);

  // Check scroll position
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isUp = distanceFromBottom > 100;
    userScrolledUpRef.current = isUp;
    setShowScrollBottom(isUp);
  }, []);

  // Auto-scroll when new messages/tokens arrive, only if user is already at the bottom
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming, isThinking]);

  const scrollToBottom = () => {
    userScrolledUpRef.current = false;
    setShowScrollBottom(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 w-full overflow-y-auto px-4 sm:px-6 py-6"
    >
      <div className="w-full max-w-[840px] mx-auto flex flex-col space-y-6 sm:space-y-8">
        {messages.map((m, idx) => {
          const isLatest = idx === messages.length - 1;

          if (m.role === "user") {
            return (
              <UserMessage
                key={m.id}
                content={m.content}
                createdAt={m.createdAt}
              />
            );
          }

          return (
            <AssistantMessage
              key={m.id}
              content={m.content}
              steps={m.steps}
              activityStages={m.activitySteps}
              engineeringResult={m.engineeringResult}
              model={m.model}
              isStreaming={isStreaming && isLatest}
              isThinking={isThinking && isLatest && !m.content}
              isLatest={isLatest}
              error={m.error}
              onRegenerate={isLatest ? onRegenerateLast : undefined}
              onRetry={isLatest ? onRetryLast : undefined}
              onOpenIde={onOpenIde}
              onOpenPreview={onOpenPreview}
            />
          );
        })}

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Floating Jump-to-Latest Button */}
      {showScrollBottom && (
        <div className="sticky bottom-4 flex justify-center pointer-events-none z-30">
          <button
            type="button"
            onClick={scrollToBottom}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-300 text-neutral-800 hover:text-black shadow-md hover:bg-neutral-50 transition-all cursor-pointer text-xs font-medium"
            aria-label="Jump to latest messages"
          >
            <ArrowDown className="w-3.5 h-3.5 text-orange-600" />
            <span>Jump to latest</span>
          </button>
        </div>
      )}
    </div>
  );
};
