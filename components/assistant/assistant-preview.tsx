"use client";

import { MessageCircle, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useAssistant } from "@/components/assistant/assistant-provider";

export function AssistantPreview() {
  const t = useTranslations("Assistant");
  const assistant = useAssistant();

  const previewQuestions = [
    t("preview.prompts.projects"),
    t("preview.prompts.backend"),
    t("preview.prompts.roles"),
  ];

  return (
    <section
      aria-labelledby="assistant-preview-title"
      className="rounded-[6px] border border-border bg-surface/86 p-4 shadow-2xl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h2
              id="assistant-preview-title"
              className="text-sm font-semibold text-foreground"
            >
              {t("name")}
            </h2>
            <p className="mt-0.5 text-xs text-muted">{t("role")}</p>
          </div>
        </div>
        <span className="rounded-[4px] border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted">
          {assistant.enabled ? t("status.ready") : t("status.soon")}
        </span>
      </div>

      <div className="mt-4 rounded-[6px] border border-border bg-background p-3">
        <div className="flex items-start gap-3">
          <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] border border-border bg-surface text-accent">
            <Sparkles size={15} aria-hidden="true" />
          </span>
          <p className="text-sm leading-6 text-muted-foreground">
            {assistant.enabled
              ? t("preview.welcome")
              : t("preview.unavailable")}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {previewQuestions.map((question) => (
          <button
            key={question}
            type="button"
            disabled={!assistant.enabled}
            onClick={() => assistant.sendMessage(question)}
            className="rounded-[5px] border border-border bg-background px-3 py-2 text-left text-xs leading-5 text-muted-foreground transition hover:border-border-strong hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-55"
          >
            {question}
          </button>
        ))}
      </div>

      <Button
        className="mt-4 w-full"
        disabled={!assistant.enabled}
        onClick={assistant.openPanel}
      >
        <MessageCircle size={16} aria-hidden="true" />
        {assistant.enabled ? t("preview.cta") : t("preview.disabledCta")}
      </Button>

      <p className="mt-3 text-xs leading-5 text-muted">{t("powered")}</p>
    </section>
  );
}
