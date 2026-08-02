import {
  cloneElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  children: ReactNode;
};

export function Card({
  asChild = false,
  children,
  className,
  ...props
}: CardProps) {
  const classes = cn(
    "rounded-[6px] border border-border bg-surface/82 transition duration-200 hover:border-border-strong",
    className,
  );

  if (asChild && isSingleElement(children)) {
    return cloneWithClassName(children, classes);
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

function isSingleElement(
  children: ReactNode,
): children is ReactElement<{ className?: string }> {
  return (
    typeof children === "object" && children !== null && "props" in children
  );
}

function cloneWithClassName(
  child: ReactElement<{ className?: string }>,
  className: string,
) {
  return cloneElement(child, {
    className: cn(className, child.props.className),
  });
}
