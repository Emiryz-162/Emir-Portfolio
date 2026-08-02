import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { TechBadge } from "@/components/ui/tech-badge";
import { createPageMetadata } from "@/lib/metadata";

type EducationPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: EducationPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return createPageMetadata({
    title: t("education.title"),
    description: t("education.description"),
    pathname: "/education",
    locale,
  });
}

const educationKeys = ["education", "certification", "experience"] as const;

export default async function EducationPage({ params }: EducationPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("EducationPage");

  return (
    <Container className="py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-normal text-accent">
          {t("eyebrow")}
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-5 text-base leading-7 text-muted">
          {t("description")}
        </p>
      </div>

      <div className="mt-10 grid gap-5">
        {educationKeys.map((key) => (
          <RecordPanel
            key={key}
            label={t(`items.${key}.label`)}
            title={t(`items.${key}.title`)}
            organization={t(`items.${key}.organization`)}
            meta={t(`items.${key}.meta`)}
            details={t.raw(`items.${key}.details`) as string[]}
            technologies={
              key === "certification"
                ? (t.raw("items.certification.technologies") as string[])
                : undefined
            }
          />
        ))}
      </div>
    </Container>
  );
}

function RecordPanel({
  label,
  title,
  organization,
  meta,
  details,
  technologies,
}: {
  label: string;
  title: string;
  organization: string;
  meta: string;
  details: string[];
  technologies?: string[];
}) {
  return (
    <article className="rounded-[6px] border border-border bg-surface/72 p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[0.3fr_0.7fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-normal text-accent">
            {label}
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-normal text-muted">
            {meta}
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-base text-muted-foreground">{organization}</p>
          <ul className="mt-5 grid gap-3 text-sm leading-6 text-muted">
            {details.map((detail) => (
              <li key={detail} className="border-l border-border pl-4">
                {detail}
              </li>
            ))}
          </ul>
          {technologies ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {technologies.map((technology) => (
                <TechBadge key={technology}>{technology}</TechBadge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
