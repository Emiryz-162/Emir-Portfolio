import "server-only";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import OpenAI from "openai";
import type { EasyInputMessage } from "openai/resources/responses/responses";

import { getAssistantEnv } from "@/lib/ai/env";
import {
  getAssistantErrorMessage,
  getAssistantPublicErrorCode,
} from "@/lib/ai/errors";
import { buildPortfolioKnowledge } from "@/lib/ai/knowledge/build-portfolio-knowledge";
import {
  formatCompactPortfolioContext,
  formatProjectReferenceContext,
} from "@/lib/ai/knowledge/format-context";
import { buildPortfolioAssistantInstructions } from "@/lib/ai/prompts/portfolio-assistant";
import {
  checkAssistantRateLimit,
  getAssistantRateLimitIdentifier,
} from "@/lib/ai/rate-limit";
import { validateAssistantRequestBody } from "@/lib/ai/request-validation";
import { retrieveProjectContext } from "@/lib/ai/retrieval/retrieve-project-context";
import { routing, type Locale } from "@/i18n/routing";
import type { AssistantMessage } from "@/types/assistant";

export type AssistantErrorCode =
  | "disabled"
  | "missingApiKey"
  | "invalidRequest"
  | "rateLimited"
  | "auth"
  | "openaiRateLimit"
  | "openaiUnavailable"
  | "emptyResponse"
  | "responseIncomplete"
  | "serverError";

export type AssistantPreparation =
  | {
      ok: true;
      apiKey: string;
      model: string;
      requestId: string;
      locale: Locale;
      instructions: string;
      input: EasyInputMessage[];
      relatedProjects: { slug: string; name: string }[];
      diagnostics: {
        baseContextChars: number;
        projectContextCount: number;
        totalProjectContextChars: number;
        finalInputApproxChars: number;
      };
    }
  | {
      ok: false;
      locale: Locale;
      code: AssistantErrorCode;
      status: number;
      retryAfterSeconds?: number;
    };

export async function parseAssistantRequest(
  request: Request,
): Promise<
  | { ok: true; body: unknown }
  | { ok: false; locale: Locale; code: AssistantErrorCode; status: number }
> {
  try {
    return {
      ok: true,
      body: await request.json(),
    };
  } catch {
    return {
      ok: false,
      locale: routing.defaultLocale,
      code: "invalidRequest",
      status: 400,
    };
  }
}

export async function prepareAssistantRequest(
  body: unknown,
): Promise<AssistantPreparation> {
  const validation = validateAssistantRequestBody(body);

  if (!validation.ok) {
    return {
      ok: false,
      locale: validation.locale,
      code: "invalidRequest",
      status: 400,
    };
  }

  const env = getAssistantEnv();

  if (!env.ok) {
    return {
      ok: false,
      locale: validation.request.locale,
      code: env.reason === "missing-api-key" ? "missingApiKey" : "disabled",
      status: 503,
    };
  }

  const identifier = getAssistantRateLimitIdentifier(await headers());
  const rateLimit = checkAssistantRateLimit(identifier);

  if (!rateLimit.allowed) {
    return {
      ok: false,
      locale: validation.request.locale,
      code: "rateLimited",
      status: 429,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  }

  const knowledge = await buildPortfolioKnowledge(validation.request.locale);
  const retrieval = await retrieveProjectContext(
    validation.request.message,
    knowledge.projects,
  );
  const baseContext = formatCompactPortfolioContext(knowledge);
  const projectContext = formatProjectReferenceContext(retrieval.contexts);
  const context = [
    "<portfolio_context>",
    baseContext,
    "</portfolio_context>",
    projectContext,
  ]
    .filter(Boolean)
    .join("\n\n");
  const input = buildResponseInput(
    context,
    validation.request.history,
    validation.request.message,
  );

  return {
    ok: true,
    apiKey: env.apiKey,
    model: env.model,
    requestId: randomUUID(),
    locale: validation.request.locale,
    instructions: buildPortfolioAssistantInstructions(
      validation.request.locale,
    ),
    input,
    relatedProjects: retrieval.relatedProjects,
    diagnostics: {
      baseContextChars: baseContext.length,
      projectContextCount: retrieval.contexts.length,
      totalProjectContextChars: retrieval.contexts.reduce(
        (total, project) => total + project.content.length,
        0,
      ),
      finalInputApproxChars: input.reduce(
        (total, message) =>
          total +
          (typeof message.content === "string" ? message.content.length : 0),
        0,
      ),
    },
  };
}

export function getOpenAIErrorCategory(error: unknown): AssistantErrorCode {
  if (error instanceof OpenAI.AuthenticationError) return "auth";
  if (error instanceof OpenAI.RateLimitError) return "openaiRateLimit";
  if (
    error instanceof OpenAI.APIConnectionError ||
    error instanceof OpenAI.InternalServerError
  ) {
    return "openaiUnavailable";
  }

  return "serverError";
}

export function getAssistantHttpStatus(code: AssistantErrorCode) {
  if (code === "invalidRequest") return 400;
  if (code === "rateLimited") return 429;
  if (
    code === "disabled" ||
    code === "missingApiKey" ||
    code === "auth" ||
    code === "openaiRateLimit" ||
    code === "openaiUnavailable"
  ) {
    return 503;
  }
  if (code === "emptyResponse") return 502;
  if (code === "responseIncomplete") return 502;

  return 500;
}

export function getAssistantErrorPayload(
  locale: Locale,
  code: AssistantErrorCode,
) {
  return {
    code: getAssistantPublicErrorCode(code),
    message: getAssistantErrorMessage(locale, code),
  };
}

export function logAssistantError(category: string, route: string) {
  if (process.env.NODE_ENV === "production") return;

  console.error(
    `[assistant] ${category} route=${route} timestamp=${new Date().toISOString()}`,
  );
}

function buildResponseInput(
  context: string,
  history: AssistantMessage[],
  message: string,
): EasyInputMessage[] {
  const dedupedHistory =
    history.at(-1)?.role === "user" && history.at(-1)?.content === message
      ? history.slice(0, -1)
      : history;

  return [
    {
      role: "user",
      content: context,
    },
    ...dedupedHistory.map((item) => ({
      role: item.role,
      content: item.content,
    })),
    {
      role: "user",
      content: message,
    },
  ];
}
