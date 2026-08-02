import { setRequestLocale } from "next-intl/server";
import { PlaceholderPage } from "@/components/sections/placeholder-page";

type ProjectDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return (
    <PlaceholderPage
      eyebrow="Project Detail"
      title={slug
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")}
      description="A dynamic project detail route prepared for richer case studies."
    />
  );
}
