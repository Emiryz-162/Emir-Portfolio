import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderPage({
  eyebrow,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <Container className="py-12 sm:py-16">
      <Heading eyebrow={eyebrow} title={title} description={description} />
      <Card className="mt-10 p-6">
        <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
          <p className="font-mono text-xs uppercase tracking-normal text-accent">
            Placeholder
          </p>
          <div className="space-y-3">
            <div className="h-3 w-10/12 bg-surface-muted" />
            <div className="h-3 w-8/12 bg-surface-muted" />
            <div className="h-3 w-11/12 bg-surface-muted" />
          </div>
        </div>
      </Card>
    </Container>
  );
}
