import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusDot } from "@/components/ui/status-dot";
import { TechBadge } from "@/components/ui/tech-badge";
import { profile } from "@/data/profile";
import { getLocalizedAlternates, getMetadataBase } from "@/lib/metadata";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: getMetadataBase(),
    title: t("about.title"),
    description: t("about.description"),
    alternates: getLocalizedAlternates("/about"),
  };
}

const focusKeys = [
  "fullStack",
  "frontend",
  "backend",
  "apis",
  "database",
  "responsive",
] as const;

const interestKeys = [
  "gameDevelopment",
  "gameDesign",
  "unity",
  "godot",
  "it",
] as const;

const workKeys = [
  "problemSolving",
  "algorithmicThinking",
  "teamwork",
  "discipline",
  "learning",
] as const;

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AboutPage");
  const paragraphs = t.raw("introduction.paragraphs") as string[];

  return (
    <Container className="py-12 sm:py-16">
      <section className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="sticky top-28 rounded-[6px] border border-border bg-surface/82 p-5">
          <div className="flex h-28 w-28 items-center justify-center rounded-[6px] border border-border-strong bg-surface-elevated font-mono text-4xl text-foreground">
            {profile.initials}
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            {profile.shortName}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{profile.role}</p>
          <div className="mt-6 grid gap-3 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <StatusDot />
              {t("status")}
            </p>
            <p className="text-muted">{profile.location}</p>
          </div>
        </div>

        <div className="space-y-14">
          <section>
            <p className="font-mono text-xs uppercase tracking-normal text-accent">
              {t("introduction.eyebrow")}
            </p>
            <div className="mt-5 space-y-5 text-base leading-8 text-muted-foreground">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <AboutList
            eyebrow={t("focus.eyebrow")}
            title={t("focus.title")}
            items={focusKeys.map((key) => t(`focus.items.${key}`))}
          />
          <AboutList
            eyebrow={t("interests.eyebrow")}
            title={t("interests.title")}
            items={interestKeys.map((key) => t(`interests.items.${key}`))}
          />
          <AboutList
            eyebrow={t("work.eyebrow")}
            title={t("work.title")}
            items={workKeys.map((key) => t(`work.items.${key}`))}
          />

          <section className="rounded-[6px] border border-border bg-surface/72 p-6">
            <SectionHeader
              eyebrow={t("goal.eyebrow")}
              title={t("goal.title")}
              description={t("goal.description")}
            />
          </section>
        </div>
      </section>
    </Container>
  );
}

function AboutList({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: string[];
}) {
  return (
    <section>
      <p className="font-mono text-xs uppercase tracking-normal text-accent">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-normal text-foreground">
        {title}
      </h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item) => (
          <TechBadge key={item}>{item}</TechBadge>
        ))}
      </div>
    </section>
  );
}
