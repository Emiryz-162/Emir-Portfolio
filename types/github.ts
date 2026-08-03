export type GitHubOwner = {
  login: string;
};

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  default_branch: string;
  size: number;
  license: {
    name: string;
    spdx_id: string | null;
  } | null;
  owner: GitHubOwner;
};

export type GitHubLanguageMap = Record<string, number>;

export type PortfolioCategory =
  | "fullstack"
  | "frontend"
  | "backend"
  | "game"
  | "tool"
  | "experiment"
  | "other";

export type PortfolioStatus =
  "completed" | "in-development" | "experimental" | "archived";

export type PortfolioProject = {
  id: number;
  slug: string;
  name: string;
  fullName: string;
  description: string | null;
  githubUrl: string;
  liveDemoUrl: string | null;
  primaryLanguage: string | null;
  topics: string[];
  category: PortfolioCategory;
  status?: PortfolioStatus;
  isFeatured: boolean;
  isArchived: boolean;
  stars: number;
  forks: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  defaultBranch: string;
  licenseName: string | null;
};

export type PortfolioConfig = {
  featured?: boolean;
  hidden?: boolean;
  category?: PortfolioCategory;
  status?: PortfolioStatus;
  order?: number;
  cover?: string;
};

export type GitHubMarkdownContent = {
  source: "portfolio" | "readme" | "description";
  markdown: string;
  path: string | null;
};

export type LanguagePercentage = {
  name: string;
  bytes: number;
  percentage: number;
};
