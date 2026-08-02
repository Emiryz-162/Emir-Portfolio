import { BriefcaseBusiness, Code2, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const icons: Record<string, LucideIcon> = {
  github: Code2,
  linkedin: BriefcaseBusiness,
  email: Mail,
};

type SocialButtonProps = {
  label: string;
  href: string;
  iconKey: string;
  compact?: boolean;
};

export function SocialButton({
  label,
  href,
  iconKey,
  compact = false,
}: SocialButtonProps) {
  const Icon = icons[iconKey] ?? Mail;

  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[6px] border border-border bg-surface px-3 text-sm font-medium text-muted-foreground transition duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        compact ? "h-9 w-9 px-0" : "h-10",
      )}
      aria-label={label}
    >
      <Icon size={16} aria-hidden />
      {compact ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span>{label}</span>
      )}
    </a>
  );
}
