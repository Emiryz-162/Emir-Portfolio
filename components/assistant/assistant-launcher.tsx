"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAssistant } from "@/components/assistant/assistant-provider";

export function AssistantLauncher() {
  const t = useTranslations("Assistant");
  const assistant = useAssistant();

  if (!assistant.enabled) return null;

  return (
    <button
      type="button"
      aria-label={t("launcherLabel")}
      aria-expanded={assistant.isOpen}
      aria-controls={assistant.panelId}
      onClick={assistant.openPanel}
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-border bg-surface-elevated px-3 py-2 text-sm font-semibold text-foreground shadow-2xl transition hover:-translate-y-0.5 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:right-6"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] border border-accent bg-accent text-accent-foreground">
        <MessageCircle size={15} aria-hidden="true" />
      </span>
      <span>{t("name")}</span>
    </button>
  );
}
