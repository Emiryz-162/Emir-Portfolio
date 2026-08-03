import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/contact-form";
import { GitHubMark, LinkedInMark } from "@/components/icons/brand-icons";
import { Container } from "@/components/ui/container";
import { profile } from "@/data/profile";
import { getContactEnv } from "@/lib/contact/env";
import { createPageMetadata } from "@/lib/metadata";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return createPageMetadata({
    title: t("contact.title"),
    description: t("contact.description"),
    pathname: "/contact",
    locale,
  });
}

const contactItems = [
  {
    key: "email",
    href: `mailto:${profile.email}`,
    value: profile.email,
    icon: Mail,
    external: false,
  },
  {
    key: "linkedin",
    href: profile.linkedInUrl,
    value: profile.linkedInUrl,
    icon: LinkedInMark,
    external: true,
  },
  {
    key: "github",
    href: profile.githubUrl,
    value: profile.githubUrl,
    icon: GitHubMark,
    external: true,
  },
] as const;

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ContactPage");
  const isContactFormAvailable = getContactEnv().ok;

  return (
    <Container className="py-12 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <section>
          <p className="font-mono text-xs uppercase tracking-normal text-accent">
            {t("eyebrow")}
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted">
            {t("description")}
          </p>

          <div className="mt-8 grid gap-4">
            {contactItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.key}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="group min-w-0 rounded-[6px] border border-border bg-surface/72 p-5 transition hover:-translate-y-1 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={t(`items.${item.key}.aria`)}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-border bg-background text-accent">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <h2 className="mt-6 text-lg font-semibold text-foreground">
                    {t(`items.${item.key}.label`)}
                  </h2>
                  <p className="mt-3 break-words text-sm leading-6 text-muted">
                    {item.value}
                  </p>
                </a>
              );
            })}
          </div>
        </section>

        <ContactForm
          locale={locale}
          email={profile.email}
          isAvailable={isContactFormAvailable}
        />
      </div>
    </Container>
  );
}
