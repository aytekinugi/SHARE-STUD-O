import appEn from "@/messages/en/app.json";
import appTr from "@/messages/tr/app.json";

export type AppLocale = "tr" | "en";
export type AppMessages = typeof appTr;

const APP_LOCALE_KEY = "vanguard-app-locale";

export function getAppMessages(locale: AppLocale): AppMessages {
  return locale === "en" ? appEn : appTr;
}

export function readStoredAppLocale(): AppLocale | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(APP_LOCALE_KEY);
  return v === "en" || v === "tr" ? v : null;
}

export function writeStoredAppLocale(locale: AppLocale): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APP_LOCALE_KEY, locale);
}

export function inferBrowserAppLocale(): AppLocale {
  if (typeof navigator === "undefined") return "tr";
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "tr";
}
