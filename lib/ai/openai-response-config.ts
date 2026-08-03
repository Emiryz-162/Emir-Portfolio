import type { EasyInputMessage } from "openai/resources/responses/responses";

export const DEFAULT_ASSISTANT_MAX_OUTPUT_TOKENS = 1200;
const MIN_ASSISTANT_MAX_OUTPUT_TOKENS = 800;
const MAX_ASSISTANT_MAX_OUTPUT_TOKENS = 2000;

export type AssistantOpenAIResponseConfig = {
  model: string;
  instructions: string;
  input: EasyInputMessage[];
  max_output_tokens: number;
  store: false;
  reasoning?: {
    effort: "minimal" | "low";
  };
};

export function buildAssistantOpenAIResponseConfig({
  model,
  instructions,
  input,
  maxOutputTokens = getAssistantMaxOutputTokens(),
}: {
  model: string;
  instructions: string;
  input: EasyInputMessage[];
  maxOutputTokens?: number;
}): AssistantOpenAIResponseConfig {
  return {
    model,
    instructions,
    input,
    max_output_tokens: maxOutputTokens,
    store: false,
    ...getReasoningConfig(model),
  };
}

export function getAssistantMaxOutputTokens(
  value = process.env.OPENAI_MAX_OUTPUT_TOKENS,
) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return DEFAULT_ASSISTANT_MAX_OUTPUT_TOKENS;
  if (
    parsed < MIN_ASSISTANT_MAX_OUTPUT_TOKENS ||
    parsed > MAX_ASSISTANT_MAX_OUTPUT_TOKENS
  ) {
    return DEFAULT_ASSISTANT_MAX_OUTPUT_TOKENS;
  }

  return parsed;
}

export function getReasoningConfig(model: string):
  | {
      reasoning: {
        effort: "minimal";
      };
    }
  | Record<string, never> {
  const normalized = model.trim().toLowerCase();
  if (normalized.startsWith("gpt-5")) {
    return {
      reasoning: {
        effort: "minimal",
      },
    };
  }

  return {};
}
