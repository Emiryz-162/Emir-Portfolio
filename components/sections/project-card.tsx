import { ArrowUpRight, Code2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { TechBadge } from "@/components/ui/tech-badge";
import { buildLocalizedHref } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import type { ProjectSummary } from "@/types/project";

type ProjectCardProps = {
  locale: string;
  project: ProjectSummary;
  featured?: boolean;
};

export function ProjectCard({
  locale,
  project,
  featured = false,
}: ProjectCardProps) {
  const t = useTranslations("Home.projects");

  return (
    <Card
      className={cn(
        "group overflow-hidden hover:-translate-y-1",
        featured && "lg:min-h-[30rem]",
      )}
    >
      <div className="grid h-full md:grid-cols-[0.9fr_1.1fr] lg:grid-cols-1">
        <div className="relative min-h-56 overflow-hidden border-b border-border bg-background md:border-b-0 md:border-r lg:border-b lg:border-r-0">
          <ProjectCover variant={project.coverKey} />
        </div>
        <div className="flex flex-col justify-between p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xs uppercase tracking-normal text-accent">
                {t("placeholderLabel")}
              </p>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-border text-muted-foreground transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t("githubAria")}
              >
                <Code2 size={16} aria-hidden="true" />
              </a>
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-normal text-foreground">
              {t(`items.${project.titleKey}`)}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
              {t(`items.${project.descriptionKey}`)}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.technologies.map((technology) => (
                <TechBadge key={technology}>{technology}</TechBadge>
              ))}
            </div>
          </div>
          <Link
            href={buildLocalizedHref(locale, `/projects/${project.slug}`)}
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("detailLink")}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

function ProjectCover({ variant }: { variant: ProjectSummary["coverKey"] }) {
  const positions: Record<ProjectSummary["coverKey"], string> = {
    api: "left-7 top-7",
    web: "right-7 top-10",
    game: "left-10 bottom-8",
    portfolio: "right-10 bottom-10",
  };

  return (
    <div className="absolute inset-0 transition duration-300 group-hover:scale-[1.015]">
      <div className="absolute inset-5 rounded-[6px] border border-border bg-surface/70" />
      <div className="absolute left-8 right-8 top-10 h-2 bg-surface-muted" />
      <div className="absolute bottom-8 left-8 right-8 grid grid-cols-4 gap-2">
        <span className="h-10 rounded-[4px] bg-surface-muted" />
        <span className="h-10 rounded-[4px] bg-border-strong" />
        <span className="h-10 rounded-[4px] bg-surface-muted" />
        <span className="h-10 rounded-[4px] bg-surface-elevated" />
      </div>
      <span
        className={cn(
          "absolute h-14 w-14 rounded-[6px] border border-border-strong bg-accent/14",
          positions[variant],
        )}
      />
    </div>
  );
}
