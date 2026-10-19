"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isStreaming = false,
}) => {
  return (
    <div className="text-[14.5px] leading-[1.68] text-neutral-800 font-sans antialiased break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Paragraphs
          p({ children }) {
            return <p className="mb-3 last:mb-0">{children}</p>;
          },

          // Headings: disciplined, proportional developer hierarchy
          h1({ children }) {
            return (
              <h1 className="text-[19px] font-bold tracking-tight text-neutral-950 mt-5 mb-2.5">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-[17px] font-semibold tracking-tight text-neutral-900 mt-4 mb-2">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-[15px] font-semibold tracking-tight text-neutral-900 mt-3.5 mb-1.5">
                {children}
              </h3>
            );
          },

          // Lists: clean spacing
          ul({ children }) {
            return (
              <ul className="list-disc pl-5 my-2.5 space-y-1 marker:text-neutral-400">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="list-decimal pl-5 my-2.5 space-y-1 marker:text-neutral-500 font-mono text-[13px]">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return <li className="pl-1 leading-relaxed text-neutral-800">{children}</li>;
          },

          // Code
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            if (match || codeString.includes("\n")) {
              return <CodeBlock language={match?.[1] || "text"} value={codeString} />;
            }

            return (
              <code className="font-mono text-[13px] bg-neutral-100 text-neutral-900 px-1.5 py-0.5 rounded border border-neutral-200">
                {children}
              </code>
            );
          },

          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-orange-500/60 bg-orange-50/20 pl-3.5 py-1 my-3 text-neutral-700 italic rounded-r">
                {children}
              </blockquote>
            );
          },

          // Tables
          table({ children }) {
            return (
              <div className="my-3.5 overflow-x-auto border border-neutral-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border-b border-neutral-200 bg-neutral-50 px-3.5 py-2 font-semibold text-neutral-800 uppercase tracking-wider text-[11px] font-mono">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border-b border-neutral-100 px-3.5 py-2 text-xs text-neutral-800">
                {children}
              </td>
            );
          },

          // Links in StackPilot Orange
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2 transition-colors"
              >
                {children}
              </a>
            );
          },

          // Horizontal divider
          hr() {
            return <hr className="my-4 border-neutral-200" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>

      {/* Blinking streaming caret in StackPilot orange */}
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-orange-600 animate-pulse align-middle" />
      )}
    </div>
  );
};
