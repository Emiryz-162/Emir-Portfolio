import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPortfolioProjects } from "@/lib/github/repositories";
import { getSiteUrl } from "@/lib/metadata";

const staticPaths = [
  "/",
  "/about",
  "/skills",
  "/education",
  "/contact",
  "/projects",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return [];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({
        url: localizedUrl(siteUrl, locale, path),
        lastModified: new Date(),
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : 0.7,
      });
    }
  }

  try {
    const projectsResult = await getPortfolioProjects();
    if (projectsResult.ok) {
      for (const locale of routing.locales) {
        for (const project of projectsResult.projects) {
          entries.push({
            url: localizedUrl(siteUrl, locale, `/projects/${project.slug}`),
            lastModified: new Date(project.updatedAt),
            changeFrequency: "monthly",
            priority: 0.6,
          });
        }
      }
    }
  } catch {
    // Static portfolio pages remain indexable if GitHub is temporarily unavailable.
  }

  return entries;
}

function localizedUrl(siteUrl: URL, locale: string, pathname: string) {
  const url = new URL(siteUrl);
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return url.toString();
}
