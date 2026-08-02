"use client";

import {
  Archive,
  ArrowUpRight,
  CalendarDays,
  Code2,
  ExternalLink,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TechBadge } from "@/components/ui/tech-badge";
import { profile } from "@/data/profile";
import { buildLocalizedHref } from "@/i18n/routing";
import { formatDate } from "@/lib/format";
import type { PortfolioCategory, PortfolioProject } from "@/types/github";

type ProjectSort = "updated" | "newest" | "oldest" | "name";
type ProjectFilter = PortfolioCategory | "all" | "archived";

type ProjectsBrowserLabels = {
  search: string;
  searchPlaceholder: string;
  category: string;
  sort: string;
  clearFilters: string;
  emptyTitle: string;
  emptyDescription: string;
  viewGitHubProfile: string;
  resultCount: string;
  updated: string;
  archived: string;
  detail: string;
  liveDemo: string;
  noDescription: string;
  githubAria: string;
  liveDemoAria: string;
  categories: Record<ProjectFilter, string>;
  sorts: Record<ProjectSort, string>;
  statuses: Record<string, string>;
};

type ProjectsBrowserProps = {
  locale: string;
  projects: PortfolioProject[];
  labels: ProjectsBrowserLabels;
};

const categories: ProjectFilter[] = [
  "all",
  "fullstack",
  "frontend",
  "backend",
  "game",
  "tool",
  "experiment",
  "other",
  "archived",
];

const sorts: ProjectSort[] = ["updated", "newest", "oldest", "name"];

export function ProjectsBrowser({
  locale,
  projects,
  labels,
}: ProjectsBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const shouldKeepSortParam = useRef(searchParams.has("sort"));

  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [category, setCategory] = useState<ProjectFilter>(
    getValidFilter(searchParams.get("category")),
  );
  const [sort, setSort] = useState<ProjectSort>(
    getValidSort(searchParams.get("sort")),
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (category !== "all") params.set("category", category);
    if (sort !== "updated" || shouldKeepSortParam.current) {
      params.set("sort", sort);
    }

    const hash = window.location.hash;

    startTransition(() => {
      router.replace(
        params.size ? `${pathname}?${params}${hash}` : `${pathname}${hash}`,
        {
          scroll: false,
        },
      );
    });
  }, [category, pathname, query, router, sort]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query, locale);

    return sortProjectsForClient(
      projects.filter((project) => {
        if (category === "archived" && !project.isArchived) return false;
        if (
          category !== "all" &&
          category !== "archived" &&
          project.category !== category
        ) {
          return false;
        }

        if (!normalizedQuery) return true;

        const haystack = [
          project.name,
          project.description ?? "",
          project.primaryLanguage ?? "",
          ...project.topics,
        ].join(" ");

        return normalizeSearchValue(haystack, locale).includes(normalizedQuery);
      }),
      sort,
    );
  }, [category, locale, projects, query, sort]);

  const clearFilters = () => {
    shouldKeepSortParam.current = false;
    setQuery("");
    setCategory("all");
    setSort("updated");
  };

  return (
    <div className="mt-10">
      <div className="grid gap-3 rounded-[6px] border border-border bg-surface/72 p-4 lg:grid-cols-[1fr_0.34fr_0.28fr]">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {labels.search}
          </span>
          <span className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              size={16}
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.searchPlaceholder}
              className="h-11 w-full rounded-[6px] border border-border bg-background px-10 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-border-strong focus:ring-2 focus:ring-ring"
            />
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {labels.category}
          </span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as ProjectFilter)
            }
            className="h-11 rounded-[6px] border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-border-strong focus:ring-2 focus:ring-ring"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {labels.categories[item]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {labels.sort}
          </span>
          <select
            value={sort}
            onChange={(event) => {
              shouldKeepSortParam.current = true;
              setSort(event.target.value as ProjectSort);
            }}
            className="h-11 rounded-[6px] border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-border-strong focus:ring-2 focus:ring-ring"
          >
            {sorts.map((item) => (
              <option key={item} value={item}>
                {labels.sorts[item]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <p>
          {labels.resultCount.replace(
            "{count}",
            String(filteredProjects.length),
          )}
        </p>
        {(query || category !== "all" || sort !== "updated") && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-[6px] border border-border px-3 py-2 text-muted-foreground transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={14} aria-hidden="true" />
            {labels.clearFilters}
          </button>
        )}
      </div>

      {filteredProjects.length > 0 ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {filteredProjects.map((project) => (
            <ClientProjectCard
              key={project.id}
              locale={locale}
              project={project}
              labels={labels}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[6px] border border-border bg-surface/72 p-6">
          <h2 className="text-xl font-semibold text-foreground">
            {labels.emptyTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            {labels.emptyDescription}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={clearFilters}>
              {labels.clearFilters}
            </Button>
            <Button asChild variant="secondary">
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Code2 size={16} aria-hidden="true" />
                {labels.viewGitHubProfile}
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientProjectCard({
  locale,
  project,
  labels,
}: {
  locale: string;
  project: PortfolioProject;
  labels: ProjectsBrowserLabels;
}) {
  const visibleTopics = project.topics.slice(0, 4);
  const remainingTopicCount = project.topics.length - visibleTopics.length;

  return (
    <Card className="group overflow-hidden hover:-translate-y-1">
      <div className="grid h-full md:grid-cols-[0.86fr_1.14fr] lg:grid-cols-1">
        <ClientProjectCover project={project} />
        <div className="flex min-w-0 flex-col justify-between p-5 sm:p-6">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <TechBadge>{labels.categories[project.category]}</TechBadge>
                {project.isArchived ? (
                  <span className="inline-flex items-center gap-1 rounded-[6px] border border-border bg-background/70 px-2.5 py-1 font-mono text-[11px] uppercase tracking-normal text-muted">
                    <Archive size={12} aria-hidden="true" />
                    {labels.archived}
                  </span>
                ) : null}
              </div>
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border border-border text-muted-foreground transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={labels.githubAria.replace("{name}", project.name)}
              >
                <Code2 size={16} aria-hidden="true" />
              </a>
            </div>
            <h2 className="mt-5 break-words text-2xl font-semibold tracking-normal text-foreground">
              {project.name}
            </h2>
            <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-6 text-muted">
              {project.description ?? labels.noDescription}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.primaryLanguage ? (
                <TechBadge>{project.primaryLanguage}</TechBadge>
              ) : null}
              {visibleTopics.map((topic) => (
                <TechBadge key={topic}>{topic}</TechBadge>
              ))}
              {remainingTopicCount > 0 ? (
                <TechBadge>{`+${remainingTopicCount}`}</TechBadge>
              ) : null}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} aria-hidden="true" />
                {labels.updated.replace(
                  "{date}",
                  formatDate(project.updatedAt, locale),
                )}
              </span>
              <span>{labels.statuses[project.status]}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={buildLocalizedHref(locale, `/projects/${project.slug}`)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {labels.detail}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            {project.liveDemoUrl ? (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={labels.liveDemoAria.replace("{name}", project.name)}
              >
                {labels.liveDemo}
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ClientProjectCover({ project }: { project: PortfolioProject }) {
  const initials = project.name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="relative min-h-56 overflow-hidden border-b border-border bg-background md:border-b-0 md:border-r lg:border-b lg:border-r-0">
      <div className="absolute inset-5 rounded-[6px] border border-border bg-surface/70" />
      <div className="absolute inset-x-8 top-10 h-px bg-border" />
      <div className="absolute inset-x-8 bottom-8 grid grid-cols-4 gap-2">
        <span className="h-10 rounded-[4px] bg-surface-muted" />
        <span className="h-10 rounded-[4px] bg-border-strong" />
        <span className="h-10 rounded-[4px] bg-surface-muted" />
        <span className="h-10 rounded-[4px] bg-surface-elevated" />
      </div>
      <div className="absolute left-8 top-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-[6px] border border-border-strong bg-accent/12 font-mono text-2xl text-foreground transition duration-300 group-hover:scale-[1.02]">
          {initials || "PR"}
        </div>
        {project.primaryLanguage ? (
          <p className="mt-4 font-mono text-xs uppercase tracking-normal text-muted">
            {project.primaryLanguage}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function getValidFilter(value: string | null): ProjectFilter {
  return categories.includes(value as ProjectFilter)
    ? (value as ProjectFilter)
    : "all";
}

function getValidSort(value: string | null): ProjectSort {
  return sorts.includes(value as ProjectSort)
    ? (value as ProjectSort)
    : "updated";
}

function sortProjectsForClient(
  projects: PortfolioProject[],
  sort: ProjectSort,
) {
  return [...projects].sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (sort === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    if (sort === "name") {
      return a.name.localeCompare(b.name);
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function normalizeSearchValue(value: string, locale: string) {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase(locale);
}
