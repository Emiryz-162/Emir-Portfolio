import { ArrowUpRight, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { GitHubMark } from "@/components/icons/brand-icons";
import { Card } from "@/components/ui/card";
import { TechBadge } from "@/components/ui/tech-badge";
import { buildLocalizedHref } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import type { PortfolioProject } from "@/types/github";

type ProjectCardProps = {
  locale: string;
  project: PortfolioProject;
  featured?: boolean;
};

export async function ProjectCard({
  locale,
  project,
  featured = false,
}: ProjectCardProps) {
  const t = await getTranslations("Projects");

  return (
    <Card
      className={cn(
        "group overflow-hidden hover:-translate-y-1",
        featured && "lg:min-h-[29rem]",
      )}
    >
      <div className="grid h-full md:grid-cols-[0.86fr_1.14fr] lg:grid-cols-1">
        <ProjectCover project={project} />
        <div className="flex min-w-0 flex-col justify-between p-5 sm:p-6">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {project.primaryLanguage ? (
                  <TechBadge>{project.primaryLanguage}</TechBadge>
                ) : null}
              </div>
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] border border-border text-muted-foreground transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t("card.githubAria", { name: project.name })}
              >
                <GitHubMark size={16} aria-hidden="true" />
              </a>
            </div>

            <h3 className="mt-5 break-words text-2xl font-semibold tracking-normal text-foreground">
              {project.name}
            </h3>
            <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-6 text-muted">
              {project.description ?? t("card.noDescription")}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {project.liveDemoUrl ? (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border border-accent bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition duration-200 hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t("card.liveDemoAria", { name: project.name })}
              >
                {t("card.liveDemo")}
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            ) : null}
            <Link
              href={buildLocalizedHref(locale, `/projects/${project.slug}`)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("card.detail")}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ProjectCover({ project }: { project: PortfolioProject }) {
  const initials = project.name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="relative min-h-56 overflow-hidden border-b border-border bg-background md:border-b-0 md:border-r lg:border-b lg:border-r-0">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
      <div className="absolute inset-5 rounded-[6px] border border-border bg-surface/68" />
      <span className="absolute right-8 top-8 h-2 w-2 rounded-full bg-accent" />
      <div className="absolute inset-x-8 bottom-8 flex items-end justify-between gap-4">
        <p className="min-w-0 truncate font-mono text-[11px] uppercase tracking-normal text-muted">
          {decorativeCode(project.name)}
        </p>
        <span className="h-px flex-1 bg-border" />
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

function decorativeCode(name: string) {
  return `/${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 18)}`;
}
