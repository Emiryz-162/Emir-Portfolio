export const PACKET_ROUTE_STEPS = [
  "client",
  "frontend",
  "api",
  "database",
  "deploy",
] as const;

export type PacketRouteNode = (typeof PACKET_ROUTE_STEPS)[number];

export type PacketRouteStatus = "idle" | "playing" | "error" | "completed";

export type PacketRouteResult =
  | {
      type: "correct";
      nextStepIndex: number;
      completed: boolean;
    }
  | {
      type: "wrong";
      expectedNode: PacketRouteNode;
      selectedNode: PacketRouteNode;
    };

export function evaluatePacketRouteSelection(
  currentStepIndex: number,
  selectedNode: PacketRouteNode,
): PacketRouteResult {
  const expectedNode = PACKET_ROUTE_STEPS[currentStepIndex + 1];

  if (selectedNode !== expectedNode) {
    return {
      type: "wrong",
      expectedNode,
      selectedNode,
    };
  }

  const nextStepIndex = currentStepIndex + 1;

  return {
    type: "correct",
    nextStepIndex,
    completed: nextStepIndex === PACKET_ROUTE_STEPS.length - 1,
  };
}

export function getInitialStepIndex(hasCompletedBefore: boolean) {
  return hasCompletedBefore ? PACKET_ROUTE_STEPS.length - 1 : 0;
}
