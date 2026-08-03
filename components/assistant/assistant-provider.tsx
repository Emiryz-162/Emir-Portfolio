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
import { buildCompletedConversationHistory } from "@/lib/ai/conversation/build-history";
import { flushSseBuffer, parseSseBuffer } from "@/lib/ai/sse-client";

type ChatMessage = AssistantMessage & {
  id: string;
  requestId?: string;
  status?: "pending" | "streaming" | "completed" | "error" | "cancelled";
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
  const activeRequestRef = useRef<{
    requestId: string;
    assistantMessageId: string;
    controller: AbortController;
  } | null>(null);
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
    activeRequestRef.current?.controller.abort();
    abortRef.current = null;
    activeRequestRef.current = null;
    setMessages([]);
    setDraft("");
    setError(null);
    setIsPending(false);
    setHasStartedStreaming(false);
  }, []);

  const stopStreaming = useCallback(() => {
    const activeRequest = activeRequestRef.current;
    if (!activeRequest) return;

    activeRequest.controller.abort();
    markAssistantCancelled(
      activeRequest.assistantMessageId,
      t("cancelled"),
      setMessages,
    );
    abortRef.current = null;
    activeRequestRef.current = null;
    setIsPending(false);
    setHasStartedStreaming(false);
  }, [t]);

  const sendMessage = useCallback(
    async (messageOverride?: string) => {
      const message = (messageOverride ?? draft).trim();
      if (
        !availabilityEnabled ||
        isPending ||
        activeRequestRef.current ||
        !message
      ) {
        return;
      }

      const requestId = createMessageId();
      const assistantMessageId = createMessageId();
      const abortController = new AbortController();
      activeRequestRef.current = {
        requestId,
        assistantMessageId,
        controller: abortController,
      };
      abortRef.current = abortController;
      setIsOpen(true);
      setDraft("");
      setError(null);
      setIsPending(true);
      setHasStartedStreaming(false);

      const userMessage: ChatMessage = {
        id: createMessageId(),
        requestId,
        role: "user",
        content: message,
        status: "completed",
      };
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        requestId,
        role: "assistant",
        content: "",
        status: "pending",
      };
      const history = buildCompletedConversationHistory(messages, message);

      setMessages((current) => [...current, userMessage, assistantMessage]);

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
            requestId,
            assistantMessageId,
            setMessages,
            setError,
            unavailableMessage: t("unavailable"),
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
            requestId,
            assistantMessageId,
            setMessages,
            setError,
            unavailableMessage: t("unavailable"),
            abortSignal: abortController.signal,
          });
          return;
        }

        const reader = streamResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let receivedDelta = false;
        let completed = false;
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
              markAssistantStatus(assistantMessageId, "streaming", setMessages);
              appendAssistantText(
                assistantMessageId,
                event.data.text,
                setMessages,
              );
            }

            if (event.event === "error") {
              const messageText =
                typeof event.data.message === "string"
                  ? event.data.message
                  : t("unavailable");
              setError(messageText);
              markAssistantError(assistantMessageId, messageText, setMessages);
            }

            if (event.event === "done") {
              completed = true;
              markAssistantStatus(assistantMessageId, "completed", setMessages);
            }
          }
        }

        buffer += decoder.decode();
        const flushed = flushSseBuffer(buffer);
        for (const event of flushed.events) {
          if (event.event === "delta" && typeof event.data.text === "string") {
            receivedDelta = true;
            appendAssistantText(
              assistantMessageId,
              event.data.text,
              setMessages,
            );
          }

          if (event.event === "done") {
            completed = true;
            markAssistantStatus(assistantMessageId, "completed", setMessages);
          }

          if (event.event === "error") {
            const messageText =
              typeof event.data.message === "string"
                ? event.data.message
                : t("unavailable");
            setError(messageText);
            markAssistantError(assistantMessageId, messageText, setMessages);
          }
        }

        if (completed && receivedDelta && relatedProjects.length > 0) {
          attachRelatedProjects(
            assistantMessageId,
            relatedProjects,
            setMessages,
          );
        }
      } catch (fetchError) {
        if (abortController.signal.aborted) return;
        const messageText =
          fetchError instanceof TypeError ? t("network") : t("generic");
        setError(messageText);
        markAssistantError(assistantMessageId, messageText, setMessages);
      } finally {
        if (activeRequestRef.current?.requestId === requestId) {
          activeRequestRef.current = null;
          abortRef.current = null;
          setIsPending(false);
          setHasStartedStreaming(false);
        }
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

function markAssistantStatus(
  messageId: string,
  status: NonNullable<ChatMessage["status"]>,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
) {
  setMessages((current) =>
    current.map((message) =>
      message.id === messageId
        ? {
            ...message,
            status,
          }
        : message,
    ),
  );
}

function markAssistantError(
  messageId: string,
  errorMessage: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
) {
  setMessages((current) =>
    current.map((message) =>
      message.id === messageId
        ? {
            ...message,
            content: message.content
              ? `${message.content}\n\n${errorMessage}`
              : errorMessage,
            status: "error",
          }
        : message,
    ),
  );
}

function markAssistantCancelled(
  messageId: string,
  cancelledMessage: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
) {
  setMessages((current) =>
    current.map((message) =>
      message.id === messageId
        ? {
            ...message,
            content: message.content || cancelledMessage,
            status: "cancelled",
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
  requestId,
  setMessages,
  setError,
  unavailableMessage,
  abortSignal,
}: {
  message: string;
  locale: string;
  history: { role: "user" | "assistant"; content: string }[];
  assistantMessageId: string;
  requestId: string;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setError: (value: string | null) => void;
  unavailableMessage: string;
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
    const messageText =
      payload?.message ?? payload?.error ?? unavailableMessage;
    setError(messageText);
    markAssistantError(assistantMessageId, messageText, setMessages);
    return;
  }

  setMessages((current) =>
    current.map((item) =>
      item.id === assistantMessageId && item.requestId === requestId
        ? {
            ...item,
            content: payload.answer ?? "",
            relatedProjects: (payload.relatedProjects ?? []).slice(0, 2),
            status: "completed",
          }
        : item,
    ),
  );
}
