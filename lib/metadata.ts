import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { routing, type Locale } from "@/i18n/routing";

let warnedLocalhostProductionSiteUrl = false;

export function getSiteUrl() {
  const configuredUrl =
    siteConfig.url ||
    (process.env.NODE_ENV === "production"
      ? siteConfig.productionUrl
      : siteConfig.developmentUrl);

  try {
    const url = new URL(configuredUrl);
    if (process.env.NODE_ENV === "production" && isLocalhostUrl(url)) {
      if (!warnedLocalhostProductionSiteUrl) {
        console.warn(
          "[metadata] NEXT_PUBLIC_SITE_URL points to localhost in production; metadata URLs were skipped.",
        );
        warnedLocalhostProductionSiteUrl = true;
      }
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export function getLocalizedAlternates(
  pathname = "/",
  locale: string = routing.defaultLocale,
): Metadata["alternates"] {
  const siteUrl = getSiteUrl();

  if (!siteUrl) return undefined;

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const pathWithoutLocale = stripLeadingLocale(normalizedPath);

  return {
    canonical: localizedUrl(
      siteUrl,
      locale as Locale,
      pathWithoutLocale,
    ).toString(),
    languages: Object.fromEntries([
      ...routing.locales.map((locale) => [
        locale,
        localizedUrl(siteUrl, locale, pathWithoutLocale).toString(),
      ]),
      [
        "x-default",
        localizedUrl(
          siteUrl,
          routing.defaultLocale,
          pathWithoutLocale,
        ).toString(),
      ],
    ]),
  };
}

export function getMetadataBase() {
  return getSiteUrl() ?? undefined;
}

export function createPageMetadata({
  title,
  description,
  pathname,
  locale,
}: {
  title: string;
  description: string;
  pathname: string;
  locale: string;
}): Metadata {
  const siteUrl = getSiteUrl();
  const alternates = getLocalizedAlternates(pathname, locale);
  const url = siteUrl
    ? localizedUrl(
        siteUrl,
        locale as Locale,
        stripLeadingLocale(
          pathname.startsWith("/") ? pathname : `/${pathname}`,
        ),
      ).toString()
    : undefined;

  const imageUrl = siteUrl
    ? new URL("/opengraph-image", siteUrl).toString()
    : undefined;

  return {
    metadataBase: getMetadataBase(),
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale,
      type: "website",
      images: imageUrl ? [imageUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
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

function isLocalhostUrl(url: URL) {
  return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
}
