import { defineRouting } from "next-intl/routing";

export const locales = [
  "en",
  "tr",
  "de",
  "fr",
  "es",
  "it",
  "pt",
  "nl",
  "pl",
] as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  tr: "Türkçe",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  pt: "Português",
  nl: "Nederlands",
  pl: "Polski",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
});

export function buildLocalizedHref(locale: string, href: string) {
  const [pathWithSearch, hash = ""] = href.split("#", 2);
  const [path, search = ""] = pathWithSearch.split("?", 2);
  const pathWithoutLocale = stripLocalePrefix(path);

  const localizedPath =
    pathWithoutLocale === "/" ? `/${locale}` : `/${locale}${pathWithoutLocale}`;
  const query = search ? `?${search}` : "";
  const fragment = hash ? `#${hash}` : "";

  return `${localizedPath}${query}${fragment}`;
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
