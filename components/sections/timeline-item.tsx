type TimelineItemProps = {
  label: string;
  title: string;
  organization: string;
  meta: string;
  index: number;
};

export function TimelineItem({
  label,
  title,
  organization,
  meta,
  index,
}: TimelineItemProps) {
  return (
    <article className="relative rounded-[6px] border border-border bg-surface/72 p-5">
      <div className="mb-7 flex items-center justify-between gap-3">
        <span className="font-mono text-xs uppercase tracking-normal text-accent">
          {label}
        </span>
        <span className="font-mono text-xs text-muted">
          {String(index).padStart(2, "0")}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {organization}
      </p>
      <p className="mt-5 font-mono text-xs uppercase tracking-normal text-muted">
        {meta}
      </p>
    </article>
  );
}
