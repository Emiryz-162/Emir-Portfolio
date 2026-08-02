import { githubConfig } from "@/config/github";
import { githubFetchNullable } from "@/lib/github/client";
import type { GitHubMarkdownContent } from "@/types/github";

const rawAccept = "application/vnd.github.raw";

export async function getGitHubReadme(slug: string) {
  return githubFetchNullable<string>(
    `/repos/${githubConfig.username}/${encodeURIComponent(slug)}/readme`,
    { accept: rawAccept },
  );
}

export async function getGitHubPortfolioMarkdown(slug: string) {
  return githubFetchNullable<string>(
    `/repos/${githubConfig.username}/${encodeURIComponent(slug)}/contents/portfolio.md`,
    { accept: rawAccept },
  );
}

export async function getProjectMarkdownContent(
  slug: string,
  description: string | null,
): Promise<GitHubMarkdownContent> {
  const portfolioMarkdown = await safeMarkdownRequest(() =>
    getGitHubPortfolioMarkdown(slug),
  );

  if (portfolioMarkdown) {
    return {
      source: "portfolio",
      markdown: portfolioMarkdown,
      path: "portfolio.md",
    };
  }

  const readme = await safeMarkdownRequest(() => getGitHubReadme(slug));

  if (readme) {
    return {
      source: "readme",
      markdown: readme,
      path: "README.md",
    };
  }

  return {
    source: "description",
    markdown: description ?? "",
    path: null,
  };
}

async function safeMarkdownRequest(request: () => Promise<string | null>) {
  try {
    return await request();
  } catch (error) {
    console.error(
      error instanceof Error
        ? `[github] Markdown request failed: ${error.message}`
        : "[github] Markdown request failed",
    );
    return null;
  }
}
