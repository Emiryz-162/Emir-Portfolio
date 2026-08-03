import { NextResponse } from "next/server";

import { getAssistantAvailability } from "@/lib/ai/availability";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    enabled: getAssistantAvailability(),
  });
}
