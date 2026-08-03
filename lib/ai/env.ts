import "server-only";

export const DEFAULT_OPENAI_MODEL = "gpt-5-mini";

export type AssistantEnv =
  | {
      ok: true;
      apiKey: string;
      model: string;
    }
  | {
      ok: false;
      reason: "disabled" | "missing-api-key";
      model: string;
    };

export function getAssistantEnv(): AssistantEnv {
  const enabled = process.env.AI_ASSISTANT_ENABLED?.trim() === "true";
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;

  if (!enabled) {
    return {
      ok: false,
      reason: "disabled",
      model,
    };
  }

  if (!apiKey) {
    return {
      ok: false,
      reason: "missing-api-key",
      model,
    };
  }

  return {
    ok: true,
    apiKey,
    model,
  };
}
