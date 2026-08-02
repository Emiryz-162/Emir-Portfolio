import { Container } from "@/components/ui/container";

export default function ProjectDetailLoading() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="h-5 w-32 animate-pulse rounded-[4px] bg-surface-muted motion-reduce:animate-none" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div className="h-7 w-48 animate-pulse rounded-[4px] bg-surface-muted motion-reduce:animate-none" />
          <div className="mt-5 h-14 w-full max-w-2xl animate-pulse rounded-[6px] bg-surface-muted motion-reduce:animate-none" />
          <div className="mt-5 h-20 w-full max-w-3xl animate-pulse rounded-[6px] bg-surface-muted motion-reduce:animate-none" />
          <div className="mt-7 flex gap-3">
            <div className="h-11 w-32 animate-pulse rounded-[6px] bg-surface-muted motion-reduce:animate-none" />
            <div className="h-11 w-32 animate-pulse rounded-[6px] bg-surface-muted motion-reduce:animate-none" />
          </div>
        </div>
        <div className="h-72 animate-pulse rounded-[6px] border border-border bg-surface/72 motion-reduce:animate-none" />
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[0.74fr_1.26fr]">
        <div className="grid gap-6">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-[6px] border border-border bg-surface/72 motion-reduce:animate-none"
            />
          ))}
        </div>
        <div className="h-[520px] animate-pulse rounded-[6px] border border-border bg-surface/72 motion-reduce:animate-none" />
      </div>
    </Container>
  );
}
