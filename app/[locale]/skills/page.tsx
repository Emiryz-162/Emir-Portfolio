import { getTranslations, setRequestLocale } from "next-intl/server";
import { SkillGroup } from "@/components/sections/skill-group";
import { Container } from "@/components/ui/container";
import { skillGroups } from "@/data/skills";

type SkillsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SkillsPage({ params }: SkillsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("SkillsPage");

  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-normal text-accent">
          {t("eyebrow")}
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-5 text-base leading-7 text-muted">
          {t("description")}
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skillGroups.map((group) => (
          <SkillGroup
            key={group.key}
            group={group}
            title={t(`groups.${group.key}`)}
          />
        ))}
      </div>
    </Container>
  );
}
