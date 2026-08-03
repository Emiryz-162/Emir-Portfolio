"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { buildLocalizedHref } from "@/i18n/routing";

type RelatedProject = {
  slug: string;
  name: string;
};

type RelatedProjectsProps = {
  locale: string;
  projects: RelatedProject[];
  onNavigate?: () => void;
};

export function RelatedProjects({
  locale,
  projects,
  onNavigate,
}: RelatedProjectsProps) {
  const t = useTranslations("Assistant.relatedProjects");

  if (projects.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="font-mono text-[11px] uppercase tracking-normal text-muted">
        {t("title")}
      </p>
      <div className="mt-2 grid gap-2">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={buildLocalizedHref(
              locale,
              `/projects/${encodeURIComponent(project.slug)}`,
            )}
            onClick={onNavigate}
            className="flex min-w-0 items-center justify-between gap-3 rounded-[6px] border border-border bg-background px-3 py-2 text-sm text-foreground transition hover:border-border-strong hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="min-w-0 truncate">{project.name}</span>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-accent">
              {t("view")}
              <ArrowUpRight size={13} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
