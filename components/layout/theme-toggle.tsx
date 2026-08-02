"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";

type ThemeToggleProps = {
  testId?: string;
};

export function ThemeToggle({ testId }: ThemeToggleProps) {
  const t = useTranslations("Common");
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const activeTheme = mounted ? (resolvedTheme ?? "dark") : "loading";
  const nextTheme = activeTheme === "light" ? "dark" : "light";
  const Icon =
    activeTheme === "loading" ? Monitor : activeTheme === "light" ? Moon : Sun;

  return (
    <button
      className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-border bg-surface text-muted-foreground transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait"
      type="button"
      aria-label={t(`theme.${nextTheme}`)}
      title={mounted ? t(`theme.current.${activeTheme}`) : t("theme.loading")}
      data-testid={testId}
      onClick={() => setTheme(nextTheme)}
      disabled={!mounted}
    >
      <Icon
        className={
          mounted
            ? "opacity-100 transition duration-200 motion-reduce:transition-none"
            : "opacity-0"
        }
        size={18}
        aria-hidden="true"
      />
    </button>
  );
}
