export type ContactEnv =
  | {
      ok: true;
      apiKey: string;
      emailTo: string;
      emailFrom: string;
    }
  | {
      ok: false;
      missing: string[];
    };

export function getContactEnv(): ContactEnv {
  const values = {
    RESEND_API_KEY: process.env.RESEND_API_KEY?.trim(),
    CONTACT_EMAIL_TO: process.env.CONTACT_EMAIL_TO?.trim(),
    CONTACT_EMAIL_FROM: process.env.CONTACT_EMAIL_FROM?.trim(),
  };

  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return {
    ok: true,
    apiKey: values.RESEND_API_KEY!,
    emailTo: values.CONTACT_EMAIL_TO!,
    emailFrom: values.CONTACT_EMAIL_FROM!,
  };
}
