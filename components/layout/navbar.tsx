"use client";

import { Mail, Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { navItems } from "@/data/navigation";
import { profile } from "@/data/profile";
import { buildLocalizedHref } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function Navbar() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/88 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link
          href={buildLocalizedHref(locale, "/")}
          className="flex min-w-0 items-center gap-3 text-sm font-semibold tracking-normal text-foreground sm:text-base"
          onClick={() => setIsOpen(false)}
        >
          <span>{profile.shortName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={buildLocalizedHref(locale, item.href)}
              className={cn(
                "relative rounded-[6px] px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring after:transition-all after:duration-200",
                isActivePath(pathname, locale, item.href) &&
                  "bg-surface text-foreground after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:bg-accent",
              )}
            >
              {t(`items.${item.labelKey}`)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle testId="desktop-theme-toggle" />
          <ContactButton />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle testId="mobile-theme-toggle" />
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-border bg-surface text-foreground transition hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
            aria-label={isOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      <div
        id="mobile-navigation"
        className={cn(
          "border-t border-border bg-background md:hidden",
          isOpen ? "block" : "hidden",
        )}
      >
        <Container className="grid max-h-[calc(100svh-5rem)] gap-2 overflow-y-auto py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={buildLocalizedHref(locale, item.href)}
              className="rounded-[6px] px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setIsOpen(false)}
            >
              {t(`items.${item.labelKey}`)}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-2 border-t border-border pt-4">
            <LanguageSwitcher align="left" />
            <ContactButton
              className="flex-1"
              onClick={() => setIsOpen(false)}
            />
          </div>
        </Container>
      </div>
    </header>
  );
}

function ContactButton({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const t = useTranslations("Navigation");
  const locale = useLocale();

  return (
    <Button asChild className={className}>
      <a
        href={buildLocalizedHref(locale, "/contact")}
        aria-label={t("contactAria")}
        onClick={onClick}
      >
        <Mail size={16} aria-hidden="true" />
        {t("contact")}
      </a>
    </Button>
  );
}

function isActivePath(pathname: string, locale: string, href: string) {
  const localizedHref = buildLocalizedHref(locale, href);

  if (localizedHref === `/${locale}`) {
    return pathname === localizedHref;
  }

  return pathname.startsWith(localizedHref);
}
