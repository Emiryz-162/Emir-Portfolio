import type { ProjectSummary } from "@/types/project";

export const featuredProjects: ProjectSummary[] = [
  {
    slug: "e-commerce-api",
    titleKey: "eCommerceApi.title",
    descriptionKey: "eCommerceApi.description",
    coverKey: "api",
    technologies: ["C#", "ASP.NET Core", "RESTful API", "SQL Server"],
    status: "draft",
  },
  {
    slug: "task-management-web-app",
    titleKey: "taskManagement.title",
    descriptionKey: "taskManagement.description",
    coverKey: "web",
    technologies: ["HTML5", "CSS3", "JavaScript", "Responsive UI"],
    status: "draft",
  },
  {
    slug: "2d-game-prototype",
    titleKey: "gamePrototype.title",
    descriptionKey: "gamePrototype.description",
    coverKey: "game",
    technologies: ["Unity 2D", "Godot", "Game Design"],
    status: "draft",
  },
  {
    slug: "portfolio-website",
    titleKey: "portfolioWebsite.title",
    descriptionKey: "portfolioWebsite.description",
    coverKey: "portfolio",
    technologies: ["Next.js", "TypeScript", "TailwindCSS"],
    status: "draft",
  },
];
