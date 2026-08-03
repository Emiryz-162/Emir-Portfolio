import { portfolioTopics } from "@/config/github";
import { profile } from "@/data/profile";
import { skillGroups } from "@/data/skills";
import { socialLinks } from "@/data/social-links";
import { timelineEntries } from "@/data/experience";
import { assistantBackground } from "@/data/assistant-background";
import { getPortfolioProjects } from "@/lib/github/repositories";
import {
  getAssistantMessageBundle,
  getMessageString,
  getMessageStringArray,
} from "@/lib/ai/knowledge/messages";
import type { Locale } from "@/i18n/routing";
import type {
  AssistantEducation,
  AssistantExperience,
  AssistantKnowledgeBase,
  AssistantProjectSummary,
} from "@/types/assistant";
import type { PortfolioProject } from "@/types/github";

const privateTopicPrefixes = ["portfolio-"];

export async function buildPortfolioKnowledge(
  locale: Locale,
): Promise<AssistantKnowledgeBase> {
  const bundle = getAssistantMessageBundle(locale);
  const projectsResult = await getPortfolioProjects();
  const timeline = timelineEntries.map((entry) => ({
    key: entry.key,
    title: getMessageString(bundle, `EducationPage.items.${entry.key}.title`),
    organization: getMessageString(
      bundle,
      `EducationPage.items.${entry.key}.organization`,
    ),
    meta: getMessageString(bundle, `EducationPage.items.${entry.key}.meta`),
    details: getMessageStringArray(
      bundle,
      `EducationPage.items.${entry.key}.details`,
    ),
  }));

  return {
    locale,
    profile: {
      fullName: profile.fullName,
      shortName: profile.shortName,
      role: profile.role,
      location: profile.location,
      summary: getMessageString(
        bundle,
        "AboutPage.introduction.paragraphs.0",
        getMessageString(bundle, "Home.hero.description"),
      ),
      target: getMessageString(bundle, "AboutPage.goal.description"),
      languages: profile.languages.map((language) => ({
        name:
          getMessageString(
            bundle,
            `Home.about.languages.items.${language.key}.name`,
          ) || language.name,
        level:
          getMessageString(
            bundle,
            `Home.about.languages.items.${language.key}.level`,
          ) || language.level,
      })),
      links: socialLinks.map((link) => ({
        key: link.key,
        href: link.href,
      })),
    },
    skills: skillGroups.map((group) => ({
      key: group.key,
      label: getMessageString(
        bundle,
        `SkillsPage.groups.${group.key}`,
        group.key,
      ),
      items: group.items.map((item) =>
        getMessageString(bundle, `SkillsPage.items.${group.key}.${item}`, item),
      ),
    })),
    education: timeline
      .filter((entry) => entry.key !== "experience")
      .map((entry): AssistantEducation => ({
        ...entry,
        status: entry.key === "graphicDesign" ? "in-progress" : "completed",
      })),
    experience: timeline
      .filter((entry) => entry.key === "experience")
      .map((entry): AssistantExperience => entry),
    background: assistantBackground,
    projects: projectsResult.projects.map(mapProjectForAssistant),
    githubContextUnavailable: !projectsResult.ok,
  };
}

export function mapProjectForAssistant(
  project: PortfolioProject,
): AssistantProjectSummary {
  return {
    slug: project.slug,
    name: project.name,
    description: project.description,
    primaryLanguage: project.primaryLanguage,
    liveDemoUrl: project.liveDemoUrl,
    githubUrl: project.githubUrl,
    category: project.category,
    technologies: getPublicTechnologies(project.topics),
    topics: project.topics.filter(isPublicTopic),
  };
}

export function isPublicTopic(topic: string) {
  const normalized = topic.toLowerCase();
  return !privateTopicPrefixes.some((prefix) => normalized.startsWith(prefix));
}

function getPublicTechnologies(topics: string[]) {
  const technologies = topics
    .filter(isPublicTopic)
    .filter((topic) => topic !== portfolioTopics.hidden)
    .map((topic) => topic.replace(/-/g, " "));

  return [...new Set(technologies)];
}
