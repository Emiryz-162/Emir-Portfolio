"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { buildLocalizedHref, localeLabels, locales } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function LanguageSwitcher() {
  const activeLocale = useLocale();
  const pathname = usePathname();

  return (
    <div className="group relative">
      <button
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-muted-strong transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Select language"
        type="button"
      >
        <Languages size={18} aria-hidden="true" />
      </button>
      <div className="invisible absolute right-0 top-12 z-50 w-48 translate-y-1 border border-border bg-surface p-1 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        {locales.map((locale) => (
          <a
            key={locale}
            href={buildLocalizedHref(locale, pathname)}
            className={cn(
              "flex items-center justify-between rounded px-3 py-2 text-sm text-muted-strong transition hover:bg-surface-muted hover:text-foreground",
              activeLocale === locale && "bg-surface-muted text-foreground",
            )}
          >
            <span>{localeLabels[locale]}</span>
            <span className="font-mono text-xs uppercase text-muted">
              {locale}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
