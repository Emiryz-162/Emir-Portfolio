import { profile } from "@/data/profile";

export const socialLinks = [
  {
    key: "github",
    href: profile.githubUrl,
  },
  {
    key: "linkedin",
    href: profile.linkedInUrl,
  },
  {
    key: "email",
    href: `mailto:${profile.email}`,
  },
] as const;

export const cvDownloadHref = profile.resumeUrl;
