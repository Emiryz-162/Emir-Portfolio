import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "NotFound" });

  return (
    <Container className="py-20 sm:py-24">
      <div className="max-w-xl">
        <p className="font-mono text-xs uppercase tracking-normal text-accent">
          {t("eyebrow")}
        </p>
        <h1 className="mt-5 text-5xl font-semibold tracking-normal text-foreground">
          {t("title")}
        </h1>
        <p className="mt-5 text-base leading-7 text-muted">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/${locale}`}>{t("homeLink")}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/${locale}/projects`}>{t("projectsLink")}</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
