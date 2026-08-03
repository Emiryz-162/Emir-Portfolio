import de from "@/messages/de.json";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import fr from "@/messages/fr.json";
import it from "@/messages/it.json";
import nl from "@/messages/nl.json";
import pl from "@/messages/pl.json";
import pt from "@/messages/pt.json";
import tr from "@/messages/tr.json";
import type { Locale } from "@/i18n/routing";

type MessageBundle = typeof en;

const messages: Record<Locale, MessageBundle> = {
  en,
  tr,
  de,
  fr,
  es,
  it,
  pt,
  nl,
  pl,
};

export function getAssistantMessageBundle(locale: Locale) {
  return messages[locale] ?? messages.en;
}

export function getMessageValue(bundle: MessageBundle, path: string): unknown {
  return path.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object") return undefined;
    return (value as Record<string, unknown>)[segment];
  }, bundle);
}

export function getMessageString(
  bundle: MessageBundle,
  path: string,
  fallback = "",
) {
  const value = getMessageValue(bundle, path);
  return typeof value === "string" ? value : fallback;
}

export function getMessageStringArray(bundle: MessageBundle, path: string) {
  const value = getMessageValue(bundle, path);
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
