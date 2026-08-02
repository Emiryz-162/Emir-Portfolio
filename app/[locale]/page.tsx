import { setRequestLocale } from "next-intl/server";
import { HomePageContent } from "@/components/sections/home-page";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomePageContent locale={locale} />;
}
