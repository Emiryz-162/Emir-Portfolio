import type { Locale } from "@/i18n/routing";

type AssistantErrorCode =
  | "disabled"
  | "missingApiKey"
  | "invalidRequest"
  | "rateLimited"
  | "auth"
  | "openaiRateLimit"
  | "openaiUnavailable"
  | "emptyResponse"
  | "responseIncomplete"
  | "serverError";

const messages: Record<Locale, Record<AssistantErrorCode, string>> = {
  en: {
    disabled: "The AI assistant is currently unavailable.",
    missingApiKey: "The AI assistant is currently unavailable.",
    invalidRequest: "Please send a valid assistant request.",
    rateLimited: "Too many assistant requests. Please try again shortly.",
    auth: "The AI assistant is not configured correctly right now.",
    openaiRateLimit:
      "The AI assistant is busy right now. Please try again shortly.",
    openaiUnavailable: "The AI assistant is temporarily unavailable.",
    emptyResponse: "The AI assistant could not produce an answer.",
    responseIncomplete:
      "The response ended earlier than expected. You can try again.",
    serverError: "The AI assistant could not respond right now.",
  },
  tr: {
    disabled: "AI asistani su anda kullanilamiyor.",
    missingApiKey: "AI asistani su anda kullanilamiyor.",
    invalidRequest: "Lutfen gecerli bir asistan istegi gonderin.",
    rateLimited:
      "Cok fazla asistan istegi gonderildi. Lutfen kisa sure sonra tekrar deneyin.",
    auth: "AI asistani su anda dogru yapilandirilmamis.",
    openaiRateLimit:
      "AI asistani su anda yogun. Lutfen kisa sure sonra tekrar deneyin.",
    openaiUnavailable: "AI asistani gecici olarak kullanilamiyor.",
    emptyResponse: "AI asistani bir yanit uretemedi.",
    responseIncomplete:
      "Yanit beklenenden erken kesildi. Tekrar deneyebilirsin.",
    serverError: "AI asistani su anda yanit veremedi.",
  },
  de: {
    disabled: "Der KI-Assistent ist derzeit nicht verfuegbar.",
    missingApiKey: "Der KI-Assistent ist derzeit nicht verfuegbar.",
    invalidRequest: "Bitte sende eine gueltige Assistentenanfrage.",
    rateLimited:
      "Zu viele Assistentenanfragen. Bitte versuche es gleich erneut.",
    auth: "Der KI-Assistent ist derzeit nicht korrekt konfiguriert.",
    openaiRateLimit:
      "Der KI-Assistent ist gerade ausgelastet. Bitte versuche es gleich erneut.",
    openaiUnavailable: "Der KI-Assistent ist voruebergehend nicht verfuegbar.",
    emptyResponse: "Der KI-Assistent konnte keine Antwort erzeugen.",
    responseIncomplete:
      "Die Antwort endete frueher als erwartet. Du kannst es erneut versuchen.",
    serverError: "Der KI-Assistent konnte gerade nicht antworten.",
  },
  fr: {
    disabled: "L'assistant IA est actuellement indisponible.",
    missingApiKey: "L'assistant IA est actuellement indisponible.",
    invalidRequest: "Veuillez envoyer une requete d'assistant valide.",
    rateLimited: "Trop de requetes. Veuillez reessayer dans un instant.",
    auth: "L'assistant IA n'est pas correctement configure pour le moment.",
    openaiRateLimit:
      "L'assistant IA est occupe. Veuillez reessayer dans un instant.",
    openaiUnavailable: "L'assistant IA est temporairement indisponible.",
    emptyResponse: "L'assistant IA n'a pas pu produire de reponse.",
    responseIncomplete:
      "La reponse s'est arretee plus tot que prevu. Tu peux reessayer.",
    serverError: "L'assistant IA ne peut pas repondre pour le moment.",
  },
  es: {
    disabled: "El asistente de IA no esta disponible en este momento.",
    missingApiKey: "El asistente de IA no esta disponible en este momento.",
    invalidRequest: "Envia una solicitud valida para el asistente.",
    rateLimited: "Demasiadas solicitudes. Intentalo de nuevo en breve.",
    auth: "El asistente de IA no esta configurado correctamente ahora mismo.",
    openaiRateLimit:
      "El asistente de IA esta ocupado. Intentalo de nuevo en breve.",
    openaiUnavailable: "El asistente de IA no esta disponible temporalmente.",
    emptyResponse: "El asistente de IA no pudo generar una respuesta.",
    responseIncomplete:
      "La respuesta termino antes de lo esperado. Puedes intentarlo otra vez.",
    serverError: "El asistente de IA no pudo responder ahora mismo.",
  },
  it: {
    disabled: "L'assistente AI non e disponibile al momento.",
    missingApiKey: "L'assistente AI non e disponibile al momento.",
    invalidRequest: "Invia una richiesta valida per l'assistente.",
    rateLimited: "Troppe richieste. Riprova tra poco.",
    auth: "L'assistente AI non e configurato correttamente in questo momento.",
    openaiRateLimit: "L'assistente AI e occupato. Riprova tra poco.",
    openaiUnavailable: "L'assistente AI e temporaneamente non disponibile.",
    emptyResponse: "L'assistente AI non ha prodotto una risposta.",
    responseIncomplete:
      "La risposta si e interrotta prima del previsto. Puoi riprovare.",
    serverError: "L'assistente AI non ha potuto rispondere ora.",
  },
  pt: {
    disabled: "O assistente de IA esta indisponivel neste momento.",
    missingApiKey: "O assistente de IA esta indisponivel neste momento.",
    invalidRequest: "Envia um pedido valido para o assistente.",
    rateLimited: "Demasiados pedidos. Tenta novamente daqui a pouco.",
    auth: "O assistente de IA nao esta configurado corretamente neste momento.",
    openaiRateLimit:
      "O assistente de IA esta ocupado. Tenta novamente daqui a pouco.",
    openaiUnavailable: "O assistente de IA esta temporariamente indisponivel.",
    emptyResponse: "O assistente de IA nao conseguiu produzir uma resposta.",
    responseIncomplete:
      "A resposta terminou mais cedo do que esperado. Podes tentar novamente.",
    serverError: "O assistente de IA nao conseguiu responder agora.",
  },
  nl: {
    disabled: "De AI-assistent is momenteel niet beschikbaar.",
    missingApiKey: "De AI-assistent is momenteel niet beschikbaar.",
    invalidRequest: "Stuur een geldig assistentverzoek.",
    rateLimited: "Te veel assistentverzoeken. Probeer het zo opnieuw.",
    auth: "De AI-assistent is momenteel niet juist geconfigureerd.",
    openaiRateLimit: "De AI-assistent is bezig. Probeer het zo opnieuw.",
    openaiUnavailable: "De AI-assistent is tijdelijk niet beschikbaar.",
    emptyResponse: "De AI-assistent kon geen antwoord maken.",
    responseIncomplete:
      "Het antwoord stopte eerder dan verwacht. Je kunt het opnieuw proberen.",
    serverError: "De AI-assistent kon nu niet antwoorden.",
  },
  pl: {
    disabled: "Asystent AI jest teraz niedostepny.",
    missingApiKey: "Asystent AI jest teraz niedostepny.",
    invalidRequest: "Wyslij poprawne zapytanie do asystenta.",
    rateLimited: "Za duzo zapytan. Sprobuj ponownie za chwile.",
    auth: "Asystent AI nie jest teraz poprawnie skonfigurowany.",
    openaiRateLimit: "Asystent AI jest zajety. Sprobuj ponownie za chwile.",
    openaiUnavailable: "Asystent AI jest tymczasowo niedostepny.",
    emptyResponse: "Asystent AI nie mogl przygotowac odpowiedzi.",
    responseIncomplete:
      "Odpowiedz zakonczyla sie wczesniej niz oczekiwano. Sprobuj ponownie.",
    serverError: "Asystent AI nie mogl teraz odpowiedziec.",
  },
};

export function getAssistantErrorMessage(
  locale: Locale,
  code: AssistantErrorCode,
) {
  return messages[locale][code];
}

export function getAssistantPublicErrorCode(code: AssistantErrorCode) {
  if (code === "disabled" || code === "missingApiKey") {
    return "assistant_disabled";
  }
  if (code === "invalidRequest") return "invalid_request";
  if (code === "rateLimited") return "rate_limited";
  if (code === "openaiRateLimit") return "openai_rate_limit";
  if (code === "openaiUnavailable" || code === "auth") {
    return "assistant_unavailable";
  }
  if (code === "emptyResponse") return "assistant_unavailable";
  if (code === "responseIncomplete") return "response_incomplete";

  return "generic_error";
}
