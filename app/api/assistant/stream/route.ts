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
import { buildAssistantOpenAIResponseConfig } from "@/lib/ai/openai-response-config";
import {
  classifyIncompleteReason,
  getResponseIncompleteReason,
  getResponseStatus,
  getUsageDiagnostics,
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
            ...buildAssistantOpenAIResponseConfig({
              model: prepared.model,
              instructions: prepared.instructions,
              input: prepared.input,
            }),
            stream: true,
          },
          {
            signal: abortController.signal,
          },
        );

        let accumulatedText = "";
        let outputTextChars = 0;
        let sawTerminalEvent = false;
        let terminalSent = false;

        const sendTerminal = (
          event:
            | { event: "done"; data: Record<string, never> }
            | {
                event: "error";
                data: { code: string; message: string };
              },
        ) => {
          if (terminalSent) return;
          terminalSent = true;
          send(serializeSseEvent(event));
        };

        for await (const event of openaiStream) {
          if (abortController.signal.aborted || terminalSent) break;

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
            outputTextChars = event.text.length;
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
            logAssistantStreamDiagnostics({
              requestId: prepared.requestId,
              model: prepared.model,
              response: event.response,
              accumulatedTextChars: accumulatedText.length,
              outputTextChars,
              context: prepared.diagnostics,
            });

            if (isCompletedResponse(event.response)) {
              sendTerminal({
                event: "done",
                data: {},
              });
            } else {
              sendResponseIncomplete(prepared.locale, sendTerminal);
            }
          }

          if (
            (event.type === "response.incomplete" ||
              event.type === "response.failed") &&
            "response" in event
          ) {
            sawTerminalEvent = true;
            logAssistantStreamDiagnostics({
              requestId: prepared.requestId,
              model: prepared.model,
              response: event.response,
              accumulatedTextChars: accumulatedText.length,
              outputTextChars,
              context: prepared.diagnostics,
            });
            logAssistantError(
              `responseIncomplete:${classifyIncompleteReason(getResponseIncompleteReason(event.response))}`,
              "/api/assistant/stream",
            );
            sendResponseIncomplete(prepared.locale, sendTerminal);
          }

          if (event.type === "error") {
            sawTerminalEvent = true;
            logAssistantError("openaiStreamError", "/api/assistant/stream");
            sendTerminal({
              event: "error",
              data: {
                code: "assistant_unavailable",
                message: getAssistantErrorMessage(
                  prepared.locale,
                  "openaiUnavailable",
                ),
              },
            });
          }
        }

        if (!abortController.signal.aborted && !sawTerminalEvent) {
          sendResponseIncomplete(prepared.locale, sendTerminal);
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
  sendTerminal: (event: {
    event: "error";
    data: { code: string; message: string };
  }) => void,
) {
  sendTerminal({
    event: "error",
    data: {
      code: "response_incomplete",
      message: getAssistantErrorMessage(locale, "responseIncomplete"),
    },
  });
}

function logAssistantStreamDiagnostics({
  requestId,
  model,
  response,
  accumulatedTextChars,
  outputTextChars,
  context,
}: {
  requestId: string;
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
      "endpoint=streaming",
      `model=${model}`,
      `status=${getResponseStatus(response) ?? "unknown"}`,
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
    status: getAssistantHttpStatus(code) || status,
    headers,
  });
}
