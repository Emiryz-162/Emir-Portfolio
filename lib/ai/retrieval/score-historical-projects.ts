import {
  normalizeQuery,
  tokenizeQuery,
} from "@/lib/ai/retrieval/normalize-query";
import type { AssistantHistoricalProject } from "@/types/assistant";

export type ScoredHistoricalProject = {
  project: AssistantHistoricalProject;
  score: number;
};

const MIN_SCORE = 3;
const DEFAULT_LIMIT = 2;

export function scoreHistoricalProjects(
  query: string,
  projects: AssistantHistoricalProject[],
) {
  const queryTokens = tokenizeQuery(query);
  const normalizedQuery = normalizeQuery(query);

  if (queryTokens.length === 0) return [];

  return projects
    .map((project) => ({
      project,
      score: scoreHistoricalProject(project, queryTokens, normalizedQuery),
    }))
    .filter((result) => result.score >= MIN_SCORE)
    .sort(
      (a, b) =>
        b.score - a.score || a.project.name.localeCompare(b.project.name),
    );
}

export function selectRelevantHistoricalProjects(
  query: string,
  projects: AssistantHistoricalProject[],
  limit = DEFAULT_LIMIT,
) {
  return scoreHistoricalProjects(query, projects).slice(0, limit);
}

function scoreHistoricalProject(
  project: AssistantHistoricalProject,
  queryTokens: string[],
  normalizedQuery: string,
) {
  const fields = [
    { value: project.name, weight: 5 },
    { value: project.aliases.join(" "), weight: 5 },
    { value: project.githubProjectAliases?.join(" ") ?? "", weight: 5 },
    { value: project.category, weight: 3 },
    { value: project.summary, weight: 4 },
    { value: project.technologies.join(" "), weight: 3 },
    { value: project.notes.join(" "), weight: 2 },
  ];

  return fields.reduce((score, field) => {
    const normalized = normalizeQuery(field.value);
    if (!normalized) return score;

    const exactBonus =
      normalizedQuery && normalized.includes(normalizedQuery)
        ? field.weight * 2
        : 0;
    const tokenScore = queryTokens.reduce(
      (sum, token) => sum + (normalized.includes(token) ? field.weight : 0),
      0,
    );

    return score + exactBonus + tokenScore;
  }, 0);
}
