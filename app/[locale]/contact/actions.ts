"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { getContactEnv } from "@/lib/contact/env";
import { buildContactEmail } from "@/lib/contact/email";
import { checkContactRateLimit } from "@/lib/contact/rate-limit";
import {
  initialContactFormState,
  type ContactFormState,
} from "@/lib/contact/state";
import {
  getContactFormValues,
  isLikelySpamSubmission,
  validateContactForm,
} from "@/lib/contact/validation";

export async function sendContactMessage(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values = getContactFormValues(formData);
  const validation = validateContactForm(values);
  const publicValues = {
    name: values.name,
    email: values.email,
    subject: values.subject,
    message: values.message,
  };

  if (!validation.ok) {
    return {
      status: "validation-error",
      errors: validation.errors,
      values: publicValues,
    };
  }

  if (isLikelySpamSubmission(values)) {
    return {
      status: "server-error",
      errors: {},
      values: publicValues,
    };
  }

  const identifier = getRateLimitIdentifier(await headers(), values.email);
  const rateLimit = checkContactRateLimit(identifier);

  if (!rateLimit.allowed) {
    return {
      status: "rate-limited",
      errors: {},
      values: publicValues,
    };
  }

  const env = getContactEnv();

  if (!env.ok) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[contact] Missing environment variables: ${env.missing.join(", ")}`,
      );
    }

    return {
      status: "unavailable",
      errors: {},
      values: publicValues,
    };
  }

  try {
    const resend = new Resend(env.apiKey);
    const email = buildContactEmail(values);

    await resend.emails.send({
      from: env.emailFrom,
      to: env.emailTo,
      replyTo: values.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    return {
      ...initialContactFormState,
      status: "success",
    };
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.error("[contact] Resend request failed");
    }

    return {
      status: "server-error",
      errors: {},
      values: publicValues,
    };
  }
}

function getRateLimitIdentifier(requestHeaders: Headers, email: string) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();

  return `${ip || "unknown"}:${email.toLowerCase()}`;
}
