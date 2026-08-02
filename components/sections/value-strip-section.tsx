import { Code2, Lightbulb, Palette, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { ValueItem } from "@/components/sections/value-item";
import { Container } from "@/components/ui/container";

const values = [
  { key: "problemSolver", icon: Lightbulb },
  { key: "alwaysLearning", icon: Code2 },
  { key: "teamPlayer", icon: Users },
  { key: "creativeDeveloper", icon: Palette },
] as const;

export function ValueStripSection() {
  const t = useTranslations("Home.valueStrip");

  return (
    <section className="py-10 sm:py-12">
      <Container>
        <div className="grid gap-0 divide-y divide-border border-y border-border md:grid-cols-4 md:divide-x md:divide-y-0">
          {values.map((value) => (
            <ValueItem
              key={value.key}
              icon={value.icon}
              title={t(`items.${value.key}.title`)}
              description={t(`items.${value.key}.description`)}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
