import type {
  AssistantKnowledgeBase,
  AssistantProjectContext,
} from "@/types/assistant";

export function formatCompactPortfolioContext(
  knowledge: AssistantKnowledgeBase,
) {
  const lines = [
    `Name: ${knowledge.profile.fullName}`,
    `Role: ${knowledge.profile.role}`,
    `Location: ${knowledge.profile.location}`,
    `Summary: ${knowledge.profile.summary}`,
    `Current target: ${knowledge.profile.target}`,
    `Languages: ${knowledge.profile.languages
      .map((language) => `${language.name} (${language.level})`)
      .join(", ")}`,
    `Links: ${knowledge.profile.links
      .map((link) => `${link.key}: ${link.href}`)
      .join(", ")}`,
    "",
    "Skills:",
    ...knowledge.skills.map(
      (group) => `- ${group.label}: ${group.items.join(", ")}`,
    ),
    "",
    "Education:",
    ...knowledge.education.map(
      (item) =>
        `- ${item.title}, ${item.organization}, ${item.meta}, status: ${item.status}`,
    ),
    "",
    "Experience:",
    ...knowledge.experience.map(
      (item) => `- ${item.title}, ${item.organization}, ${item.meta}`,
    ),
    "",
    "Visible projects:",
    ...knowledge.projects.map((project) => {
      const description = project.description ?? "No repository description";
      const language = project.primaryLanguage ?? "Not specified";
      const liveDemo = project.liveDemoUrl ? "available" : "not available";

      return `- ${project.name} (${project.slug}): ${description}; primary language: ${language}; category: ${project.category}; live demo: ${liveDemo}`;
    }),
  ];

  if (knowledge.githubContextUnavailable) {
    lines.push(
      "",
      "Note: GitHub project list was unavailable for this request.",
    );
  }

  return lines.join("\n");
}

export function formatProjectReferenceContext(
  projectContexts: AssistantProjectContext[],
) {
  if (projectContexts.length === 0) return "";

  return projectContexts
    .map((project) =>
      [
        `<portfolio_reference project="${project.slug}" source="${project.source}" path="${project.path ?? "none"}">`,
        project.content,
        "</portfolio_reference>",
      ].join("\n"),
    )
    .join("\n\n");
}
