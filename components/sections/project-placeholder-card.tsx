import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buildLocalizedHref } from "@/i18n/routing";

type ProjectPlaceholderCardProps = {
  locale: string;
  project: {
    slug: string;
    title: string;
    description: string;
  };
};

export function ProjectPlaceholderCard({
  locale,
  project,
}: ProjectPlaceholderCardProps) {
  return (
    <Card asChild>
      <Link
        href={buildLocalizedHref(locale, `/projects/${project.slug}`)}
        className="group flex min-h-56 flex-col justify-between p-5"
      >
        <div>
          <p className="font-mono text-xs uppercase tracking-normal text-accent">
            Draft
          </p>
          <h2 className="mt-5 text-xl font-semibold text-foreground">
            {project.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            {project.description}
          </p>
        </div>
        <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted-strong transition group-hover:text-accent">
          Open
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </Link>
    </Card>
  );
}
