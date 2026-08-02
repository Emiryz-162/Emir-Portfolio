import { defineRouting } from "next-intl/routing";

export const locales = [
  "tr",
  "en",
  "de",
  "fr",
  "es",
  "it",
  "pt",
  "pl",
  "nl",
] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  tr: "Turkce",
  en: "English",
  de: "Deutsch",
  fr: "Francais",
  es: "Espanol",
  it: "Italiano",
  pt: "Portugues",
  pl: "Polski",
  nl: "Nederlands",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
});

export function buildLocalizedHref(locale: string, href: string) {
  const pathWithoutLocale = stripLocalePrefix(href);

  if (pathWithoutLocale === "/") {
    return `/${locale}`;
  }

  return `/${locale}${pathWithoutLocale}`;
}

function stripLocalePrefix(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const firstSegment = parts[0];

  if (firstSegment && locales.includes(firstSegment as Locale)) {
    const rest = parts.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}
