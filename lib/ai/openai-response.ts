export type AssistantIncompleteReason =
  "token_limit" | "content_filter" | "unknown";

export function getResponseStatus(response: unknown) {
  return getStringProperty(response, "status");
}

export function getResponseIncompleteReason(response: unknown) {
  const details = getObjectProperty(response, "incomplete_details");
  return getStringProperty(details, "reason") ?? "unknown";
}

export function classifyIncompleteReason(
  reason: string | null | undefined,
): AssistantIncompleteReason {
  if (reason === "max_tokens" || reason === "max_output_tokens") {
    return "token_limit";
  }
  if (reason === "content_filter") return "content_filter";

  return "unknown";
}

export function isCompletedResponse(response: unknown) {
  return getResponseStatus(response) === "completed";
}

export function getUsageDiagnostics(response: unknown) {
  const usage = getObjectProperty(response, "usage");
  const outputDetails = getObjectProperty(usage, "output_tokens_details");

  return {
    outputTokens: getNumberProperty(usage, "output_tokens"),
    reasoningTokens: getNumberProperty(outputDetails, "reasoning_tokens"),
  };
}

function getObjectProperty(value: unknown, key: string) {
  if (!value || typeof value !== "object") return null;
  const property = (value as Record<string, unknown>)[key];
  return property && typeof property === "object" ? property : null;
}

function getStringProperty(value: unknown, key: string) {
  if (!value || typeof value !== "object") return null;
  const property = (value as Record<string, unknown>)[key];
  return typeof property === "string" ? property : null;
}

function getNumberProperty(value: unknown, key: string) {
  if (!value || typeof value !== "object") return null;
  const property = (value as Record<string, unknown>)[key];
  return typeof property === "number" ? property : null;
}
