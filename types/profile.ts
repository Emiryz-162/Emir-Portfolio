export type ProfileLinkKey = "github" | "linkedin" | "email";

export type ProfileLanguage = {
  name: string;
  level: string;
};

export type Profile = {
  fullName: string;
  shortName: string;
  initials: string;
  role: string;
  location: string;
  email: string;
  githubUrl: string;
  linkedInUrl: string;
  resumeUrl: string;
  languages: ProfileLanguage[];
};
