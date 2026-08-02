/* eslint-disable @next/next/no-img-element */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveMarkdownUrl } from "@/lib/github/markdown-links";

type SafeMarkdownProps = {
  markdown: string;
  repo: string;
  branch: string;
  currentPath: string | null;
};

export function SafeMarkdown({
  markdown,
  repo,
  branch,
  currentPath,
}: SafeMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h2 className="mt-8 text-2xl font-semibold text-foreground">
            {children}
          </h2>
        ),
        h2: ({ children }) => (
          <h2 className="mt-8 text-2xl font-semibold text-foreground">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-7 text-xl font-semibold text-foreground">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mt-4 leading-7 text-muted">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-muted">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-7">{children}</li>,
        a: ({ href, children }) => {
          const resolvedHref = resolveMarkdownUrl(href ?? "", {
            repo,
            branch,
            currentPath,
            kind: "link",
          });

          if (!resolvedHref) return <>{children}</>;

          const isExternal =
            resolvedHref.startsWith("http://") ||
            resolvedHref.startsWith("https://");

          return (
            <a
              href={resolvedHref}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              {children}
            </a>
          );
        },
        img: ({ src, alt }) => {
          const resolvedSrc = resolveMarkdownUrl(
            typeof src === "string" ? src : "",
            {
              repo,
              branch,
              currentPath,
              kind: "image",
            },
          );

          if (!resolvedSrc) return null;

          return (
            <img
              src={resolvedSrc}
              alt={typeof alt === "string" ? alt : ""}
              loading="lazy"
              className="mt-5 max-h-[520px] w-auto max-w-full rounded-[6px] border border-border bg-background"
            />
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="mt-5 border-l-2 border-accent pl-4 text-muted">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.startsWith("language-");

          if (isBlock) {
            return (
              <code className="block overflow-x-auto whitespace-pre rounded-[6px] border border-border bg-background p-4 font-mono text-sm leading-6 text-foreground">
                {children}
              </code>
            );
          }

          return (
            <code className="rounded-[4px] border border-border bg-background px-1.5 py-0.5 font-mono text-sm text-foreground">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="mt-5 overflow-x-auto">{children}</pre>
        ),
        table: ({ children }) => (
          <div className="mt-5 overflow-x-auto rounded-[6px] border border-border">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b border-border bg-surface-muted px-3 py-2 font-semibold text-foreground">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-border px-3 py-2 text-muted">
            {children}
          </td>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
