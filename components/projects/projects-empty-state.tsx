import { GitHubMark } from "@/components/icons/brand-icons";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { profile } from "@/data/profile";
import { cn } from "@/lib/cn";

type ProjectsEmptyStateProps = {
  className?: string;
  message?: string;
};

export async function ProjectsUnavailableState({
  className,
  message,
}: ProjectsEmptyStateProps) {
  const t = await getTranslations("Projects");

  return (
    <div
      className={cn(
        "rounded-[6px] border border-border bg-surface/72 p-6",
        className,
      )}
    >
      <h2 className="text-xl font-semibold text-foreground">
        {t("error.title")}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted">
        {message ?? t("error.description")}
      </p>
      <Button asChild className="mt-6" variant="secondary">
        <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
          <GitHubMark size={16} aria-hidden="true" />
          {t("viewGitHubProfile")}
        </a>
      </Button>
    </div>
  );
}
