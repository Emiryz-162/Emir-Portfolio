import { PagePreviewCard } from "@/components/sections/page-preview-card";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { buildLocalizedHref } from "@/i18n/routing";

const sections = [
  {
    href: "/en/about",
    label: "About",
    description:
      "Reserved for a personal profile without generic template copy.",
  },
  {
    href: "/en/skills",
    label: "Skills",
    description:
      "Prepared for multiple application paths and technical focus areas.",
  },
  {
    href: "/en/education",
    label: "Education",
    description: "A future home for academic background and certifications.",
  },
];

type SectionPreviewGridProps = {
  locale: string;
};

export function SectionPreviewGrid({ locale }: SectionPreviewGridProps) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Heading
          eyebrow="Foundation"
          title="Built for the next stages"
          description="The first version keeps the surface quiet while leaving clear places for API data, multilingual copy, chatbot logic, animation, and a mini game later."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {sections.map((section) => (
            <PagePreviewCard
              key={section.href}
              {...section}
              href={buildLocalizedHref(locale, section.href)}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
