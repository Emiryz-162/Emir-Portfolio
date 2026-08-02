import { githubConfig } from "@/config/github";
import { githubFetchNullable } from "@/lib/github/client";
import { calculateLanguagePercentages } from "@/lib/github/mapping";
import type { GitHubLanguageMap } from "@/types/github";

export async function getGitHubRepositoryLanguages(slug: string) {
  try {
    const languages = await githubFetchNullable<GitHubLanguageMap>(
      `/repos/${githubConfig.username}/${encodeURIComponent(slug)}/languages`,
    );

    return calculateLanguagePercentages(languages ?? {});
  } catch (error) {
    console.error(
      error instanceof Error
        ? `[github] Languages request failed: ${error.message}`
        : "[github] Languages request failed",
    );
    return [];
  }
}
