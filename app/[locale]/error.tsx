"use client";

import { RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

type LocaleErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  const locale = useLocale();
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <Container className="py-20 sm:py-24">
      <div className="max-w-xl">
        <p className="font-mono text-xs uppercase tracking-normal text-accent">
          {t("eyebrow")}
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-5 text-base leading-7 text-muted">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button type="button" onClick={reset}>
            <RotateCcw size={16} aria-hidden="true" />
            {t("retry")}
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/${locale}`}>{t("homeLink")}</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
