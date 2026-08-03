import { locales, routing, type Locale } from "@/i18n/routing";
import type { AssistantMessage, AssistantRequest } from "@/types/assistant";

export const ASSISTANT_LIMITS = {
  messageMax: 600,
  historyMax: 8,
  historyContentMax: 1000,
} as const;

type AssistantRequestValidation =
  | {
      ok: true;
      request: AssistantRequest;
      localeWasFallback: boolean;
    }
  | {
      ok: false;
      code:
        | "invalid-json"
        | "invalid-request"
        | "message-required"
        | "message-too-long";
      locale: Locale;
    };

export function validateAssistantRequestBody(
  body: unknown,
): AssistantRequestValidation {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      ok: false,
      code: "invalid-request",
      locale: routing.defaultLocale,
    };
  }

  const input = body as Record<string, unknown>;
  const localeResult = normalizeLocale(input.locale);
  const message = normalizeString(input.message);

  if (!message) {
    return { ok: false, code: "message-required", locale: localeResult.locale };
  }

  if (message.length > ASSISTANT_LIMITS.messageMax) {
    return { ok: false, code: "message-too-long", locale: localeResult.locale };
  }

  const history = normalizeHistory(input.history);

  return {
    ok: true,
    request: {
      message,
      locale: localeResult.locale,
      history,
    },
    localeWasFallback: localeResult.fallback,
  };
}

export function normalizeLocale(value: unknown) {
  if (typeof value === "string" && locales.includes(value as Locale)) {
    return {
      locale: value as Locale,
      fallback: false,
    };
  }

  return {
    locale: routing.defaultLocale,
    fallback: true,
  };
}

function normalizeHistory(value: unknown): AssistantMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-ASSISTANT_LIMITS.historyMax)
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;

      const input = item as Record<string, unknown>;
      const role = input.role;
      const content = normalizeString(input.content);

      if ((role !== "user" && role !== "assistant") || !content) return null;

      return {
        role,
        content: content.slice(0, ASSISTANT_LIMITS.historyContentMax),
      };
    })
    .filter((item): item is AssistantMessage => item != null);
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
