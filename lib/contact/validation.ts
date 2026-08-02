export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  subject: { min: 3, max: 120 },
  message: { min: 20, max: 3000 },
  minSubmitMs: 2500,
} as const;

export type ContactField = "name" | "email" | "subject" | "message";

export type ContactErrorCode =
  | "required"
  | "nameTooShort"
  | "nameTooLong"
  | "emailInvalid"
  | "emailTooLong"
  | "subjectTooShort"
  | "subjectTooLong"
  | "messageTooShort"
  | "messageTooLong";

export type ContactFormValues = Record<ContactField, string> & {
  company: string;
  startedAt: string;
  locale: string;
};

export type ContactFieldErrors = Partial<
  Record<ContactField, ContactErrorCode>
>;

export function getContactFormValues(formData: FormData): ContactFormValues {
  return {
    name: normalizeFormValue(formData.get("name")),
    email: normalizeFormValue(formData.get("email")),
    subject: normalizeFormValue(formData.get("subject")),
    message: normalizeFormValue(formData.get("message")),
    company: normalizeFormValue(formData.get("company")),
    startedAt: normalizeFormValue(formData.get("startedAt")),
    locale: normalizeFormValue(formData.get("locale")) || "en",
  };
}

export function validateContactForm(values: ContactFormValues) {
  const errors: ContactFieldErrors = {};

  if (!values.name) errors.name = "required";
  else if (values.name.length < CONTACT_LIMITS.name.min) {
    errors.name = "nameTooShort";
  } else if (values.name.length > CONTACT_LIMITS.name.max) {
    errors.name = "nameTooLong";
  }

  if (!values.email) errors.email = "required";
  else if (values.email.length > CONTACT_LIMITS.email.max) {
    errors.email = "emailTooLong";
  } else if (!isValidEmail(values.email)) {
    errors.email = "emailInvalid";
  }

  if (!values.subject) errors.subject = "required";
  else if (values.subject.length < CONTACT_LIMITS.subject.min) {
    errors.subject = "subjectTooShort";
  } else if (values.subject.length > CONTACT_LIMITS.subject.max) {
    errors.subject = "subjectTooLong";
  }

  if (!values.message) errors.message = "required";
  else if (values.message.length < CONTACT_LIMITS.message.min) {
    errors.message = "messageTooShort";
  } else if (values.message.length > CONTACT_LIMITS.message.max) {
    errors.message = "messageTooLong";
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}

export function isLikelySpamSubmission(values: ContactFormValues) {
  if (values.company) return true;

  const startedAt = Number(values.startedAt);
  if (!Number.isFinite(startedAt)) return true;

  return Date.now() - startedAt < CONTACT_LIMITS.minSubmitMs;
}

function normalizeFormValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
