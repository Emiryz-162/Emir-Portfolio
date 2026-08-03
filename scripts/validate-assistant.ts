import { strict as assert } from "node:assert";

import { isAssistantEnabledFromValues } from "@/lib/ai/availability-core";
import { buildCompletedConversationHistory } from "@/lib/ai/conversation/build-history";
import { getAssistantPublicErrorCode } from "@/lib/ai/errors";
import {
  buildAssistantOpenAIResponseConfig,
  DEFAULT_ASSISTANT_MAX_OUTPUT_TOKENS,
  getAssistantMaxOutputTokens,
  getReasoningConfig,
} from "@/lib/ai/openai-response-config";
import {
  classifyIncompleteReason,
  getResponseStatus,
  isCompletedResponse,
} from "@/lib/ai/openai-response";
import { buildPortfolioAssistantInstructions } from "@/lib/ai/prompts/portfolio-assistant";
import { buildPortfolioKnowledge } from "@/lib/ai/knowledge/build-portfolio-knowledge";
import { formatCompactPortfolioContext } from "@/lib/ai/knowledge/format-context";
import {
  assistantBackground,
  getStandaloneHistoricalProjects,
} from "@/data/assistant-background";
import {
  normalizeLocale,
  validateAssistantRequestBody,
} from "@/lib/ai/request-validation";
import { checkAssistantRateLimit } from "@/lib/ai/rate-limit";
import { selectRelevantProjects } from "@/lib/ai/retrieval/score-projects";
import {
  MAX_PROJECT_DOCUMENT_CHARS,
  MAX_TOTAL_PROJECT_DOCUMENT_CHARS,
  retrieveProjectContext,
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
  assertVerifiedBackground(knowledge, context);

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
  assert.ok(
    instructions.includes("Do not invent public links"),
    "prompt guards historical projects against fake links",
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
    DEFAULT_ASSISTANT_MAX_OUTPUT_TOKENS,
    1200,
    "default max output tokens is 1200",
  );
  assert.deepEqual(
    getReasoningConfig("gpt-5-mini"),
    { reasoning: { effort: "minimal" } },
    "gpt-5-mini uses minimal reasoning",
  );
  assert.deepEqual(
    getReasoningConfig("gpt-4.1-mini"),
    {},
    "non-reasoning model does not receive reasoning config",
  );
  assert.equal(
    getAssistantMaxOutputTokens("bad"),
    1200,
    "invalid max output env value falls back",
  );
  assert.equal(
    getAssistantMaxOutputTokens("300"),
    1200,
    "too-low max output env value falls back",
  );
  assert.equal(
    getAssistantMaxOutputTokens("1600"),
    1600,
    "valid max output env value is accepted",
  );
  assert.equal(
    classifyIncompleteReason("max_output_tokens"),
    "token_limit",
    "max_output_tokens classifies as token limit",
  );
  assert.equal(
    classifyIncompleteReason("max_tokens"),
    "token_limit",
    "max_tokens classifies as token limit",
  );
  assert.equal(
    classifyIncompleteReason("content_filter"),
    "content_filter",
    "content_filter is not classified as token limit",
  );
  assert.deepEqual(
    buildAssistantOpenAIResponseConfig({
      model: "gpt-5-mini",
      instructions: "test",
      input: [{ role: "user", content: "hello" }],
    }),
    {
      model: "gpt-5-mini",
      instructions: "test",
      input: [{ role: "user", content: "hello" }],
      max_output_tokens: 1200,
      store: false,
      reasoning: { effort: "minimal" },
    },
    "streaming and non-streaming can share the same config builder",
  );
  assert.equal(
    buildLocalizedHref(
      "tr",
      `/projects/${encodeURIComponent("aspnet-core-api")}`,
    ),
    "/tr/projects/aspnet-core-api",
    "related project URL is locale-aware",
  );

  await assertHistoricalRetrieval();

  console.log("Assistant validation passed.");
}

function assertVerifiedBackground(
  knowledge: Awaited<ReturnType<typeof buildPortfolioKnowledge>>,
  context: string,
) {
  assert.ok(
    context.includes("Akdeniz Game Jam - Birincilik"),
    "Akdeniz Game Jam first place achievement exists",
  );
  assert.ok(context.includes("1st Place"), "achievement result is present");
  assert.equal(
    /Akdeniz Game Jam.*(game name|team name|jury|participant count|prize)/i.test(
      context,
    ),
    true,
    "achievement guardrails are present",
  );
  assert.equal(
    /Akdeniz Game Jam.*(winner game|winning game is|team\s+(alpha|red|blue|emir))/i.test(
      context,
    ),
    false,
    "game jam game or team name is not invented",
  );

  assert.ok(
    context.includes(
      "SmartPro Yazilim Akademisi tarafindan verilen, Microsoft onayli 240 saatlik Full Stack Developer egitimi.",
    ),
    "SmartPro exact verified wording exists",
  );
  assert.ok(
    context.includes("Do not say Emir was hired by Microsoft"),
    "Microsoft employment guardrail is present",
  );
  assert.equal(
    /Microsoft Certified Solutions Developer|official certificate title:|certificate title is/i.test(
      context,
    ),
    false,
    "unverified Microsoft certificate titles are absent",
  );

  assert.ok(
    context.includes("Okan University, Computer Programming, 2022-2024"),
    "Okan University Computer Programming exists",
  );
  assert.equal(
    /Computer Engineering graduate|studied Computer Engineering|Computer Engineering degree/i.test(
      context,
    ),
    false,
    "Computer Engineering is not claimed as Emir's program",
  );
  assert.ok(
    context.includes("Istanbul University, Graphic Design, 2023-present"),
    "Graphic Design ongoing education exists",
  );
  assert.ok(context.includes("status: in-progress"), "ongoing status exists");

  assert.ok(
    context.includes("Future Mail"),
    "Future Mail graduation project exists",
  );
  assert.equal(
    /Future Mail.*(github\.com|\/projects\/future-mail|live demo)/i.test(
      context,
    ),
    false,
    "historical projects do not receive fake public links",
  );

  for (const project of assistantBackground.historicalProjects) {
    assert.equal(
      Object.hasOwn(project, "slug"),
      false,
      `historical project ${project.name} has no public slug field`,
    );
    assert.equal(
      Object.hasOwn(project, "githubUrl"),
      false,
      `historical project ${project.name} has no fake GitHub URL field`,
    );
  }

  const standalone = getStandaloneHistoricalProjects(
    assistantBackground.historicalProjects,
    [
      {
        slug: "DigitalMenu",
        name: "DigitalMenu",
      },
      {
        slug: "weather-app",
        name: "Weather App",
      },
    ],
  );
  assert.equal(
    standalone.some((project) => project.key === "digital-menu"),
    false,
    "DigitalMenu historical/public duplicate is removed from standalone list",
  );
  assert.equal(
    standalone.some((project) => project.key === "weather-app"),
    false,
    "Weather App historical/public duplicate is removed from standalone list",
  );

  assert.equal(
    /phone|telephone|birth date|date of birth/i.test(context),
    false,
    "phone and birth date remain absent after background expansion",
  );
  assert.equal(
    /portfolio-[a-z-]+/i.test(context),
    false,
    "portfolio topics remain absent after background expansion",
  );
  assert.ok(
    context.includes("remote or hybrid"),
    "remote/hybrid preference exists",
  );
  assert.ok(
    context.includes("Frontend is slightly stronger than backend"),
    "frontend/backend positioning exists",
  );
  assert.equal(
    /Emir is (a )?(senior|mid-level|expert|master)|senior developer|mid-level developer/i.test(
      context,
    ),
    false,
    "experience level is not exaggerated",
  );
  assert.ok(
    context.length < 24000,
    "compact assistant context stays within the configured size budget",
  );
  assert.equal(
    knowledge.background,
    assistantBackground,
    "knowledge uses the central verified background source",
  );
}

async function assertHistoricalRetrieval() {
  const retrieval = await retrieveProjectContext(
    "Future Mail projesinin github linki var mi?",
    sampleProjects,
    assistantBackground.historicalProjects,
  );
  const historical = retrieval.contexts.find(
    (context) => context.source === "historical",
  );

  assert.ok(historical, "historical project retrieval returns context");
  assert.equal(
    retrieval.relatedProjects.some((project) => project.slug === "future-mail"),
    false,
    "historical-only projects are not returned as related project links",
  );
  assert.ok(
    historical?.content.includes("Do not invent a GitHub URL"),
    "historical retrieval carries no-fake-link instruction",
  );
  assert.equal(
    retrieval.contexts.reduce(
      (total, item) => total + item.content.length,
      0,
    ) <=
      MAX_TOTAL_PROJECT_DOCUMENT_CHARS + 2000,
    true,
    "assistant reference contexts stay bounded",
  );
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
