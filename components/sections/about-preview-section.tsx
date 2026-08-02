import { useTranslations } from "next-intl";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusDot } from "@/components/ui/status-dot";
import { buildLocalizedHref } from "@/i18n/routing";

type AboutPreviewSectionProps = {
  locale: string;
};

export function AboutPreviewSection({ locale }: AboutPreviewSectionProps) {
  const t = useTranslations("Home.about");

  const facts = [
    { label: t("facts.location.label"), value: t("facts.location.value") },
    { label: t("facts.focus.label"), value: t("facts.focus.value") },
    {
      label: t("facts.availability.label"),
      value: t("facts.availability.value"),
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="relative min-h-96 overflow-hidden rounded-[6px] border border-border bg-surface">
            <div className="absolute inset-5 border border-border bg-background/70" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-[6px] border border-border-strong bg-surface-elevated font-mono text-3xl text-foreground">
                EY
              </div>
              <p className="mt-6 max-w-xs text-sm leading-6 text-muted">
                {t("photoPlaceholder")}
              </p>
            </div>
          </div>

          <div>
            <SectionHeader
              eyebrow={t("eyebrow")}
              title={t("title")}
              description={t("description")}
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-[6px] border border-border bg-surface/72 p-4"
                >
                  <p className="font-mono text-xs uppercase tracking-normal text-muted">
                    {fact.label}
                  </p>
                  <p className="mt-3 text-sm font-medium leading-6 text-foreground">
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[6px] border border-border bg-background/52 p-5">
              <div className="mb-4 flex items-center gap-2">
                <StatusDot />
                <h3 className="text-sm font-semibold text-foreground">
                  {t("languages.title")}
                </h3>
              </div>
              <dl className="grid gap-3 sm:grid-cols-3">
                {["turkish", "english", "german"].map((key) => (
                  <div key={key}>
                    <dt className="text-sm text-muted">
                      {t(`languages.${key}.label`)}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-muted-foreground">
                      {t(`languages.${key}.value`)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <Link
              href={buildLocalizedHref(locale, "/about")}
              className="mt-7 inline-flex text-sm font-semibold text-muted-foreground transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("link")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
