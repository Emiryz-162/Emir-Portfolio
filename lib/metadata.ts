import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { routing, type Locale } from "@/i18n/routing";

export function getSiteUrl() {
  if (!siteConfig.url) return null;

  try {
    return new URL(siteConfig.url);
  } catch {
    return null;
  }
}

export function getLocalizedAlternates(pathname = "/"): Metadata["alternates"] {
  const siteUrl = getSiteUrl();

  if (!siteUrl) return undefined;

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const pathWithoutLocale = stripLeadingLocale(normalizedPath);

  return {
    canonical: localizedUrl(siteUrl, routing.defaultLocale, pathWithoutLocale),
    languages: Object.fromEntries([
      ...routing.locales.map((locale) => [
        locale,
        localizedUrl(siteUrl, locale, pathWithoutLocale),
      ]),
      [
        "x-default",
        localizedUrl(siteUrl, routing.defaultLocale, pathWithoutLocale),
      ],
    ]),
  };
}

export function getMetadataBase() {
  return getSiteUrl() ?? undefined;
}

function localizedUrl(siteUrl: URL, locale: Locale, pathname: string) {
  const url = new URL(siteUrl);
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return url;
}

function stripLeadingLocale(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const firstSegment = parts[0];

  if (firstSegment && routing.locales.includes(firstSegment as Locale)) {
    const rest = parts.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }

  return pathname;
}
