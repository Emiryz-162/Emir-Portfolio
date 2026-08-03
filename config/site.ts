import { profile } from "@/data/profile";
import { routing } from "@/i18n/routing";

export const siteConfig = {
  name: "Emir Yılmaz Portfolio",
  shortName: "Emir Portfolio",
  description:
    "Full Stack Developer portfolio focused on responsive web applications, backend services and database-driven projects.",
  url: process.env.NEXT_PUBLIC_SITE_URL,
  productionUrl: "https://emir-portfolio-nine.vercel.app",
  developmentUrl: "http://localhost:3000",
  author: profile.fullName,
  alternateName: profile.shortName,
  locale: routing.defaultLocale,
  supportedLocales: routing.locales,
  githubUrl: profile.githubUrl,
  linkedInUrl: profile.linkedInUrl,
} as const;
