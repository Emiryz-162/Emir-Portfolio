export class GitHubApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export function getGitHubErrorMessage(error: unknown) {
  if (error instanceof GitHubApiError) {
    if (error.status === 403 || error.status === 429) {
      return "GitHub rate limit reached. Projects are temporarily unavailable.";
    }

    if (error.status && error.status >= 500) {
      return "GitHub is temporarily unavailable. Please try again later.";
    }
  }

  return "Projects are temporarily unavailable.";
}
