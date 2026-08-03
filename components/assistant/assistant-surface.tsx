"use client";

import { AssistantLauncher } from "@/components/assistant/assistant-launcher";
import { AssistantPanel } from "@/components/assistant/assistant-panel";

export function AssistantSurface() {
  return (
    <>
      <AssistantLauncher />
      <AssistantPanel />
    </>
  );
}
