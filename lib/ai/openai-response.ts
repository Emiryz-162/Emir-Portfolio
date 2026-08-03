export const ASSISTANT_MAX_OUTPUT_TOKENS = 800;

export function getResponseStatus(response: unknown) {
  return getStringProperty(response, "status");
}

export function getResponseIncompleteReason(response: unknown) {
  const details = getObjectProperty(response, "incomplete_details");
  return getStringProperty(details, "reason") ?? "unknown";
}

export function isCompletedResponse(response: unknown) {
  return getResponseStatus(response) === "completed";
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
