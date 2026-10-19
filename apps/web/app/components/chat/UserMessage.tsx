"use client";

import React from "react";

interface UserMessageProps {
  content: string;
  createdAt?: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ content, createdAt }) => {
  return (
    <div className="flex justify-end w-full animate-[fadeIn_150ms_ease_both]">
      <div className="max-w-[85%] rounded-xl border border-neutral-200 bg-neutral-100/80 px-4 py-2.5 text-[14px] leading-relaxed text-neutral-900 shadow-2xs">
        <div className="whitespace-pre-wrap break-words font-sans">
          {content}
        </div>
      </div>
    </div>
  );
};
