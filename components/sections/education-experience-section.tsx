import { useTranslations } from "next-intl";
import { TimelineItem } from "@/components/sections/timeline-item";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { timelineEntries } from "@/data/experience";

export function EducationExperienceSection() {
  const t = useTranslations("Home.timeline");

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {timelineEntries.map((entry, index) => (
            <TimelineItem
              key={entry.key}
              label={t(`labels.${entry.key}`)}
              title={t(`items.${entry.key}.title`)}
              organization={t(`items.${entry.key}.organization`)}
              meta={t(`items.${entry.key}.meta`)}
              index={index + 1}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
