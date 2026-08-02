import { githubConfig } from "@/config/github";
import { githubFetch } from "@/lib/github/client";
import { getGitHubErrorMessage } from "@/lib/github/errors";
import {
  filterPortfolioRepositories,
  mapGitHubRepositoryToProject,
  selectFeaturedProjects,
  sortProjects,
} from "@/lib/github/mapping";
import type { GitHubRepository, PortfolioProject } from "@/types/github";

export type ProjectsResult =
  | {
      ok: true;
      projects: PortfolioProject[];
    }
  | {
      ok: false;
      projects: PortfolioProject[];
      message: string;
    };

export async function getGitHubRepositories() {
  return githubFetch<GitHubRepository[]>(
    `/users/${githubConfig.username}/repos?type=owner&sort=updated&direction=desc&per_page=100`,
  );
}

export async function getPortfolioProjects(): Promise<ProjectsResult> {
  try {
    const repositories = await getGitHubRepositories();
    // TODO: Add optional per-repository portfolio.json overrides without increasing
    // list-page rate-limit pressure.
    const projects = filterPortfolioRepositories(repositories)
      .map((repo) => mapGitHubRepositoryToProject(repo))
      .filter((project): project is PortfolioProject => project != null);

    return {
      ok: true,
      projects: sortProjects(projects, "updated"),
    };
  } catch (error) {
    console.error(getSafeGitHubLogMessage(error));

    return {
      ok: false,
      projects: [],
      message: getGitHubErrorMessage(error),
    };
  }
}

export async function getFeaturedPortfolioProjects() {
  const result = await getPortfolioProjects();

  return {
    ...result,
    projects: selectFeaturedProjects(result.projects),
  };
}

export async function getPortfolioProject(slug: string) {
  const result = await getPortfolioProjects();

  if (!result.ok) return null;

  return (
    result.projects.find(
      (project) => project.slug.toLowerCase() === slug.toLowerCase(),
    ) ?? null
  );
}

export async function getPortfolioProjectResult(slug: string) {
  const result = await getPortfolioProjects();

  if (!result.ok) {
    return {
      ok: false as const,
      message: result.message,
      project: null,
    };
  }

  return {
    ok: true as const,
    project:
      result.projects.find(
        (project) => project.slug.toLowerCase() === slug.toLowerCase(),
      ) ?? null,
  };
}

function getSafeGitHubLogMessage(error: unknown) {
  if (error instanceof Error) {
    return `[github] ${error.name}: ${error.message}`;
  }

  return "[github] Unknown GitHub error";
}
