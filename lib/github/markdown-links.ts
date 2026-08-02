import { githubConfig } from "@/config/github";

type MarkdownUrlOptions = {
  repo: string;
  branch: string;
  currentPath?: string | null;
  kind: "image" | "link";
};

export function resolveMarkdownUrl(
  value: string | undefined,
  options: MarkdownUrlOptions,
) {
  if (!value) return undefined;
  if (value.startsWith("#")) return value;

  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();

  if (lower.startsWith("javascript:") || lower.startsWith("data:")) {
    return undefined;
  }

  if (isAbsoluteUrl(trimmed) || lower.startsWith("mailto:")) {
    return trimmed;
  }

  const normalizedPath = normalizeRepositoryPath(options.currentPath, trimmed);

  if (!normalizedPath) return undefined;

  const encodedPath = normalizedPath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  if (options.kind === "image") {
    return `https://raw.githubusercontent.com/${githubConfig.username}/${options.repo}/${options.branch}/${encodedPath}`;
  }

  return `https://github.com/${githubConfig.username}/${options.repo}/blob/${options.branch}/${encodedPath}`;
}

function isAbsoluteUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeRepositoryPath(
  currentPath: string | null | undefined,
  target: string,
) {
  const baseParts = currentPath?.includes("/")
    ? currentPath.split("/").slice(0, -1)
    : [];
  const parts = [...baseParts, ...target.split("/")];
  const output: string[] = [];

  for (const part of parts) {
    if (!part || part === ".") continue;

    if (part === "..") {
      if (output.length === 0) return null;
      output.pop();
      continue;
    }

    output.push(part);
  }

  return output.join("/");
}
