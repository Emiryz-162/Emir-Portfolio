import { useTranslations } from "next-intl";
import { TechBadge } from "@/components/ui/tech-badge";
import { currentStackGroups } from "@/data/skills";

export function CurrentStackPanel() {
  const t = useTranslations("Home.hero.stack");

  return (
    <div className="rounded-[6px] border border-border bg-surface/86 p-4 shadow-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
        <span className="font-mono text-xs uppercase text-muted">
          {t("status")}
        </span>
      </div>
      <div className="mt-4 grid gap-4">
        {currentStackGroups.map((group) => (
          <div key={group.key}>
            <p className="mb-2 font-mono text-xs uppercase tracking-normal text-muted">
              {t(`groups.${group.key}`)}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <TechBadge key={item}>{item}</TechBadge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
