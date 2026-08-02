import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] border border-border bg-surface px-3 py-1 font-mono text-xs uppercase tracking-normal text-accent",
        className,
      )}
      {...props}
    />
  );
}
