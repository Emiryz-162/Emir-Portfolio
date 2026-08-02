import { githubConfig, portfolioTopics } from "@/config/github";
import type {
  GitHubLanguageMap,
  GitHubRepository,
  LanguagePercentage,
  PortfolioCategory,
  PortfolioConfig,
  PortfolioProject,
  PortfolioStatus,
} from "@/types/github";

const validCategories: PortfolioCategory[] = [
  "fullstack",
  "frontend",
  "backend",
  "game",
  "tool",
  "experiment",
  "other",
];

const validStatuses: PortfolioStatus[] = [
  "completed",
  "in-development",
  "experimental",
  "archived",
];

const ignoredRepositoryNames = new Set([
  githubConfig.username.toLowerCase(),
  ".github",
  "config",
  "dotfiles",
]);

export function filterPortfolioRepositories(repositories: GitHubRepository[]) {
  return repositories.filter((repo) => {
    const topics = normalizeTopics(repo.topics);
    const name = repo.name.toLowerCase();

    if (repo.visibility !== "public") return false;
    if (repo.fork || repo.disabled) return false;
    if (topics.includes(portfolioTopics.hidden)) return false;
    if (ignoredRepositoryNames.has(name)) return false;
    if (repo.size === 0 && repo.description == null && topics.length === 0) {
      return false;
    }

    return true;
  });
}

export function mapGitHubRepositoryToProject(
  repo: GitHubRepository,
  config?: PortfolioConfig | null,
): PortfolioProject | null {
  if (config?.hidden) return null;

  const topics = normalizeTopics(repo.topics);
  const category = config?.category ?? inferCategory(repo);
  const status = config?.status ?? inferStatus(repo);

  return {
    id: repo.id,
    slug: repo.name,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    githubUrl: repo.html_url,
    liveDemoUrl: getValidHttpUrl(repo.homepage),
    primaryLanguage: repo.language,
    topics,
    category,
    status,
    isFeatured: config?.featured ?? topics.includes(portfolioTopics.featured),
    isArchived: repo.archived,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    pushedAt: repo.pushed_at,
    defaultBranch: repo.default_branch,
    licenseName: repo.license?.name ?? null,
  };
}

export function selectFeaturedProjects(projects: PortfolioProject[]) {
  const visible = projects.filter(
    (project) => !project.isArchived && project.status !== "archived",
  );
  const featured = visible
    .filter((project) => project.isFeatured)
    .sort(compareProjectsForFeatured);

  return (featured.length > 0 ? featured : visible)
    .sort(compareProjectsForFeatured)
    .slice(0, 4);
}

export function sortProjects(
  projects: PortfolioProject[],
  sort: "updated" | "newest" | "oldest" | "name",
) {
  return [...projects].sort((a, b) => {
    if (sort === "newest") {
      return dateValue(b.createdAt) - dateValue(a.createdAt);
    }

    if (sort === "oldest") {
      return dateValue(a.createdAt) - dateValue(b.createdAt);
    }

    if (sort === "name") {
      return a.name.localeCompare(b.name);
    }

    return dateValue(b.updatedAt) - dateValue(a.updatedAt);
  });
}

export function calculateLanguagePercentages(
  languages: GitHubLanguageMap,
): LanguagePercentage[] {
  const entries = Object.entries(languages).filter(([, bytes]) => bytes > 0);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);

  if (total <= 0) return [];

  return entries
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Math.max(1, Math.round((bytes / total) * 100)),
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 6);
}

export function validatePortfolioConfig(
  value: unknown,
): PortfolioConfig | null {
  if (!value || typeof value !== "object") return null;

  const input = value as Record<string, unknown>;
  const config: PortfolioConfig = {};

  if (typeof input.featured === "boolean") config.featured = input.featured;
  if (typeof input.hidden === "boolean") config.hidden = input.hidden;

  if (
    typeof input.category === "string" &&
    validCategories.includes(input.category as PortfolioCategory)
  ) {
    config.category = input.category as PortfolioCategory;
  }

  if (
    typeof input.status === "string" &&
    validStatuses.includes(input.status as PortfolioStatus)
  ) {
    config.status = input.status as PortfolioStatus;
  }

  if (typeof input.order === "number" && Number.isFinite(input.order)) {
    config.order = input.order;
  }

  if (typeof input.cover === "string" && input.cover.trim().length > 0) {
    config.cover = input.cover;
  }

  return config;
}

function compareProjectsForFeatured(a: PortfolioProject, b: PortfolioProject) {
  if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
  return dateValue(b.updatedAt) - dateValue(a.updatedAt);
}

function inferCategory(repo: GitHubRepository): PortfolioCategory {
  const topics = normalizeTopics(repo.topics);
  const categoryByTopic = Object.entries(portfolioTopics.categories).find(
    ([, topic]) => topics.includes(topic),
  )?.[0] as PortfolioCategory | undefined;

  if (categoryByTopic) return categoryByTopic;

  const language = repo.language?.toLowerCase();

  if (language === "c#" || topics.some((topic) => topic.includes("aspnet"))) {
    return "backend";
  }

  if (language === "html" || language === "css" || language === "javascript") {
    return "frontend";
  }

  if (
    topics.some((topic) => topic.includes("unity") || topic.includes("godot"))
  ) {
    return "game";
  }

  return "other";
}

function inferStatus(repo: GitHubRepository): PortfolioStatus {
  if (repo.archived) return "archived";

  const topics = normalizeTopics(repo.topics);
  if (topics.includes("experimental") || topics.includes("prototype")) {
    return "experimental";
  }

  return "in-development";
}

function normalizeTopics(topics: string[] | undefined) {
  return (topics ?? []).map((topic) => topic.toLowerCase());
}

function getValidHttpUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function dateValue(value: string) {
  return new Date(value).getTime();
}
