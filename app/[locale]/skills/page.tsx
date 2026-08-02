import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage } from "@/components/sections/placeholder-page";

type SkillsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SkillsPage({ params }: SkillsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      eyebrow="Skills"
      title="Capability map"
      description="A structured area for future frontend, backend, game development, game design, and IT skills."
    />
  );
}
