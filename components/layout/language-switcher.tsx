"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { buildLocalizedHref, localeLabels, locales } from "@/i18n/routing";
import { cn } from "@/lib/cn";

type LanguageSwitcherProps = {
  align?: "left" | "right";
};

export function LanguageSwitcher({ align = "right" }: LanguageSwitcherProps) {
  const t = useTranslations("Common");
  const activeLocale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentHref, setCurrentHref] = useState(pathname);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    activeItemRef.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setCurrentHref(
      `${pathname}${window.location.search}${window.location.hash}`,
    );
    setIsOpen((value) => !value);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={buttonRef}
        className="inline-flex h-10 min-w-14 items-center justify-center gap-2 rounded-[6px] border border-border bg-surface px-2.5 text-muted-foreground transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t("selectLanguage")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        type="button"
        onClick={toggleMenu}
      >
        <Languages size={18} aria-hidden="true" />
        <span className="font-mono text-xs uppercase">{activeLocale}</span>
      </button>
      <div
        id={menuId}
        role="menu"
        aria-label={t("selectLanguage")}
        className={cn(
          "absolute top-12 z-50 w-64 rounded-[6px] border border-border bg-surface p-1 shadow-2xl transition",
          align === "right" ? "right-0" : "left-0",
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible translate-y-1 opacity-0",
        )}
      >
        {locales.map((locale) => (
          <a
            key={locale}
            ref={activeLocale === locale ? activeItemRef : undefined}
            href={buildLocalizedHref(locale, currentHref)}
            role="menuitem"
            aria-current={activeLocale === locale ? "true" : undefined}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center justify-between rounded-[4px] px-3 py-2 text-sm text-muted-foreground transition hover:bg-surface-muted hover:text-foreground focus-visible:bg-surface-muted focus-visible:text-foreground focus-visible:outline-none",
              activeLocale === locale && "bg-surface-muted text-foreground",
            )}
          >
            <span>{localeLabels[locale]}</span>
            <span className="font-mono text-xs uppercase text-muted">
              {locale}
            </span>
          </a>
        ))}
        <p className="border-t border-border px-3 py-2 text-xs leading-5 text-muted">
          {t("translationNote")}
        </p>
      </div>
    </div>
  );
}
