import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const locales = ["en", "tr", "de", "fr", "es", "it", "pt", "nl", "pl"];
const requiredEnvKeys = [
  "GITHUB_TOKEN",
  "NEXT_PUBLIC_SITE_URL",
  "RESEND_API_KEY",
  "CONTACT_EMAIL_TO",
  "CONTACT_EMAIL_FROM",
];

const requiredFiles = [
  "app/sitemap.ts",
  "app/robots.ts",
  "app/opengraph-image.tsx",
  "app/icon.tsx",
  "app/apple-icon.tsx",
  "app/manifest.ts",
  "app/[locale]/error.tsx",
  "app/[locale]/not-found.tsx",
  "lib/contact/validation.ts",
  "lib/contact/env.ts",
  "lib/contact/rate-limit.ts",
  "lib/seo/structured-data.ts",
];

const requiredMessagePaths = [
  "Common.skipToContent",
  "Common.cv.download",
  "Common.cv.aria",
  "Common.cv.pdf",
  "Common.cv.unavailableTitle",
  "Common.cv.unavailableDescription",
  "Navigation.cvAria",
  "Navigation.cvUnavailable",
  "Navigation.cvPdf",
  "ContactPage.status",
  "ContactPage.cv.title",
  "ContactPage.form.fields.name.label",
  "ContactPage.form.fields.email.label",
  "ContactPage.form.fields.subject.label",
  "ContactPage.form.fields.message.label",
  "ContactPage.form.status.success",
  "ContactPage.form.status.validationError",
  "ContactPage.form.status.serverError",
  "ContactPage.form.status.rateLimited",
  "ContactPage.form.status.unavailable",
  "ContactPage.form.errors.required",
  "ContactPage.form.errors.nameTooShort",
  "ContactPage.form.errors.emailInvalid",
  "ContactPage.form.errors.subjectTooShort",
  "ContactPage.form.errors.messageTooShort",
  "NotFound.projectsLink",
  "ErrorPage.retry",
  "ErrorPage.homeLink",
];

let failed = false;

function assert(condition, message) {
  if (!condition) {
    failed = true;
    console.error(`x ${message}`);
  }
}

function getPathValue(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

for (const file of requiredFiles) {
  assert(existsSync(join(root, file)), `${file} is missing`);
}

const envExample = readFileSync(join(root, ".env.example"), "utf8");
for (const key of requiredEnvKeys) {
  assert(
    envExample.split(/\r?\n/).some((line) => line.startsWith(`${key}=`)),
    `.env.example is missing ${key}`,
  );
}

for (const locale of locales) {
  const messages = JSON.parse(
    readFileSync(join(root, "messages", `${locale}.json`), "utf8"),
  );

  for (const path of requiredMessagePaths) {
    assert(
      typeof getPathValue(messages, path) === "string",
      `messages/${locale}.json is missing ${path}`,
    );
  }
}

const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
for (const header of [
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "X-Frame-Options",
]) {
  assert(nextConfig.includes(header), `next.config.ts is missing ${header}`);
}

const cvPath = join(root, "public", "documents", "emir-yilmaz-cv.pdf");
if (!existsSync(cvPath)) {
  console.warn(
    "! public/documents/emir-yilmaz-cv.pdf is not present; the UI should avoid broken CV download links.",
  );
}

if (failed) {
  process.exit(1);
}

console.log("Production readiness validation passed.");
