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
  source: "portfolio" | "readme" | "description" | "historical";
  path: string | null;
  content: string;
};

export type AssistantBackgroundEducation = {
  key: string;
  institution: string;
  program: string;
  period: string | null;
  status: "completed" | "in-progress";
  notes: string[];
};

export type AssistantHistoricalProject = {
  key: string;
  name: string;
  aliases: string[];
  category: string;
  summary: string;
  technologies: string[];
  notes: string[];
  githubProjectAliases?: string[];
  publicRepositoryAvailable: boolean | "unknown";
  publicDemoAvailable: boolean | "unknown";
};

export type AssistantAchievement = {
  key: string;
  title: string;
  year: number;
  result: string;
  category: string;
  notes: string[];
};

export type AssistantBackground = {
  educationBackground: AssistantBackgroundEducation[];
  earlyTechnicalExperience: string[];
  historicalProjects: AssistantHistoricalProject[];
  gameDevelopmentBackground: string[];
  achievements: AssistantAchievement[];
  professionalTraining: {
    key: string;
    provider: string;
    summary: string;
    hours: number;
    technologies: string[];
    guardrails: string[];
  }[];
  technicalPreferences: {
    main: string[];
    additional: string[];
  };
  workPreferences: string[];
  professionalPositioning: string[];
  sourcePriority: string[];
};

export type AssistantKnowledgeBase = {
  locale: Locale;
  profile: AssistantProfile;
  skills: AssistantSkillGroup[];
  education: AssistantEducation[];
  experience: AssistantExperience[];
  background: AssistantBackground;
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
