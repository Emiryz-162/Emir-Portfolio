export type ProfileLinkKey = "github" | "linkedin" | "email";

export type ProfileLanguage = {
  key: "turkish" | "english" | "german";
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
  languages: ProfileLanguage[];
};
