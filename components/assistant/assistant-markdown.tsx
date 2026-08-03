"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AssistantMarkdownProps = {
  content: string;
};

export function AssistantMarkdown({ content }: AssistantMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      allowedElements={["p", "strong", "em", "ul", "ol", "li", "code", "br"]}
      unwrapDisallowed
      components={{
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">
            {children}
          </ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        code: ({ children }) => (
          <code className="rounded-[4px] border border-border bg-background px-1 py-0.5 font-mono text-[0.92em] text-foreground">
            {children}
          </code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
