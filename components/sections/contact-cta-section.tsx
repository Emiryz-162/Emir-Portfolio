import { useTranslations } from "next-intl";
import Link from "next/link";
import { LinkedInMark } from "@/components/icons/brand-icons";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { socialLinks } from "@/data/social-links";
import { buildLocalizedHref } from "@/i18n/routing";

type ContactCtaSectionProps = {
  locale: string;
};

export function ContactCtaSection({ locale }: ContactCtaSectionProps) {
  const t = useTranslations("Home.contactCta");
  const linkedIn = socialLinks.find((link) => link.key === "linkedin");

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="rounded-[6px] border border-border-strong bg-foreground px-5 py-10 text-background sm:px-8 lg:px-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-normal opacity-70">
                {t("eyebrow")}
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-normal sm:text-4xl">
                {t("title")}
              </h2>
              <p className="mt-4 text-base opacity-75">{t("description")}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="border-background bg-background text-foreground"
              >
                <Link href={buildLocalizedHref(locale, "/contact")}>
                  {t("contactButton")}
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="border-background/30 bg-transparent text-background hover:bg-background/10"
              >
                <a
                  href={linkedIn?.href ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedInMark size={16} aria-hidden="true" />
                  {t("linkedinButton")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
