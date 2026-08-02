"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/use-mounted";

const themeCycle = ["system", "dark", "light"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  const activeTheme = mounted ? (theme ?? "system") : "system";
  const nextTheme =
    themeCycle[
      (themeCycle.indexOf(activeTheme as (typeof themeCycle)[number]) + 1) %
        themeCycle.length
    ];
  const Icon =
    activeTheme === "light" ? Sun : activeTheme === "dark" ? Moon : Monitor;

  return (
    <button
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-muted-strong transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      type="button"
      aria-label={`Switch theme to ${nextTheme}`}
      title={`Theme: ${activeTheme}`}
      onClick={() => setTheme(nextTheme)}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}
