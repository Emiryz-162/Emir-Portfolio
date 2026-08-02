export type ProjectStatus = "draft" | "published";

export type ProjectSummary = {
  slug: string;
  titleKey: string;
  descriptionKey: string;
  coverKey: "api" | "web" | "game" | "portfolio";
  technologies: string[];
  status: ProjectStatus;
};
