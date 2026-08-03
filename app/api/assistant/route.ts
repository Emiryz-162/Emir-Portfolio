import { NextResponse, type NextRequest } from "next/server";

import {
  getAssistantErrorPayload,
  getAssistantHttpStatus,
  getOpenAIErrorCategory,
  logAssistantError,
  parseAssistantRequest,
  prepareAssistantRequest,
} from "@/lib/ai/assistant-request";
import { getOpenAIClient } from "@/lib/ai/openai-client";
import {
  ASSISTANT_MAX_OUTPUT_TOKENS,
  isCompletedResponse,
} from "@/lib/ai/openai-response";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    getAssistantErrorPayload(routing.defaultLocale, "invalidRequest"),
    { status: 405 },
  );
}

export async function POST(request: NextRequest) {
  const parsed = await parseAssistantRequest(request);

  if (!parsed.ok) {
    return errorResponse(parsed.locale, parsed.code, parsed.status);
  }

  const prepared = await prepareAssistantRequest(parsed.body);

  if (!prepared.ok) {
    logAssistantError(prepared.code, "/api/assistant");
    return errorResponse(prepared.locale, prepared.code, prepared.status, {
      ...(prepared.retryAfterSeconds
        ? { "Retry-After": String(prepared.retryAfterSeconds) }
        : {}),
    });
  }

  try {
    const response = await getOpenAIClient(prepared.apiKey).responses.create({
      model: prepared.model,
      instructions: prepared.instructions,
      input: prepared.input,
      max_output_tokens: ASSISTANT_MAX_OUTPUT_TOKENS,
      store: false,
    });
    const answer = response.output_text?.trim();

    if (!isCompletedResponse(response)) {
      return errorResponse(prepared.locale, "responseIncomplete", 502);
    }

    if (!answer) {
      return errorResponse(prepared.locale, "emptyResponse", 502);
    }

    return NextResponse.json({
      answer,
      relatedProjects: prepared.relatedProjects,
    });
  } catch (error) {
    const category = getOpenAIErrorCategory(error);
    logAssistantError(category, "/api/assistant");

    return errorResponse(
      prepared.locale,
      category,
      getAssistantHttpStatus(category),
    );
  }
}

function errorResponse(
  locale: Parameters<typeof getAssistantErrorPayload>[0],
  code: Parameters<typeof getAssistantErrorPayload>[1],
  status: number,
  headers?: Record<string, string>,
) {
  return NextResponse.json(getAssistantErrorPayload(locale, code), {
    status,
    headers,
  });
}
