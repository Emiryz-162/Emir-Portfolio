"use client";

import { Download, Menu, X } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { buildLocalizedHref } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { navItems } from "@/lib/navigation";

export function Navbar() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/86 backdrop-blur-xl">
      <Container className="flex h-20 items-center justify-between gap-5">
        <Link
          href={buildLocalizedHref(locale, "/")}
          className="min-w-0 text-sm font-semibold tracking-normal text-foreground sm:text-base"
          onClick={() => setIsOpen(false)}
        >
          Muhammet Emir Yilmaz
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={buildLocalizedHref(locale, item.href)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-strong transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button disabled>
            <Download size={16} aria-hidden="true" />
            CV
          </Button>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-foreground transition hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          type="button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </Container>

      <div
        className={cn(
          "border-t border-border bg-background md:hidden",
          isOpen ? "block" : "hidden",
        )}
      >
        <Container className="grid gap-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={buildLocalizedHref(locale, item.href)}
              className="rounded-md px-3 py-3 text-sm font-medium text-muted-strong transition hover:bg-surface hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-2 border-t border-border pt-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button className="flex-1" disabled>
              <Download size={16} aria-hidden="true" />
              CV Download
            </Button>
          </div>
        </Container>
      </div>
    </header>
  );
}
