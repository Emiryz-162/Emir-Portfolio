import type {
  ContactFieldErrors,
  ContactFormValues,
} from "@/lib/contact/validation";

export type ContactFormStatus =
  | "idle"
  | "submitting"
  | "success"
  | "validation-error"
  | "server-error"
  | "rate-limited"
  | "unavailable";

export type ContactFormState = {
  status: ContactFormStatus;
  errors: ContactFieldErrors;
  values: Pick<ContactFormValues, "name" | "email" | "subject" | "message">;
};

export const initialContactFormState: ContactFormState = {
  status: "idle",
  errors: {},
  values: {
    name: "",
    email: "",
    subject: "",
    message: "",
  },
};
