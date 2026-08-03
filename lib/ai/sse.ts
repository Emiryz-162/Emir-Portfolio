import type { AssistantErrorCode } from "@/lib/ai/assistant-request";
import { getAssistantPublicErrorCode } from "@/lib/ai/errors";

export type AssistantSseEvent =
  | {
      event: "meta";
      data: {
        relatedProjects: { slug: string; name: string }[];
      };
    }
  | {
      event: "delta";
      data: {
        text: string;
      };
    }
  | {
      event: "done";
      data: Record<string, never>;
    }
  | {
      event: "error";
      data: {
        code: string;
        message: string;
      };
    };

export function serializeSseEvent(event: AssistantSseEvent) {
  return `event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`;
}

export function getAssistantStreamHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

export function createErrorSseEvent(code: AssistantErrorCode, message: string) {
  return serializeSseEvent({
    event: "error",
    data: {
      code: getAssistantPublicErrorCode(code),
      message,
    },
  });
}
