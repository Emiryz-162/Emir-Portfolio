import type { ContactFormValues } from "@/lib/contact/validation";

export function buildContactEmail(values: ContactFormValues) {
  const submittedAt = new Date().toISOString();

  return {
    subject: `Portfolio Contact: ${values.subject}`,
    text: [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `Subject: ${values.subject}`,
      `Locale: ${values.locale}`,
      `Submitted at: ${submittedAt}`,
      "",
      values.message,
    ].join("\n"),
    html: [
      "<h1>Portfolio Contact</h1>",
      "<dl>",
      `<dt>Name</dt><dd>${escapeHtml(values.name)}</dd>`,
      `<dt>Email</dt><dd>${escapeHtml(values.email)}</dd>`,
      `<dt>Subject</dt><dd>${escapeHtml(values.subject)}</dd>`,
      `<dt>Locale</dt><dd>${escapeHtml(values.locale)}</dd>`,
      `<dt>Submitted at</dt><dd>${escapeHtml(submittedAt)}</dd>`,
      "</dl>",
      `<p>${escapeHtml(values.message).replace(/\n/g, "<br />")}</p>`,
    ].join(""),
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
