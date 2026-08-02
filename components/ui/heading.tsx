import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

type HeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function Heading({
  eyebrow,
  title,
  description,
  className,
}: HeadingProps) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <Badge>{eyebrow}</Badge>
      <h1 className="mt-5 text-3xl font-semibold tracking-normal text-foreground sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
