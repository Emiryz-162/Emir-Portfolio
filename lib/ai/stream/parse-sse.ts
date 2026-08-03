export type ParsedSseEvent = {
  event: string;
  data: Record<string, unknown>;
};

export type SseParseResult = {
  events: ParsedSseEvent[];
  rest: string;
};

const supportedEvents = new Set(["meta", "delta", "done", "error"]);

export function parseSseBuffer(buffer: string): SseParseResult {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const chunks = normalized.split("\n\n");
  const rest = chunks.pop() ?? "";

  return {
    events: chunks.flatMap(parseSseChunk),
    rest,
  };
}

export function flushSseBuffer(buffer: string) {
  const normalized = buffer.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return {
      events: [],
      rest: "",
    };
  }

  return {
    events: parseSseChunk(normalized),
    rest: "",
  };
}

function parseSseChunk(chunk: string): ParsedSseEvent[] {
  const lines = chunk
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean);

  const eventName =
    lines
      .find((line) => line.startsWith("event:"))
      ?.replace(/^event:\s?/, "")
      .trim() || "message";

  if (!supportedEvents.has(eventName)) return [];

  const data = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.replace(/^data:\s?/, ""))
    .join("\n");

  if (!data) return [];

  try {
    return [
      {
        event: eventName,
        data: JSON.parse(data) as Record<string, unknown>,
      },
    ];
  } catch {
    return [
      {
        event: "error",
        data: {
          code: "invalid_stream_event",
          message: "The assistant stream could not be parsed.",
        },
      },
    ];
  }
}
