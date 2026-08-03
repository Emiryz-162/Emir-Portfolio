import { historicalProjectMatchesPublicProject } from "@/data/assistant-background";
import { getProjectMarkdownContent } from "@/lib/github/readme";
import { selectRelevantHistoricalProjects } from "@/lib/ai/retrieval/score-historical-projects";
import { selectRelevantProjects } from "@/lib/ai/retrieval/score-projects";
import type {
  AssistantHistoricalProject,
  AssistantProjectContext,
  AssistantProjectSummary,
} from "@/types/assistant";

export const MAX_RELATED_PROJECTS = 2;
export const MAX_PROJECT_DOCUMENT_CHARS = 8000;
export const MAX_TOTAL_PROJECT_DOCUMENT_CHARS = 12000;

export async function retrieveProjectContext(
  query: string,
  projects: AssistantProjectSummary[],
  historicalProjects: AssistantHistoricalProject[] = [],
) {
  const related = selectRelevantProjects(query, projects, MAX_RELATED_PROJECTS);
  const relatedPublicProjects = related.map(({ project }) => project);
  const contexts: AssistantProjectContext[] = [];
  let remainingDocumentBudget = MAX_TOTAL_PROJECT_DOCUMENT_CHARS;

  for (const result of related) {
    if (remainingDocumentBudget <= 0) break;

    const { project } = result;
    const markdown = await getProjectMarkdownContent(
      project.slug,
      project.description,
    );
    const content = truncateProjectMarkdown(
      markdown.markdown,
      Math.min(MAX_PROJECT_DOCUMENT_CHARS, remainingDocumentBudget),
    );
    remainingDocumentBudget -= content.length;

    contexts.push({
      slug: project.slug,
      name: project.name,
      source: markdown.source,
      path: markdown.path,
      content,
    });
  }

  const relevantHistoricalProjects = selectRelevantHistoricalProjects(
    query,
    historicalProjects,
    MAX_RELATED_PROJECTS,
  );

  for (const { project } of relevantHistoricalProjects) {
    const matchingPublicProject =
      projects.find((publicProject) =>
        historicalProjectMatchesPublicProject(project, publicProject),
      ) ?? null;
    const publicReference = matchingPublicProject
      ? `Matching public GitHub project: ${matchingPublicProject.name} (${matchingPublicProject.slug}). Use that project for public route/link metadata.`
      : "No verified public GitHub project or route is currently present for this historical project. Do not invent a GitHub URL, live demo, or /projects/[slug] route.";

    contexts.push({
      slug: project.key,
      name: project.name,
      source: "historical",
      path: "data/assistant-background.ts",
      content: [
        `${project.name}: ${project.summary}`,
        `Category: ${project.category}.`,
        `Aliases: ${project.aliases.join(", ")}.`,
        `Technologies: ${project.technologies.length > 0 ? project.technologies.join(", ") : "not specified"}.`,
        publicReference,
        `Notes: ${project.notes.join(" ")}`,
      ].join("\n"),
    });
  }

  return {
    relatedProjects: relatedPublicProjects.map((project) => ({
      slug: project.slug,
      name: project.name,
    })),
    contexts,
  };
}

export function truncateProjectMarkdown(
  markdown: string,
  maxChars = MAX_PROJECT_DOCUMENT_CHARS,
) {
  const withoutBase64 = markdown.replace(
    /data:[^)\]\s"'<>]+;base64,[A-Za-z0-9+/=]+/g,
    "[base64 content removed]",
  );
  const textOnly = withoutBase64
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (textOnly.length <= maxChars) return textOnly;

  return `${textOnly.slice(0, maxChars).trim()}\n\n[truncated]`;
}
