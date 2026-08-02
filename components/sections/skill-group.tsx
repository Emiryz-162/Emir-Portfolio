import { TechBadge } from "@/components/ui/tech-badge";
import type { SkillGroup as SkillGroupType } from "@/types/skill";

type SkillGroupProps = {
  title: string;
  group: SkillGroupType;
  items?: string[];
};

export function SkillGroup({
  title,
  group,
  items = group.items,
}: SkillGroupProps) {
  return (
    <div className="rounded-[6px] border border-border bg-surface/72 p-5">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item) => (
          <TechBadge key={item}>{item}</TechBadge>
        ))}
      </div>
    </div>
  );
}
