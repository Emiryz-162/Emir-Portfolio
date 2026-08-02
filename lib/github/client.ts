import { githubConfig } from "@/config/github";
import { GitHubApiError } from "@/lib/github/errors";

type GitHubFetchOptions = {
  accept?: string;
  revalidate?: number;
};

export async function githubFetch<T>(
  path: string,
  options: GitHubFetchOptions = {},
) {
  const response = await fetch(`${githubConfig.apiBaseUrl}${path}`, {
    headers: getGitHubHeaders(options.accept),
    next: {
      revalidate: options.revalidate ?? githubConfig.revalidateSeconds,
    },
  });

  if (!response.ok) {
    throw new GitHubApiError(
      `GitHub request failed with status ${response.status}`,
      response.status,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export async function githubFetchNullable<T>(
  path: string,
  options: GitHubFetchOptions = {},
) {
  try {
    return await githubFetch<T>(path, options);
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

function getGitHubHeaders(accept?: string) {
  const headers: Record<string, string> = {
    Accept: accept ?? "application/vnd.github+json",
    "X-GitHub-Api-Version": githubConfig.apiVersion,
    "User-Agent": githubConfig.userAgent,
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}
