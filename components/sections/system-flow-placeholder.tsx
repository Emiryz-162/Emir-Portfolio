import { useTranslations } from "next-intl";
import { StatusDot } from "@/components/ui/status-dot";

const flowSteps = ["client", "frontend", "api", "database", "deploy"] as const;

export function SystemFlowPlaceholder() {
  const t = useTranslations("Home.hero.systemFlow");

  return (
    <div className="rounded-[6px] border border-border bg-surface/72 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
        <StatusDot />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-5">
        {flowSteps.map((step, index) => (
          <div key={step} className="flex items-center gap-3 sm:block">
            <div className="flex min-h-16 flex-1 items-center justify-center rounded-[6px] border border-border bg-background px-3 text-center font-mono text-xs uppercase text-muted-foreground">
              {t(`steps.${step}`)}
            </div>
            {index < flowSteps.length - 1 ? (
              <div
                className="h-px w-6 bg-border-strong sm:mx-auto sm:my-3 sm:h-6 sm:w-px"
                aria-hidden="true"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
