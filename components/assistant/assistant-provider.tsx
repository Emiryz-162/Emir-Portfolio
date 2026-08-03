"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";

import type { AssistantMessage } from "@/types/assistant";
import { parseSseBuffer } from "@/lib/ai/sse-client";

type ChatMessage = AssistantMessage & {
  id: string;
  relatedProjects?: RelatedProject[];
};

type RelatedProject = {
  slug: string;
  name: string;
};

type AssistantContextValue = {
  enabled: boolean;
  isOpen: boolean;
  messages: ChatMessage[];
  draft: string;
  isPending: boolean;
  hasStartedStreaming: boolean;
  error: string | null;
  panelId: string;
  openPanel: () => void;
  closePanel: () => void;
  setDraft: (value: string) => void;
  sendMessage: (message?: string) => Promise<void>;
  stopStreaming: () => void;
  clearConversation: () => void;
};

const AssistantContext = createContext<AssistantContextValue | null>(null);
const maxHistoryMessages = 8;

export function AssistantProvider({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("Assistant.errors");
  const [availabilityEnabled, setAvailabilityEnabled] = useState(enabled);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [hasStartedStreaming, setHasStartedStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/assistant/availability")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { enabled?: unknown } | null) => {
        if (isMounted) setAvailabilityEnabled(payload?.enabled === true);
      })
      .catch(() => {
        if (isMounted) setAvailabilityEnabled(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const openPanel = useCallback(() => {
    lastTriggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    window.setTimeout(() => lastTriggerRef.current?.focus(), 0);
  }, []);

  const clearConversation = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setDraft("");
    setError(null);
    setIsPending(false);
    setHasStartedStreaming(false);
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsPending(false);
    setHasStartedStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (messageOverride?: string) => {
      const message = (messageOverride ?? draft).trim();
      if (!availabilityEnabled || isPending || !message) return;

      setIsOpen(true);
      setDraft("");
      setError(null);
      setIsPending(true);
      setHasStartedStreaming(false);

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: "user",
        content: message,
      };
      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: "",
      };
      const history = messages
        .slice(-maxHistoryMessages)
        .map(({ role, content }) => ({ role, content }));

      setMessages((current) => [...current, userMessage, assistantMessage]);

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const streamResponse = await fetch("/api/assistant/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            locale,
            history,
          }),
          signal: abortController.signal,
        });

        if (!streamResponse.ok || !streamResponse.body) {
          await runJsonFallback({
            message,
            locale,
            history,
            assistantMessageId: assistantMessage.id,
            setMessages,
            setError,
            abortSignal: abortController.signal,
          });
          return;
        }

        const contentType = streamResponse.headers.get("content-type") ?? "";
        if (!contentType.includes("text/event-stream")) {
          await runJsonFallback({
            message,
            locale,
            history,
            assistantMessageId: assistantMessage.id,
            setMessages,
            setError,
            abortSignal: abortController.signal,
          });
          return;
        }

        const reader = streamResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let receivedDelta = false;
        let relatedProjects: RelatedProject[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parsed = parseSseBuffer(buffer);
          buffer = parsed.rest;

          for (const event of parsed.events) {
            if (event.event === "meta") {
              relatedProjects = Array.isArray(event.data.relatedProjects)
                ? event.data.relatedProjects.slice(0, 2)
                : [];
            }

            if (
              event.event === "delta" &&
              typeof event.data.text === "string"
            ) {
              receivedDelta = true;
              setHasStartedStreaming(true);
              appendAssistantText(
                assistantMessage.id,
                event.data.text,
                setMessages,
              );
            }

            if (event.event === "error") {
              setError(
                typeof event.data.message === "string"
                  ? event.data.message
                  : t("unavailable"),
              );
            }
          }
        }

        if (receivedDelta && relatedProjects.length > 0) {
          attachRelatedProjects(
            assistantMessage.id,
            relatedProjects,
            setMessages,
          );
        }
      } catch (fetchError) {
        if (abortController.signal.aborted) return;
        setError(fetchError instanceof TypeError ? t("network") : t("generic"));
      } finally {
        if (abortRef.current === abortController) abortRef.current = null;
        setIsPending(false);
        setHasStartedStreaming(false);
      }
    },
    [availabilityEnabled, draft, isPending, locale, messages, t],
  );

  const value = useMemo<AssistantContextValue>(
    () => ({
      enabled: availabilityEnabled,
      isOpen,
      messages,
      draft,
      isPending,
      hasStartedStreaming,
      error,
      panelId: "emir-ai-panel",
      openPanel,
      closePanel,
      setDraft,
      sendMessage,
      stopStreaming,
      clearConversation,
    }),
    [
      clearConversation,
      closePanel,
      draft,
      availabilityEnabled,
      error,
      hasStartedStreaming,
      isOpen,
      isPending,
      messages,
      openPanel,
      sendMessage,
      stopStreaming,
    ],
  );

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistant must be used inside AssistantProvider");
  }

  return context;
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function appendAssistantText(
  messageId: string,
  text: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
) {
  setMessages((current) =>
    current.map((message) =>
      message.id === messageId
        ? {
            ...message,
            content: `${message.content}${text}`,
          }
        : message,
    ),
  );
}

function attachRelatedProjects(
  messageId: string,
  projects: RelatedProject[],
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
) {
  setMessages((current) => {
    const alreadyShown = new Set(
      current.flatMap((message) =>
        (message.relatedProjects ?? []).map((project) => project.slug),
      ),
    );
    const freshProjects = projects.filter(
      (project) => !alreadyShown.has(project.slug),
    );

    if (freshProjects.length === 0) return current;

    return current.map((message) =>
      message.id === messageId
        ? {
            ...message,
            relatedProjects: freshProjects.slice(0, 2),
          }
        : message,
    );
  });
}

async function runJsonFallback({
  message,
  locale,
  history,
  assistantMessageId,
  setMessages,
  setError,
  abortSignal,
}: {
  message: string;
  locale: string;
  history: { role: "user" | "assistant"; content: string }[];
  assistantMessageId: string;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setError: (value: string | null) => void;
  abortSignal: AbortSignal;
}) {
  const response = await fetch("/api/assistant", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      locale,
      history,
    }),
    signal: abortSignal,
  });

  const payload = (await response.json().catch(() => null)) as {
    answer?: string;
    error?: string;
    message?: string;
    relatedProjects?: RelatedProject[];
  } | null;

  if (!response.ok || !payload?.answer) {
    setError(payload?.message ?? payload?.error ?? null);
    return;
  }

  setMessages((current) =>
    current.map((item) =>
      item.id === assistantMessageId
        ? {
            ...item,
            content: payload.answer ?? "",
            relatedProjects: (payload.relatedProjects ?? []).slice(0, 2),
          }
        : item,
    ),
  );
}
