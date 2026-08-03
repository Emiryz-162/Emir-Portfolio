"use client";

import {
  type RefObject,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";
import { RotateCcw, SendHorizontal, Square, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { AssistantMarkdown } from "@/components/assistant/assistant-markdown";
import { useAssistant } from "@/components/assistant/assistant-provider";
import { RelatedProjects } from "@/components/assistant/related-projects";
import { ASSISTANT_LIMITS } from "@/lib/ai/request-validation";
import { cn } from "@/lib/cn";

export function AssistantPanel() {
  const t = useTranslations("Assistant");
  const locale = useLocale();
  const assistant = useAssistant();
  const titleId = useId();
  const descriptionId = useId();
  const inputId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (!assistant.isOpen) return;

    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [assistant.isOpen]);

  useEffect(() => {
    if (!assistant.isOpen) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [assistant.isOpen, assistant.messages]);

  useEffect(() => {
    if (!assistant.isOpen) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        assistant.closePanel();
        return;
      }

      if (event.key === "Tab") {
        trapFocus(event, panelRef);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [assistant]);

  if (!assistant.isOpen) return null;

  const suggestions = [
    t("suggestions.projects"),
    t("suggestions.backend"),
    t("suggestions.gameDevelopment"),
    t("suggestions.education"),
  ];
  const remaining = ASSISTANT_LIMITS.messageMax - assistant.draft.length;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label={t("actions.close")}
        className="absolute inset-0 hidden bg-background/52 backdrop-blur-md sm:block"
        onClick={assistant.closePanel}
      />
      <aside
        id={assistant.panelId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="absolute inset-0 flex flex-col border-border bg-background shadow-2xl sm:inset-y-4 sm:right-4 sm:left-auto sm:w-[min(460px,calc(100vw-2rem))] sm:rounded-[6px] sm:border"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border bg-surface/86 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              <h2 id={titleId} className="font-semibold text-foreground">
                {t("name")}
              </h2>
            </div>
            <p id={descriptionId} className="mt-0.5 text-xs text-muted">
              {t("role")} - {t("status.ready")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <IconButton
              label={t("actions.newConversation")}
              onClick={assistant.clearConversation}
            >
              <RotateCcw size={16} aria-hidden="true" />
            </IconButton>
            <IconButton
              label={t("actions.close")}
              onClick={assistant.closePanel}
            >
              <X size={17} aria-hidden="true" />
            </IconButton>
          </div>
        </header>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 py-4"
          aria-live="polite"
          aria-busy={assistant.isPending}
        >
          {assistant.messages.length === 0 ? (
            <div className="grid min-h-full content-center gap-4">
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {t("empty.title")}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {t("empty.description")}
                </p>
              </div>
              <div className="grid gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={assistant.isPending}
                    onClick={() => assistant.sendMessage(suggestion)}
                    className="rounded-[6px] border border-border bg-surface px-3 py-2 text-left text-sm leading-6 text-muted-foreground transition hover:border-border-strong hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <PanelNotice />
            </div>
          ) : (
            <div className="space-y-4">
              {assistant.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[92%] rounded-[6px] border px-3 py-2 text-sm leading-6",
                      message.role === "user"
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-surface text-muted-foreground",
                    )}
                  >
                    {message.role === "assistant" && (
                      <p className="mb-1 font-mono text-[11px] uppercase text-muted">
                        {t("name")}
                      </p>
                    )}
                    {message.content ? (
                      <AssistantMarkdown content={message.content} />
                    ) : assistant.isPending &&
                      !assistant.hasStartedStreaming ? (
                      <TypingIndicator label={t("statusText.thinking")} />
                    ) : null}
                    {message.role === "assistant" && (
                      <RelatedProjects
                        locale={locale}
                        projects={message.relatedProjects ?? []}
                        onNavigate={assistant.closePanel}
                      />
                    )}
                  </div>
                </div>
              ))}
              {assistant.error &&
                !assistant.messages.some(
                  (message) =>
                    message.role === "assistant" && message.status === "error",
                ) && (
                  <div
                    role="status"
                    className="rounded-[6px] border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground"
                  >
                    {assistant.error}
                  </div>
                )}
            </div>
          )}
        </div>

        <form
          className="border-t border-border bg-surface/86 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3"
          onSubmit={(event) => {
            event.preventDefault();
            void assistant.sendMessage();
          }}
        >
          <label htmlFor={inputId} className="sr-only">
            {t("input.label")}
          </label>
          <div className="flex items-end gap-2">
            <textarea
              id={inputId}
              ref={inputRef}
              value={assistant.draft}
              maxLength={ASSISTANT_LIMITS.messageMax}
              rows={1}
              placeholder={t("input.placeholder")}
              aria-describedby={`${inputId}-hint ${inputId}-limit`}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onCompositionEnd={() => {
                isComposingRef.current = false;
              }}
              onChange={(event) => assistant.setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !isComposingRef.current
                ) {
                  event.preventDefault();
                  void assistant.sendMessage();
                }
              }}
              className="max-h-32 min-h-11 flex-1 resize-none rounded-[6px] border border-border bg-background px-3 py-2 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted focus:border-border-strong focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
            />
            <button
              type={assistant.isPending ? "button" : "submit"}
              onClick={
                assistant.isPending ? assistant.stopStreaming : undefined
              }
              disabled={!assistant.isPending && !assistant.draft.trim()}
              aria-label={
                assistant.isPending ? t("input.stop") : t("input.send")
              }
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] border border-accent bg-accent text-accent-foreground transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-muted disabled:text-muted"
            >
              {assistant.isPending ? (
                <Square size={15} aria-hidden="true" />
              ) : (
                <SendHorizontal size={17} aria-hidden="true" />
              )}
            </button>
          </div>
          <div className="mt-2 flex items-start justify-between gap-3 text-xs leading-5 text-muted">
            <p id={`${inputId}-hint`}>{t("input.hint")}</p>
            <p
              id={`${inputId}-limit`}
              className={cn("shrink-0", remaining > 80 && "sr-only")}
            >
              {remaining}
            </p>
          </div>
          <PanelNotice compact />
        </form>
      </aside>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-border bg-background text-muted-foreground transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted">
      <span>{label}</span>
      <span className="flex gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
      </span>
    </div>
  );
}

function PanelNotice({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("Assistant");

  return (
    <div
      className={cn(
        "text-xs leading-5 text-muted",
        compact ? "mt-2" : "rounded-[6px] border border-border bg-surface p-3",
      )}
    >
      <p>{t("privacy.processing")}</p>
      <p className="mt-1">{t("privacy.openai")}</p>
      <p className="mt-1">{t("privacy.mistakes")}</p>
    </div>
  );
}

function trapFocus(
  event: globalThis.KeyboardEvent,
  panelRef: RefObject<HTMLDivElement | null>,
) {
  const panel = panelRef.current;
  if (!panel) return;

  const focusable = Array.from(
    panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.offsetParent !== null);

  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
