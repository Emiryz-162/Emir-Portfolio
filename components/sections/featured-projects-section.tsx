import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ProjectCard } from "@/components/sections/project-card";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { featuredProjects } from "@/data/projects";
import { buildLocalizedHref } from "@/i18n/routing";

type FeaturedProjectsSectionProps = {
  locale: string;
};

export function FeaturedProjectsSection({
  locale,
}: FeaturedProjectsSectionProps) {
  const t = useTranslations("Home.projects");

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
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {featuredProjects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              locale={locale}
              project={project}
              featured={index === 0 || index === 3}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
