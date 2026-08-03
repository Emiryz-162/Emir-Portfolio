import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { ProjectsBrowser } from "@/components/projects/projects-browser";
import { ProjectsUnavailableState } from "@/components/projects/projects-empty-state";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { getPortfolioProjects } from "@/lib/github/repositories";
import { createPageMetadata } from "@/lib/metadata";

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ProjectsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return createPageMetadata({
    title: t("projects.title"),
    description: t("projects.description"),
    pathname: "/projects",
    locale,
  });
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Projects");
  const projectsResult = await getPortfolioProjects();

  const labels = {
    search: t("search"),
    searchPlaceholder: t("searchPlaceholder"),
    category: t("category"),
    sort: t("sort"),
    clearFilters: t("clearFilters"),
    emptyTitle: t("emptyTitle"),
    emptyDescription: t("emptyDescription"),
    viewGitHubProfile: t("viewGitHubProfile"),
    resultCount: t.raw("resultCount") as string,
    updated: t.raw("updated") as string,
    archived: t("archived"),
    detail: t("card.detail"),
    liveDemo: t("card.liveDemo"),
    noDescription: t("card.noDescription"),
    githubAria: t.raw("card.githubAria") as string,
    liveDemoAria: t.raw("card.liveDemoAria") as string,
    categories: {
      all: t("categories.all"),
      fullstack: t("categories.fullstack"),
      frontend: t("categories.frontend"),
      backend: t("categories.backend"),
      game: t("categories.game"),
      tool: t("categories.tool"),
      experiment: t("categories.experiment"),
      other: t("categories.other"),
      archived: t("categories.archived"),
    },
    sorts: {
      updated: t("sorts.updated"),
      newest: t("sorts.newest"),
      oldest: t("sorts.oldest"),
      name: t("sorts.name"),
    },
    statuses: {
      completed: t("statuses.completed"),
      "in-development": t("statuses.inDevelopment"),
      experimental: t("statuses.experimental"),
      archived: t("statuses.archived"),
    },
  };

  return (
    <Container className="py-12 sm:py-16">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <Heading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />
        <div className="rounded-[6px] border border-border bg-surface/72 px-4 py-3 font-mono text-xs uppercase tracking-normal text-muted">
          {projectsResult.ok
            ? t("publicProjects", { count: projectsResult.projects.length })
            : t("githubSync")}
        </div>
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
        {t("githubSync")}
      </p>

      {projectsResult.ok ? (
        projectsResult.projects.length > 0 ? (
          <Suspense fallback={<ProjectsBrowserFallback />}>
            <ProjectsBrowser
              locale={locale}
              projects={projectsResult.projects}
              labels={labels}
            />
          </Suspense>
        ) : (
          <ProjectsUnavailableState
            className="mt-10"
            message={t("noProjects")}
          />
        )
      ) : (
        <ProjectsUnavailableState
          className="mt-10"
          message={projectsResult.message}
        />
      )}
    </Container>
  );
}

function ProjectsBrowserFallback() {
  return (
    <div className="mt-10">
      <div className="h-28 animate-pulse rounded-[6px] border border-border bg-surface/72 motion-reduce:animate-none" />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-96 animate-pulse rounded-[6px] border border-border bg-surface/72 motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}
