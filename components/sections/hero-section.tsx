import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { buildLocalizedHref } from "@/i18n/routing";

type HeroSectionProps = {
  locale: string;
};

export function HeroSection({ locale }: HeroSectionProps) {
  return (
    <section className="min-h-[calc(100svh-5rem)] border-b border-border">
      <Container className="grid min-h-[calc(100svh-5rem)] items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-4xl">
          <Badge>Full Stack Developer</Badge>
          <h1 className="mt-7 max-w-4xl text-5xl font-semibold tracking-normal text-foreground sm:text-6xl lg:text-7xl">
            Digital workbench for thoughtful software.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
            A premium, personal portfolio foundation designed to grow into full
            stack projects, multilingual content, interactive systems, and
            carefully selected case studies.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href={buildLocalizedHref(locale, "/projects")}>
                Projects
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={buildLocalizedHref(locale, "/contact")}>Contact</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 border border-border bg-surface/72 p-3 shadow-2xl">
          <div className="grid grid-cols-3 gap-3">
            <WorkbenchCell label="Frontend" value="UI" />
            <WorkbenchCell label="Backend" value="API" />
            <WorkbenchCell label="Systems" value="IT" />
          </div>
          <div className="border border-border bg-background p-5">
            <p className="font-mono text-xs uppercase tracking-normal text-accent">
              Workspace
            </p>
            <div className="mt-5 grid gap-3">
              <WorkbenchLine width="w-11/12" />
              <WorkbenchLine width="w-8/12" />
              <WorkbenchLine width="w-10/12" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function WorkbenchCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-28 border border-border bg-background p-4">
      <p className="text-xs uppercase tracking-normal text-muted">{label}</p>
      <p className="mt-8 font-mono text-2xl text-foreground">{value}</p>
    </div>
  );
}

function WorkbenchLine({ width }: { width: string }) {
  return (
    <div className="h-3 overflow-hidden bg-surface-muted">
      <div className={`${width} h-full bg-muted-strong`} />
    </div>
  );
}
