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
import { buildAssistantOpenAIResponseConfig } from "@/lib/ai/openai-response-config";
import {
  classifyIncompleteReason,
  getResponseIncompleteReason,
  getUsageDiagnostics,
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
      ...buildAssistantOpenAIResponseConfig({
        model: prepared.model,
        instructions: prepared.instructions,
        input: prepared.input,
      }),
    });
    const answer = response.output_text?.trim() ?? "";

    logAssistantResponseDiagnostics({
      requestId: prepared.requestId,
      endpoint: "non-streaming",
      model: prepared.model,
      response,
      accumulatedTextChars: answer.length,
      outputTextChars: response.output_text?.length ?? 0,
      context: prepared.diagnostics,
    });

    if (!isCompletedResponse(response)) {
      logAssistantError(
        `responseIncomplete:${classifyIncompleteReason(getResponseIncompleteReason(response))}`,
        "/api/assistant",
      );
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

function logAssistantResponseDiagnostics({
  requestId,
  endpoint,
  model,
  response,
  accumulatedTextChars,
  outputTextChars,
  context,
}: {
  requestId: string;
  endpoint: "non-streaming";
  model: string;
  response: unknown;
  accumulatedTextChars: number;
  outputTextChars: number;
  context: {
    baseContextChars: number;
    projectContextCount: number;
    totalProjectContextChars: number;
    finalInputApproxChars: number;
  };
}) {
  if (process.env.NODE_ENV === "production") return;

  const usage = getUsageDiagnostics(response);
  console.error(
    [
      "[assistant-diagnostic]",
      `request=${requestId.slice(0, 8)}`,
      `endpoint=${endpoint}`,
      `model=${model}`,
      `status=${String((response as { status?: unknown }).status ?? "unknown")}`,
      `incomplete=${getResponseIncompleteReason(response)}`,
      `output_tokens=${usage.outputTokens ?? "unknown"}`,
      `reasoning_tokens=${usage.reasoningTokens ?? "unknown"}`,
      `accumulated_chars=${accumulatedTextChars}`,
      `output_text_chars=${outputTextChars}`,
      `base_context_chars=${context.baseContextChars}`,
      `project_context_count=${context.projectContextCount}`,
      `project_context_chars=${context.totalProjectContextChars}`,
      `input_chars=${context.finalInputApproxChars}`,
    ].join(" "),
  );
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
