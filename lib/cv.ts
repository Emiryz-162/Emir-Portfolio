import { existsSync } from "node:fs";
import { join } from "node:path";
import { profile } from "@/data/profile";

export const cvFileName = "emir-yilmaz-cv.pdf";
export const cvPublicHref = profile.resumeUrl;

export function getCvAvailability() {
  return existsSync(join(process.cwd(), "public", "documents", cvFileName));
}
