"use client";

import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type FormEvent,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";
import { sendContactMessage } from "@/app/[locale]/contact/actions";
import { Button } from "@/components/ui/button";
import {
  initialContactFormState,
  type ContactFormState,
} from "@/lib/contact/state";
import {
  CONTACT_LIMITS,
  getContactFormValues,
  type ContactField,
  validateContactForm,
} from "@/lib/contact/validation";
import { cn } from "@/lib/cn";

type ContactFormProps = {
  locale: string;
  email: string;
  isAvailable: boolean;
};

const fields = ["name", "email", "subject", "message"] as const;

export function ContactForm({ locale, email, isAvailable }: ContactFormProps) {
  const t = useTranslations("ContactPage.form");
  const [state, formAction] = useActionState<ContactFormState, FormData>(
    sendContactMessage,
    initialContactFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const startedAtInputRef = useRef<HTMLInputElement>(null);
  const [clientState, setClientState] = useState<ContactFormState | null>(null);
  const displayedState = clientState ?? state;

  useEffect(() => {
    if (startedAtInputRef.current) {
      startedAtInputRef.current.value = String(Date.now());
    }
  }, []);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      if (startedAtInputRef.current) {
        startedAtInputRef.current.value = String(Date.now());
      }
    }
  }, [state.status]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!isAvailable) {
      event.preventDefault();
      return;
    }

    const values = getContactFormValues(new FormData(event.currentTarget));
    const validation = validateContactForm(values);

    if (!validation.ok) {
      event.preventDefault();
      setClientState({
        status: "validation-error",
        errors: validation.errors,
        values: {
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
        },
      });
      return;
    }

    setClientState(null);
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onInput={() => setClientState(null)}
      onSubmit={handleSubmit}
      className="rounded-[6px] border border-border bg-surface/82 p-5 sm:p-6"
      noValidate
    >
      <input type="hidden" name="locale" value={locale} />
      <input ref={startedAtInputRef} type="hidden" name="startedAt" />
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-company">{t("honeypot")}</label>
        <input
          id="contact-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-normal text-accent">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-normal text-foreground">
          {t("title")}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">{t("description")}</p>
      </div>

      <fieldset className="grid gap-4" disabled={!isAvailable}>
        {fields.map((field) => (
          <ContactFieldControl
            key={field}
            field={field}
            state={displayedState}
          />
        ))}
      </fieldset>

      {isAvailable ? (
        <p className="mt-4 text-xs leading-5 text-muted">{t("privacy")}</p>
      ) : null}

      {isAvailable ? (
        <FormMessage state={displayedState} email={email} />
      ) : (
        <FormUnavailableMessage email={email} />
      )}

      <SubmitButton disabled={!isAvailable} />
    </form>
  );
}

function ContactFieldControl({
  field,
  state,
}: {
  field: ContactField;
  state: ContactFormState;
}) {
  const t = useTranslations("ContactPage.form");
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const errorCode = state.errors[field];
  const hasError = Boolean(errorCode);
  const commonProps = {
    id: fieldId,
    name: field,
    required: true,
    "aria-invalid": hasError,
    "aria-describedby": hasError ? errorId : undefined,
    className: cn(
      "mt-2 w-full rounded-[6px] border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-border-strong focus:ring-2 focus:ring-ring",
      hasError && "border-[#d26a5c]",
    ),
  };

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium text-muted-foreground"
      >
        {t(`fields.${field}.label`)}
      </label>
      {field === "message" ? (
        <textarea
          {...commonProps}
          defaultValue={state.values.message}
          minLength={CONTACT_LIMITS.message.min}
          maxLength={CONTACT_LIMITS.message.max}
          rows={6}
        />
      ) : (
        <input
          {...commonProps}
          defaultValue={state.values[field]}
          type={field === "email" ? "email" : "text"}
          minLength={
            field === "name"
              ? CONTACT_LIMITS.name.min
              : field === "subject"
                ? CONTACT_LIMITS.subject.min
                : undefined
          }
          maxLength={
            field === "name"
              ? CONTACT_LIMITS.name.max
              : field === "subject"
                ? CONTACT_LIMITS.subject.max
                : CONTACT_LIMITS.email.max
          }
          autoComplete={field === "email" ? "email" : "off"}
        />
      )}
      {hasError ? (
        <p id={errorId} className="mt-2 text-sm text-[#d26a5c]">
          {t(`errors.${errorCode}`)}
        </p>
      ) : null}
    </div>
  );
}

function FormMessage({
  state,
  email,
}: {
  state: ContactFormState;
  email: string;
}) {
  const t = useTranslations("ContactPage.form");

  if (state.status === "idle") return null;

  const isSuccess = state.status === "success";
  const statusKey =
    state.status === "rate-limited"
      ? "rateLimited"
      : state.status === "unavailable"
        ? "unavailable"
        : state.status === "server-error"
          ? "serverError"
          : state.status === "validation-error"
            ? "validationError"
            : "success";

  return (
    <div
      className={cn(
        "mt-5 rounded-[6px] border px-3 py-3 text-sm leading-6",
        isSuccess
          ? "border-accent/60 bg-accent/10 text-foreground"
          : "border-border bg-background text-muted-foreground",
      )}
      role="status"
      aria-live="polite"
    >
      <p>{t(`status.${statusKey}`)}</p>
      {!isSuccess && state.status !== "validation-error" ? (
        <a
          className="mt-2 inline-flex font-semibold text-accent transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={`mailto:${email}`}
        >
          {t("emailFallback")}
        </a>
      ) : null}
    </div>
  );
}

function FormUnavailableMessage({ email }: { email: string }) {
  const t = useTranslations("ContactPage.form");

  return (
    <div
      className="mt-5 rounded-[6px] border border-border bg-background px-3 py-3 text-sm leading-6 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <p>{t("status.unavailable")}</p>
      <a
        className="mt-2 inline-flex font-semibold text-accent transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={`mailto:${email}`}
      >
        {t("emailFallback")}
      </a>
    </div>
  );
}

function SubmitButton({ disabled = false }: { disabled?: boolean }) {
  const t = useTranslations("ContactPage.form");
  const { pending } = useFormStatus();

  return (
    <Button
      className="mt-6 w-full"
      type="submit"
      disabled={pending || disabled}
    >
      <Send size={16} aria-hidden="true" />
      {pending ? t("actions.sending") : t("actions.submit")}
    </Button>
  );
}
