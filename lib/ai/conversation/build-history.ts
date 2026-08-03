import type { AssistantMessage } from "@/types/assistant";

export type AssistantConversationMessage = AssistantMessage & {
  id?: string;
  requestId?: string;
  status?: "pending" | "streaming" | "completed" | "error" | "cancelled";
};

const maxHistoryMessages = 8;

export function buildCompletedConversationHistory(
  messages: AssistantConversationMessage[],
  currentMessage: string,
) {
  const history: AssistantMessage[] = [];

  for (let index = 0; index < messages.length - 1; index += 1) {
    const user = messages[index];
    const assistant = messages[index + 1];

    if (
      user?.role !== "user" ||
      assistant?.role !== "assistant" ||
      user.requestId !== assistant.requestId ||
      assistant.status !== "completed" ||
      !user.content.trim() ||
      !assistant.content.trim()
    ) {
      continue;
    }

    if (user.content.trim() === currentMessage.trim()) continue;

    history.push(
      { role: "user", content: user.content },
      { role: "assistant", content: assistant.content },
    );
  }

  return history.slice(-maxHistoryMessages);
}
