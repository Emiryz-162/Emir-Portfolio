import { siteConfig } from "@/config/site";
import { profile } from "@/data/profile";
import { getSiteUrl } from "@/lib/metadata";

export function getHomeStructuredData() {
  const siteUrl = getSiteUrl();
  const url = siteUrl?.toString();

  return [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: profile.fullName,
      alternateName: profile.shortName,
      jobTitle: profile.role,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Istanbul",
        addressCountry: "TR",
      },
      url,
      sameAs: [profile.githubUrl, profile.linkedInUrl],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url,
      inLanguage: siteConfig.supportedLocales,
      author: {
        "@type": "Person",
        name: profile.fullName,
      },
    },
  ];
}
