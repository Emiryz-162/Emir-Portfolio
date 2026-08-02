import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage } from "@/components/sections/placeholder-page";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      eyebrow="About"
      title="Profile architecture"
      description="A reserved space for a concise, personal developer story."
    />
  );
}
