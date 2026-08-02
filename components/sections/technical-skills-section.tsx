import { useTranslations } from "next-intl";
import { SkillGroup } from "@/components/sections/skill-group";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { skillGroups } from "@/data/skills";

export function TechnicalSkillsSection() {
  const t = useTranslations("Home.skills");

  return (
    <section className="border-y border-border bg-surface/20 py-16 sm:py-20">
      <Container>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {skillGroups.map((group) => (
            <SkillGroup
              key={group.key}
              group={group}
              title={t(`groups.${group.key}`)}
              items={group.items.map((item) => t(`items.${group.key}.${item}`))}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
