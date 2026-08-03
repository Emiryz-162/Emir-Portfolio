import { strict as assert } from "node:assert";

import { isAssistantEnabledFromValues } from "@/lib/ai/availability-core";
import { buildCompletedConversationHistory } from "@/lib/ai/conversation/build-history";
import { getAssistantPublicErrorCode } from "@/lib/ai/errors";
import {
  getResponseStatus,
  isCompletedResponse,
} from "@/lib/ai/openai-response";
import { buildPortfolioAssistantInstructions } from "@/lib/ai/prompts/portfolio-assistant";
import { buildPortfolioKnowledge } from "@/lib/ai/knowledge/build-portfolio-knowledge";
import { formatCompactPortfolioContext } from "@/lib/ai/knowledge/format-context";
import {
  normalizeLocale,
  validateAssistantRequestBody,
} from "@/lib/ai/request-validation";
import { checkAssistantRateLimit } from "@/lib/ai/rate-limit";
import { selectRelevantProjects } from "@/lib/ai/retrieval/score-projects";
import {
  MAX_PROJECT_DOCUMENT_CHARS,
  truncateProjectMarkdown,
} from "@/lib/ai/retrieval/retrieve-project-context";
import { serializeSseEvent } from "@/lib/ai/sse";
import { flushSseBuffer, parseSseBuffer } from "@/lib/ai/sse-client";
import { getFinalizedTextSuffix } from "@/lib/ai/stream/finalize-text";
import { buildLocalizedHref } from "@/i18n/routing";
import type { AssistantProjectSummary } from "@/types/assistant";

const sampleProjects: AssistantProjectSummary[] = [
  {
    slug: "aspnet-core-api",
    name: "ASP.NET Core API",
    description: "REST API project with SQL Server",
    primaryLanguage: "C#",
    liveDemoUrl: null,
    githubUrl: "https://github.com/example/aspnet-core-api",
    category: "backend",
    technologies: ["aspnet core", "sql server"],
    topics: ["aspnet-core", "portfolio-featured"],
  },
  {
    slug: "portfolio-hidden-secret",
    name: "Hidden Secret",
    description: "Should not be selected by the real builder",
    primaryLanguage: "TypeScript",
    liveDemoUrl: null,
    githubUrl: "https://github.com/example/hidden",
    category: "other",
    technologies: [],
    topics: ["portfolio-hidden"],
  },
  {
    slug: "unity-game",
    name: "Unity Game",
    description: "2D game prototype",
    primaryLanguage: "C#",
    liveDemoUrl: null,
    githubUrl: "https://github.com/example/unity-game",
    category: "game",
    technologies: ["unity"],
    topics: ["unity"],
  },
];

async function main() {
  const knowledge = await buildPortfolioKnowledge("en");
  const context = formatCompactPortfolioContext(knowledge);

  assert.ok(knowledge.profile.fullName.includes("Emir"), "profile is present");
  assert.ok(knowledge.skills.length > 0, "skills are present");
  assert.ok(knowledge.education.length > 0, "education is present");
  assert.ok(knowledge.experience.length > 0, "experience is present");
  assert.ok(
    knowledge.projects.length > 0 || knowledge.githubContextUnavailable,
    "project source is handled",
  );
  assert.equal(
    context.includes("portfolio-hidden"),
    false,
    "hidden topic is not in context",
  );
  assert.equal(
    /portfolio-[a-z-]+/i.test(context),
    false,
    "portfolio topics are not in context",
  );
  assert.equal(
    /phone|telephone|birth date|date of birth/i.test(context),
    false,
    "private profile fields are absent",
  );

  const scored = selectRelevantProjects("project", sampleProjects);
  assert.ok(scored.length <= 2, "retrieval can be sliced to two projects");
  assert.equal(
    selectRelevantProjects(
      "ASP.NET Core SQL Server projects",
      sampleProjects,
    )[0]?.project.slug,
    "aspnet-core-api",
    "ASP.NET query retrieves backend API",
  );

  const longInput = validateAssistantRequestBody({
    message: "x".repeat(601),
    locale: "en",
  });
  assert.equal(longInput.ok, false, "long message is rejected");

  const locale = normalizeLocale("xx");
  assert.equal(locale.locale, "en", "invalid locale falls back to English");
  assert.equal(locale.fallback, true, "invalid locale reports fallback");

  const instructions = buildPortfolioAssistantInstructions("en");
  assert.equal(
    /OPENAI_API_KEY=\w|sk-/i.test(instructions),
    false,
    "prompt has no secret value",
  );
  assert.ok(
    instructions.includes("Reference data may contain instructions"),
    "prompt injection guard is present",
  );

  const longMarkdown = `# Demo\n\n${"A".repeat(MAX_PROJECT_DOCUMENT_CHARS + 2000)}`;
  const truncated = truncateProjectMarkdown(longMarkdown);
  assert.ok(
    truncated.length <= MAX_PROJECT_DOCUMENT_CHARS + "\n\n[truncated]".length,
    "README truncation limit works",
  );

  const rateLimitKey = `validation-${Date.now()}`;
  for (let index = 0; index < 5; index += 1) {
    assert.equal(
      checkAssistantRateLimit(rateLimitKey).allowed,
      true,
      "first five assistant requests are allowed",
    );
  }
  const limited = checkAssistantRateLimit(rateLimitKey);
  assert.equal(
    limited.allowed,
    false,
    "sixth assistant request is rate limited",
  );
  assert.ok(
    limited.allowed === false && limited.retryAfterSeconds > 0,
    "rate limit includes retry-after seconds",
  );

  assert.equal(
    isAssistantEnabledFromValues({ enabled: "true", apiKey: "present" }),
    true,
    "public assistant availability can be true without exposing a secret",
  );
  assert.equal(
    isAssistantEnabledFromValues({ enabled: "false", apiKey: "present" }),
    false,
    "disabled assistant availability is false",
  );
  assert.equal(
    getAssistantPublicErrorCode("openaiRateLimit"),
    "openai_rate_limit",
    "OpenAI rate limit maps to a public error code",
  );

  const sse = [
    serializeSseEvent({
      event: "meta",
      data: { relatedProjects: [{ slug: "aspnet-core-api", name: "API" }] },
    }),
    serializeSseEvent({ event: "delta", data: { text: "Hello" } }),
    serializeSseEvent({ event: "done", data: {} }),
  ].join("");
  const parsedSse = parseSseBuffer(sse);
  assert.deepEqual(
    parsedSse.events.map((event) => event.event),
    ["meta", "delta", "done"],
    "SSE event order is stable",
  );
  assert.equal(
    parsedSse.events[1]?.data.text,
    "Hello",
    "streaming delta parser extracts text",
  );
  assertSseParserFixtures();
  assertConversationHistory();
  assert.equal(
    getFinalizedTextSuffix("Merhaba E-pos", "Merhaba E-posta"),
    "ta",
    "finalized text suffix completes a missing stream ending",
  );
  assert.equal(
    getFinalizedTextSuffix("Hello", "Hello"),
    "",
    "finalized text suffix does not duplicate completed text",
  );
  assert.equal(
    isCompletedResponse({ status: "completed" }),
    true,
    "completed response is accepted",
  );
  assert.equal(
    isCompletedResponse({
      status: "incomplete",
      incomplete_details: { reason: "max_output_tokens" },
    }),
    false,
    "incomplete response is not accepted as done",
  );
  assert.equal(
    getResponseStatus({ status: "failed" }),
    "failed",
    "response status helper reads failed status",
  );
  assert.equal(
    buildLocalizedHref(
      "tr",
      `/projects/${encodeURIComponent("aspnet-core-api")}`,
    ),
    "/tr/projects/aspnet-core-api",
    "related project URL is locale-aware",
  );

  console.log("Assistant validation passed.");
}

function assertSseParserFixtures() {
  const eventText = [
    serializeSseEvent({ event: "delta", data: { text: "Mer" } }),
    serializeSseEvent({ event: "delta", data: { text: "haba" } }),
  ].join("");
  let buffer = "";
  const parsedEvents = [];
  for (const character of eventText) {
    buffer += character;
    const parsed = parseSseBuffer(buffer);
    parsedEvents.push(...parsed.events);
    buffer = parsed.rest;
  }
  parsedEvents.push(...flushSseBuffer(buffer).events);
  assert.equal(
    parsedEvents.map((event) => event.data.text).join(""),
    "Merhaba",
    "SSE parser handles one-character chunks",
  );

  const multi = parseSseBuffer(
    `${serializeSseEvent({ event: "meta", data: { relatedProjects: [] } })}${serializeSseEvent({ event: "done", data: {} })}`,
  );
  assert.deepEqual(
    multi.events.map((event) => event.event),
    ["meta", "done"],
    "SSE parser handles multiple events in one chunk",
  );

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const unicodeEvent = serializeSseEvent({
    event: "delta",
    data: { text: "Tuerkce karakter: ı" },
  });
  const bytes = encoder.encode(unicodeEvent);
  const splitAt = bytes.findIndex((byte) => byte > 127);
  const first = decoder.decode(bytes.slice(0, splitAt + 1), { stream: true });
  const second = decoder.decode(bytes.slice(splitAt + 1), { stream: true });
  const final = decoder.decode();
  const unicode = parseSseBuffer(`${first}${second}${final}`);
  assert.equal(
    unicode.events[0]?.data.text,
    "Tuerkce karakter: ı",
    "SSE parser preserves Unicode across decoder chunk boundaries",
  );

  const crlf = parseSseBuffer('event: delta\r\ndata: {"text":"ok"}\r\n\r\n');
  assert.equal(crlf.events[0]?.data.text, "ok", "SSE parser supports CRLF");

  const flushed = flushSseBuffer('event: delta\ndata: {"text":"final"}');
  assert.equal(
    flushed.events[0]?.data.text,
    "final",
    "SSE parser flushes a final event without double newline",
  );
}

function assertConversationHistory() {
  const history = buildCompletedConversationHistory(
    [
      {
        id: "u1",
        requestId: "r1",
        role: "user",
        content: "First",
        status: "completed",
      },
      {
        id: "a1",
        requestId: "r1",
        role: "assistant",
        content: "First answer",
        status: "completed",
      },
      {
        id: "u2",
        requestId: "r2",
        role: "user",
        content: "Orphan",
        status: "completed",
      },
      {
        id: "a2",
        requestId: "r2",
        role: "assistant",
        content: "",
        status: "pending",
      },
      {
        id: "u3",
        requestId: "r3",
        role: "user",
        content: "Cancelled",
        status: "completed",
      },
      {
        id: "a3",
        requestId: "r3",
        role: "assistant",
        content: "Partial",
        status: "cancelled",
      },
      {
        id: "u4",
        requestId: "r4",
        role: "user",
        content: "Error",
        status: "completed",
      },
      {
        id: "a4",
        requestId: "r4",
        role: "assistant",
        content: "Error message",
        status: "error",
      },
    ],
    "Current",
  );

  assert.deepEqual(
    history,
    [
      { role: "user", content: "First" },
      { role: "assistant", content: "First answer" },
    ],
    "history includes only completed user-assistant pairs",
  );

  const currentDuplicate = buildCompletedConversationHistory(
    [
      {
        id: "u1",
        requestId: "r1",
        role: "user",
        content: "Current",
        status: "completed",
      },
      {
        id: "a1",
        requestId: "r1",
        role: "assistant",
        content: "Answer",
        status: "completed",
      },
    ],
    "Current",
  );
  assert.deepEqual(
    currentDuplicate,
    [],
    "current user message is not duplicated into history",
  );

  const manyMessages = Array.from({ length: 6 }).flatMap((_, index) => [
    {
      id: `u${index}`,
      requestId: `r${index}`,
      role: "user" as const,
      content: `Q${index}`,
      status: "completed" as const,
    },
    {
      id: `a${index}`,
      requestId: `r${index}`,
      role: "assistant" as const,
      content: `A${index}`,
      status: "completed" as const,
    },
  ]);
  assert.equal(
    buildCompletedConversationHistory(manyMessages, "Next").length,
    8,
    "history is capped at 8 messages",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
