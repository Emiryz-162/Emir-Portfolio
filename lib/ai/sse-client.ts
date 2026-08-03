export type ParsedSseEvent = {
  event: string;
  data: Record<string, unknown>;
};

export function parseSseBuffer(buffer: string): {
  events: ParsedSseEvent[];
  rest: string;
} {
  const chunks = buffer.split("\n\n");
  const rest = chunks.pop() ?? "";
  const events = chunks
    .map((chunk) => {
      const lines = chunk.split("\n");
      const event = lines
        .find((line) => line.startsWith("event:"))
        ?.replace("event:", "")
        .trim();
      const data = lines
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.replace("data:", "").trim())
        .join("\n");

      if (!event || !data) return null;

      try {
        return {
          event,
          data: JSON.parse(data) as Record<string, unknown>,
        };
      } catch {
        return null;
      }
    })
    .filter((event): event is ParsedSseEvent => Boolean(event));

  return {
    events,
    rest,
  };
}
