import type { Locale } from "@/i18n/routing";
import type { PortfolioCategory } from "@/types/github";

export type AssistantProfile = {
  fullName: string;
  shortName: string;
  role: string;
  location: string;
  summary: string;
  target: string;
  languages: {
    name: string;
    level: string;
  }[];
  links: {
    key: string;
    href: string;
  }[];
};

export type AssistantSkillGroup = {
  key: string;
  label: string;
  items: string[];
};

export type AssistantEducation = {
  key: string;
  title: string;
  organization: string;
  meta: string;
  details: string[];
  status: "completed" | "in-progress" | "unknown";
};

export type AssistantExperience = {
  key: string;
  title: string;
  organization: string;
  meta: string;
  details: string[];
};

export type AssistantProjectSummary = {
  slug: string;
  name: string;
  description: string | null;
  primaryLanguage: string | null;
  liveDemoUrl: string | null;
  githubUrl: string;
  category: PortfolioCategory;
  technologies: string[];
  topics: string[];
};

export type AssistantProjectContext = {
  slug: string;
  name: string;
  source: "portfolio" | "readme" | "description";
  path: string | null;
  content: string;
};

export type AssistantKnowledgeBase = {
  locale: Locale;
  profile: AssistantProfile;
  skills: AssistantSkillGroup[];
  education: AssistantEducation[];
  experience: AssistantExperience[];
  projects: AssistantProjectSummary[];
  githubContextUnavailable: boolean;
};

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantRequest = {
  message: string;
  locale: Locale;
  history: AssistantMessage[];
};

export type AssistantResponse = {
  answer: string;
  relatedProjects: {
    slug: string;
    name: string;
  }[];
};
