import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage } from "@/components/sections/placeholder-page";

type EducationPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function EducationPage({ params }: EducationPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      eyebrow="Education"
      title="Learning record"
      description="A clean foundation for formal education, certifications, and selected milestones."
    />
  );
}
