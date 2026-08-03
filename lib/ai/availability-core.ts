export function isAssistantEnabledFromValues(values: {
  enabled: string | undefined;
  apiKey: string | undefined;
}) {
  return values.enabled?.trim() === "true" && Boolean(values.apiKey?.trim());
}
