import { getProjectMarkdownContent } from "@/lib/github/readme";
import { selectRelevantProjects } from "@/lib/ai/retrieval/score-projects";
import type {
  AssistantProjectContext,
  AssistantProjectSummary,
} from "@/types/assistant";

export const MAX_RELATED_PROJECTS = 2;
export const MAX_PROJECT_DOCUMENT_CHARS = 8000;
export const MAX_TOTAL_PROJECT_DOCUMENT_CHARS = 12000;

export async function retrieveProjectContext(
  query: string,
  projects: AssistantProjectSummary[],
) {
  const related = selectRelevantProjects(query, projects, MAX_RELATED_PROJECTS);
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

  return {
    relatedProjects: related.map(({ project }) => ({
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
