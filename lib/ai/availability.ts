import "server-only";

import { isAssistantEnabledFromValues } from "@/lib/ai/availability-core";

export function getAssistantAvailability() {
  return isAssistantEnabledFromValues({
    enabled: process.env.AI_ASSISTANT_ENABLED,
    apiKey: process.env.OPENAI_API_KEY,
  });
}
