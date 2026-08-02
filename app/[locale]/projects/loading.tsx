import { Container } from "@/components/ui/container";

export default function ProjectsLoading() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="h-6 w-32 animate-pulse rounded-[4px] bg-surface-muted motion-reduce:animate-none" />
      <div className="mt-5 h-12 w-full max-w-2xl animate-pulse rounded-[6px] bg-surface-muted motion-reduce:animate-none" />
      <div className="mt-4 h-6 w-full max-w-3xl animate-pulse rounded-[4px] bg-surface-muted motion-reduce:animate-none" />
      <div className="mt-10 h-28 animate-pulse rounded-[6px] border border-border bg-surface/72 motion-reduce:animate-none" />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-96 animate-pulse rounded-[6px] border border-border bg-surface/72 motion-reduce:animate-none"
          />
        ))}
      </div>
    </Container>
  );
}
