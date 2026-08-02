import type { LucideIcon } from "lucide-react";

type ValueItemProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function ValueItem({ icon: Icon, title, description }: ValueItemProps) {
  return (
    <div className="border-border py-5 md:border-r md:px-5 md:last:border-r-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-[6px] border border-border bg-surface text-accent">
        <Icon size={18} aria-hidden />
      </div>
      <h2 className="mt-5 text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
