import {
  cloneElement,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary";

type ButtonBaseProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  asChild?: boolean;
};

type ButtonProps = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> &
  AnchorHTMLAttributes<HTMLAnchorElement>;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-accent bg-accent text-accent-foreground hover:brightness-95 disabled:border-border disabled:bg-surface-muted disabled:text-muted",
  secondary:
    "border-border bg-surface text-foreground hover:border-border-strong hover:bg-surface-elevated disabled:text-muted",
};

export function Button({
  asChild = false,
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-[6px] border px-4 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0",
    variantClasses[variant],
    className,
  );

  if (asChild && isSingleElement(children)) {
    return cloneWithClassName(children, classes);
  }

  return (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
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
