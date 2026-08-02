import { cn } from "@/lib/cn";

type TechBadgeProps = {
  children: string;
  className?: string;
};

export function TechBadge({ children, className }: TechBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] border border-border bg-background/70 px-2.5 py-1 font-mono text-[11px] uppercase tracking-normal text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
