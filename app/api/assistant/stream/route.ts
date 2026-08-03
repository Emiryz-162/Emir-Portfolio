import { NextResponse, type NextRequest } from "next/server";

import {
  getAssistantErrorPayload,
  getAssistantHttpStatus,
  getOpenAIErrorCategory,
  logAssistantError,
  parseAssistantRequest,
  prepareAssistantRequest,
} from "@/lib/ai/assistant-request";
import { getAssistantErrorMessage } from "@/lib/ai/errors";
import { getOpenAIClient } from "@/lib/ai/openai-client";
import { getAssistantStreamHeaders, serializeSseEvent } from "@/lib/ai/sse";
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
    logAssistantError(prepared.code, "/api/assistant/stream");
    return errorResponse(prepared.locale, prepared.code, prepared.status, {
      ...(prepared.retryAfterSeconds
        ? { "Retry-After": String(prepared.retryAfterSeconds) }
        : {}),
    });
  }

  const encoder = new TextEncoder();
  const abortController = new AbortController();

  request.signal.addEventListener("abort", () => abortController.abort(), {
    once: true,
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (value: string) => controller.enqueue(encoder.encode(value));

      try {
        send(
          serializeSseEvent({
            event: "meta",
            data: {
              relatedProjects: prepared.relatedProjects,
            },
          }),
        );

        const openaiStream = await getOpenAIClient(
          prepared.apiKey,
        ).responses.create(
          {
            model: prepared.model,
            instructions: prepared.instructions,
            input: prepared.input,
            max_output_tokens: 500,
            store: false,
            stream: true,
          },
          {
            signal: abortController.signal,
          },
        );

        for await (const event of openaiStream) {
          if (abortController.signal.aborted) break;

          if (
            event.type === "response.output_text.delta" &&
            typeof event.delta === "string" &&
            event.delta.length > 0
          ) {
            send(
              serializeSseEvent({
                event: "delta",
                data: {
                  text: event.delta,
                },
              }),
            );
          }
        }

        if (!abortController.signal.aborted) {
          send(
            serializeSseEvent({
              event: "done",
              data: {},
            }),
          );
        }
      } catch (error) {
        if (abortController.signal.aborted) return;

        const category = getOpenAIErrorCategory(error);
        logAssistantError(category, "/api/assistant/stream");
        send(
          serializeSseEvent({
            event: "error",
            data: {
              code:
                category === "openaiRateLimit"
                  ? "openai_rate_limit"
                  : "assistant_unavailable",
              message: getAssistantErrorMessage(prepared.locale, category),
            },
          }),
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      abortController.abort();
    },
  });

  return new Response(stream, {
    headers: getAssistantStreamHeaders(),
  });
}

function errorResponse(
  locale: Parameters<typeof getAssistantErrorPayload>[0],
  code: Parameters<typeof getAssistantErrorPayload>[1],
  status: number,
  headers?: Record<string, string>,
) {
  return NextResponse.json(getAssistantErrorPayload(locale, code), {
    status: getAssistantHttpStatus(code) || status,
    headers,
  });
}
