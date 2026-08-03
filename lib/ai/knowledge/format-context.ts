import {
  getStandaloneHistoricalProjects,
  historicalProjectMatchesPublicProject,
} from "@/data/assistant-background";
import type {
  AssistantKnowledgeBase,
  AssistantHistoricalProject,
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
    "Verified education background:",
    ...knowledge.background.educationBackground.map((item) => {
      const period = item.period ? `, ${item.period}` : "";

      return `- ${item.institution}, ${item.program}${period}, status: ${item.status}; ${item.notes.join(" ")}`;
    }),
    "",
    "Professional training:",
    ...knowledge.background.professionalTraining.map(
      (item) =>
        `- ${item.summary} Technologies: ${item.technologies.join(", ")}. Guardrails: ${item.guardrails.join(" ")}`,
    ),
    "",
    "Technical background:",
    `- Main: ${knowledge.background.technicalPreferences.main.join(", ")}`,
    `- Additional: ${knowledge.background.technicalPreferences.additional.join(", ")}`,
    "",
    "Game development background:",
    ...knowledge.background.gameDevelopmentBackground.map(
      (item) => `- ${item}`,
    ),
    "",
    "Achievements:",
    ...knowledge.background.achievements.map(
      (item) =>
        `- ${item.title}, ${item.year}, result: ${item.result}, category: ${item.category}. ${item.notes.join(" ")}`,
    ),
    "",
    "Historical projects without public project links:",
    ...formatHistoricalProjects(
      getStandaloneHistoricalProjects(
        knowledge.background.historicalProjects,
        knowledge.projects,
      ),
    ),
    "",
    "Historical context attached to matching public GitHub projects:",
    ...formatHistoricalProjects(
      knowledge.background.historicalProjects.filter((historicalProject) =>
        knowledge.projects.some((project) =>
          historicalProjectMatchesPublicProject(historicalProject, project),
        ),
      ),
    ),
    "",
    "Work preferences:",
    ...knowledge.background.workPreferences.map((item) => `- ${item}`),
    "",
    "Professional positioning:",
    ...knowledge.background.professionalPositioning.map((item) => `- ${item}`),
    "",
    "Source priority:",
    ...knowledge.background.sourcePriority.map(
      (item, index) => `${index + 1}. ${item}`,
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

function formatHistoricalProjects(projects: AssistantHistoricalProject[]) {
  if (projects.length === 0) return ["- None currently matched."];

  return projects.map((project) => {
    const technologies =
      project.technologies.length > 0
        ? project.technologies.join(", ")
        : "not specified";
    const publicRepository =
      project.publicRepositoryAvailable === true
        ? "available"
        : project.publicRepositoryAvailable === false
          ? "not present"
          : "unknown unless matched by GitHub metadata";
    const publicDemo =
      project.publicDemoAvailable === true
        ? "available"
        : project.publicDemoAvailable === false
          ? "not present"
          : "unknown unless matched by GitHub metadata";

    return `- ${project.name}: ${project.summary} Category: ${project.category}. Technologies: ${technologies}. Public repository: ${publicRepository}. Public demo: ${publicDemo}. Notes: ${project.notes.join(" ")}`;
  });
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
