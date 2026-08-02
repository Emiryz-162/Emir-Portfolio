import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { HomePageContent } from "@/components/sections/home-page";
import { createPageMetadata } from "@/lib/metadata";
import { getHomeStructuredData } from "@/lib/seo/structured-data";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return createPageMetadata({
    title: t("home.title"),
    description: t("home.description"),
    pathname: "/",
    locale,
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getHomeStructuredData()),
        }}
      />
      <HomePageContent locale={locale} />
    </>
  );
}
