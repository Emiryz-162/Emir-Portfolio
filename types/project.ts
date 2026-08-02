export type ProjectStatus = "draft" | "published";

export type ProjectSummary = {
  slug: string;
  title: string;
  description: string;
  status: ProjectStatus;
};
