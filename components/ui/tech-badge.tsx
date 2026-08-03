import { cn } from "@/lib/cn";

type TechBadgeProps = {
  children: string;
  className?: string;
  preserveCase?: boolean;
};

export function TechBadge({
  children,
  className,
  preserveCase = false,
}: TechBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] border border-border bg-background/70 px-2.5 py-1 font-mono text-[11px] tracking-normal text-muted-foreground transition duration-200 hover:border-border-strong hover:bg-surface motion-reduce:transition-none",
        !preserveCase && "uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
