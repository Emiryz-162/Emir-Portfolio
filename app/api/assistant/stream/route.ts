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
import {
  ASSISTANT_MAX_OUTPUT_TOKENS,
  getResponseStatus,
  isCompletedResponse,
} from "@/lib/ai/openai-response";
import { getAssistantStreamHeaders, serializeSseEvent } from "@/lib/ai/sse";
import { getFinalizedTextSuffix } from "@/lib/ai/stream/finalize-text";
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
            max_output_tokens: ASSISTANT_MAX_OUTPUT_TOKENS,
            store: false,
            stream: true,
          },
          {
            signal: abortController.signal,
          },
        );

        let accumulatedText = "";
        let sawTerminalEvent = false;

        for await (const event of openaiStream) {
          if (abortController.signal.aborted) break;

          if (
            event.type === "response.output_text.delta" &&
            typeof event.delta === "string" &&
            event.delta.length > 0
          ) {
            accumulatedText += event.delta;
            send(
              serializeSseEvent({
                event: "delta",
                data: {
                  text: event.delta,
                },
              }),
            );
          }

          if (
            event.type === "response.output_text.done" &&
            "text" in event &&
            typeof event.text === "string"
          ) {
            const suffix = getFinalizedTextSuffix(accumulatedText, event.text);
            if (suffix) {
              accumulatedText += suffix;
              send(
                serializeSseEvent({
                  event: "delta",
                  data: {
                    text: suffix,
                  },
                }),
              );
            }
          }

          if (event.type === "response.completed" && "response" in event) {
            sawTerminalEvent = true;
            if (isCompletedResponse(event.response)) {
              send(
                serializeSseEvent({
                  event: "done",
                  data: {},
                }),
              );
            } else {
              sendResponseIncomplete(prepared.locale, send);
            }
          }

          if (
            (event.type === "response.incomplete" ||
              event.type === "response.failed") &&
            "response" in event
          ) {
            sawTerminalEvent = true;
            logAssistantError(
              `response:${getResponseStatus(event.response) ?? event.type}`,
              "/api/assistant/stream",
            );
            sendResponseIncomplete(prepared.locale, send);
          }

          if (event.type === "error") {
            sawTerminalEvent = true;
            logAssistantError("openaiStreamError", "/api/assistant/stream");
            send(
              serializeSseEvent({
                event: "error",
                data: {
                  code: "assistant_unavailable",
                  message: getAssistantErrorMessage(
                    prepared.locale,
                    "openaiUnavailable",
                  ),
                },
              }),
            );
          }
        }

        if (!abortController.signal.aborted && !sawTerminalEvent) {
          sendResponseIncomplete(prepared.locale, send);
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

function sendResponseIncomplete(
  locale: Parameters<typeof getAssistantErrorMessage>[0],
  send: (value: string) => void,
) {
  send(
    serializeSseEvent({
      event: "error",
      data: {
        code: "response_incomplete",
        message: getAssistantErrorMessage(locale, "responseIncomplete"),
      },
    }),
  );
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
