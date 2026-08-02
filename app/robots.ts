import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const isProduction = process.env.NODE_ENV === "production";

  return {
    rules: {
      userAgent: "*",
      allow: isProduction ? "/" : undefined,
      disallow: isProduction ? ["/api/", "/_next/"] : "/",
    },
    sitemap: siteUrl ? new URL("/sitemap.xml", siteUrl).toString() : undefined,
  };
}
