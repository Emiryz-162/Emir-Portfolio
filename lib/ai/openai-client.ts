import "server-only";

import OpenAI from "openai";

let client: OpenAI | null = null;
let clientApiKey: string | null = null;

export function getOpenAIClient(apiKey: string) {
  if (!client || clientApiKey !== apiKey) {
    client = new OpenAI({ apiKey });
    clientApiKey = apiKey;
  }

  return client;
}
