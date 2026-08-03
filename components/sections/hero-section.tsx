import { ArrowRight, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { AssistantPreview } from "@/components/assistant/assistant-preview";
import { CurrentStackPanel } from "@/components/sections/current-stack-panel";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SocialButton } from "@/components/ui/social-button";
import { profile } from "@/data/profile";
import { socialLinks } from "@/data/social-links";
import { buildLocalizedHref } from "@/i18n/routing";

type HeroSectionProps = {
  locale: string;
};

export function HeroSection({ locale }: HeroSectionProps) {
  const t = useTranslations("Home.hero");

  return (
    <section className="border-b border-border">
      <Container className="grid min-h-[calc(100svh-5rem)] items-center gap-10 py-12 sm:py-16 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="max-w-4xl">
          <p className="font-mono text-xs uppercase tracking-normal text-accent">
            {t("eyebrow")}
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-normal text-foreground sm:text-6xl lg:text-7xl">
            {profile.shortName}
            <span className="ml-2 text-accent" aria-hidden="true">
              _
            </span>
          </h1>
          <p className="mt-5 text-2xl font-medium text-muted-foreground sm:text-3xl">
            {profile.role}
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            {t("description")}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href={buildLocalizedHref(locale, "/projects")}>
                {t("primaryButton")}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={buildLocalizedHref(locale, "/contact")}>
                <Mail size={16} aria-hidden="true" />
                {t("contactButton")}
              </Link>
            </Button>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <SocialButton
                key={link.key}
                label={t(`social.${link.key}`)}
                href={link.href}
                iconKey={link.key}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:pl-6">
          <CurrentStackPanel />
          <AssistantPreview />
        </div>
      </Container>
    </section>
  );
}
