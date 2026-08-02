import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { ProjectPlaceholderCard } from "@/components/sections/project-placeholder-card";

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

const placeholderProjects = [
  {
    slug: "portfolio-platform",
    title: "Portfolio Platform",
    description: "Placeholder route for the future portfolio case study.",
  },
  {
    slug: "developer-tooling",
    title: "Developer Tooling",
    description: "Placeholder route for future full stack work.",
  },
  {
    slug: "game-systems",
    title: "Game Systems",
    description: "Placeholder route for future game development work.",
  },
];

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Container className="py-12 sm:py-16">
      <Heading
        eyebrow="Projects"
        title="Selected work framework"
        description="A flexible project index that can later connect to GitHub data, manual case studies, or a mixed content source."
      />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {placeholderProjects.map((project) => (
          <ProjectPlaceholderCard
            key={project.slug}
            locale={locale}
            project={project}
          />
        ))}
      </div>
    </Container>
  );
}
