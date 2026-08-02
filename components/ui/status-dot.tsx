import { cn } from "@/lib/cn";

type StatusDotProps = {
  className?: string;
};

export function StatusDot({ className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-flex h-2.5 w-2.5 rounded-full bg-accent",
        className,
      )}
      aria-hidden="true"
    />
  );
}
