import { Archive, ArrowLeft, ExternalLink, GitFork, Star } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { GitHubMark } from "@/components/icons/brand-icons";
import { SafeMarkdown } from "@/components/markdown/safe-markdown";
import { ProjectsUnavailableState } from "@/components/projects/projects-empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { buildLocalizedHref } from "@/i18n/routing";
import { formatNumber, truncateText } from "@/lib/format";
import { getProjectMarkdownContent } from "@/lib/github/readme";
import { getPortfolioProjectResult } from "@/lib/github/repositories";
import { getGitHubRepositoryLanguages } from "@/lib/github/repository-details";
import { createPageMetadata, getMetadataBase } from "@/lib/metadata";

type ProjectDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({
    locale,
    namespace: "Metadata.projectDetail",
  });
  const projectResult = await getPortfolioProjectResult(slug);

  if (!projectResult.ok) {
    return {
      metadataBase: getMetadataBase(),
      title: t("notFoundTitle"),
    };
  }

  if (!projectResult.project) notFound();

  const project = projectResult.project;

  return createPageMetadata({
    title: `${project.name} | Emir Yılmaz`,
    description: truncateText(
      project.description ?? t("fallbackDescription"),
      155,
    ),
    pathname: `/projects/${project.slug}`,
    locale,
  });
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("ProjectDetail");
  const projectResult = await getPortfolioProjectResult(slug);

  if (!projectResult.ok) {
    return (
      <Container className="py-12 sm:py-16">
        <Link
          href={buildLocalizedHref(locale, "/projects")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t("back")}
        </Link>
        <ProjectsUnavailableState
          className="mt-8"
          message={projectResult.message}
        />
      </Container>
    );
  }

  if (!projectResult.project) notFound();

  const project = projectResult.project;

  const [languages, markdownContent] = await Promise.all([
    getGitHubRepositoryLanguages(project.slug),
    getProjectMarkdownContent(project.slug, project.description),
  ]);

  return (
    <Container className="py-12 sm:py-16">
      <Link
        href={buildLocalizedHref(locale, "/projects")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t("back")}
      </Link>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <div>
          <div className="flex flex-wrap gap-2">
            {project.isArchived ? (
              <span className="inline-flex items-center gap-1 rounded-[6px] border border-border bg-surface px-2.5 py-1 font-mono text-[11px] uppercase tracking-normal text-muted">
                <Archive size={12} aria-hidden="true" />
                {t("archived")}
              </span>
            ) : null}
          </div>
          <h1 className="mt-5 break-words text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            {project.name}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg">
            {project.description ?? t("noDescription")}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild>
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubMark size={16} aria-hidden="true" />
                {t("viewGitHub")}
              </a>
            </Button>
            {project.liveDemoUrl ? (
              <Button asChild>
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={16} aria-hidden="true" />
                  {t("liveDemo")}
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <ProjectCover name={project.name} language={project.primaryLanguage} />
      </section>

      {project.isArchived ? (
        <div className="mt-8 rounded-[6px] border border-border bg-surface/72 p-4 text-sm leading-6 text-muted">
          {t("archivedWarning")}
        </div>
      ) : null}

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.74fr_1.26fr]">
        <aside className="grid gap-6 self-start">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-foreground">
              {t("metadata")}
            </h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <MetaRow label={t("primaryLanguage")}>
                {project.primaryLanguage ?? t("notAvailable")}
              </MetaRow>
              <MetaRow label={t("license")}>
                {project.licenseName ?? t("notAvailable")}
              </MetaRow>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-border px-2.5 py-1">
                <Star size={14} aria-hidden="true" />
                {t("stars", { count: formatNumber(project.stars, locale) })}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-border px-2.5 py-1">
                <GitFork size={14} aria-hidden="true" />
                {t("forks", { count: formatNumber(project.forks, locale) })}
              </span>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-foreground">
              {t("languages")}
            </h2>
            {languages.length > 0 ? (
              <div className="mt-5 grid gap-3">
                {languages.map((language) => (
                  <div key={language.name}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-foreground">
                        {language.name}
                      </span>
                      <span className="font-mono text-xs text-muted">
                        {language.percentage}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${language.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">{t("notAvailable")}</p>
            )}
          </Card>
        </aside>

        <article className="min-w-0 rounded-[6px] border border-border bg-surface/72 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <h2 className="text-xl font-semibold text-foreground">
              {markdownContent.source === "description"
                ? t("overview")
                : t("readme")}
            </h2>
            <span className="font-mono text-xs uppercase tracking-normal text-muted">
              {t(`sources.${markdownContent.source}`)}
            </span>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">
            {t("originalLanguageNote")}
          </p>

          {markdownContent.markdown ? (
            <SafeMarkdown
              markdown={markdownContent.markdown}
              repo={project.slug}
              branch={project.defaultBranch}
              currentPath={markdownContent.path}
            />
          ) : (
            <p className="mt-5 leading-7 text-muted">{t("noReadme")}</p>
          )}
        </article>
      </section>
    </Container>
  );
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <dt className="font-mono text-xs uppercase tracking-normal text-muted">
        {label}
      </dt>
      <dd className="break-words text-foreground">{children}</dd>
    </div>
  );
}

function ProjectCover({
  name,
  language,
}: {
  name: string;
  language: string | null;
}) {
  const initials = name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="relative min-h-72 overflow-hidden rounded-[6px] border border-border bg-background">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30" />
      <div className="absolute inset-5 rounded-[6px] border border-border bg-surface/70" />
      <div className="absolute left-8 right-8 top-10 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="absolute left-8 top-20">
        <div className="flex h-24 w-24 items-center justify-center rounded-[6px] border border-border-strong bg-accent/12 font-mono text-3xl text-foreground">
          {initials || "PR"}
        </div>
        {language ? (
          <p className="mt-4 font-mono text-xs uppercase tracking-normal text-muted">
            {language}
          </p>
        ) : null}
      </div>
      <div className="absolute inset-x-8 bottom-8 flex items-end justify-between gap-4">
        <p className="min-w-0 truncate font-mono text-[11px] uppercase tracking-normal text-muted">
          {decorativeCode(name)}
        </p>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

function decorativeCode(name: string) {
  return `/${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 22)}`;
}
