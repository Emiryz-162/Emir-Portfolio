import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

type PagePreviewCardProps = {
  href: string;
  label: string;
  description: string;
};

export function PagePreviewCard({
  href,
  label,
  description,
}: PagePreviewCardProps) {
  return (
    <Card asChild>
      <Link
        href={href}
        className="group flex min-h-44 flex-col justify-between p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-foreground">{label}</h3>
          <ArrowUpRight
            className="mt-1 text-muted transition group-hover:text-accent"
            size={18}
            aria-hidden="true"
          />
        </div>
        <p className="mt-8 text-sm leading-6 text-muted">{description}</p>
      </Link>
    </Card>
  );
}
