import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ProjectsUnavailableState } from "@/components/projects/projects-empty-state";
import { ProjectCard } from "@/components/sections/project-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { buildLocalizedHref } from "@/i18n/routing";
import { getFeaturedPortfolioProjects } from "@/lib/github/repositories";

type FeaturedProjectsSectionProps = {
  locale: string;
};

export async function FeaturedProjectsSection({
  locale,
}: FeaturedProjectsSectionProps) {
  const t = await getTranslations("Home.projects");
  const projectsResult = await getFeaturedPortfolioProjects();

  return (
    <section className="border-y border-border bg-surface/28 py-16 sm:py-20">
      <Container>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          action={
            <Button asChild variant="secondary">
              <Link href={buildLocalizedHref(locale, "/projects")}>
                {t("viewAll")}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        {projectsResult.ok ? (
          projectsResult.projects.length > 0 ? (
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {projectsResult.projects.map((project, index) => (
                <ProjectCard
                  key={project.slug}
                  locale={locale}
                  project={project}
                  featured={index === 0 || index === 3}
                />
              ))}
            </div>
          ) : (
            <ProjectsUnavailableState
              className="mt-10"
              message={t("emptyDescription")}
            />
          )
        ) : (
          <ProjectsUnavailableState
            className="mt-10"
            message={projectsResult.message}
          />
        )}
      </Container>
    </section>
  );
}
