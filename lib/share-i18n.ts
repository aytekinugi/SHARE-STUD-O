import shareEn from "@/messages/en/share.json";
import shareTr from "@/messages/tr/share.json";

export type ShareLocale = "tr" | "en";
export type ShareMessages = typeof shareTr;

export const SHARE_LOCALE_KEY = "vanguard-share-locale";
export const SHARE_SELECTED_IDS_KEY = "vanguard-share-selected-ids";

export function getShareMessages(locale: ShareLocale): ShareMessages {
  return locale === "en" ? shareEn : shareTr;
}

export function readStoredShareLocale(): ShareLocale | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(SHARE_LOCALE_KEY);
  return v === "en" || v === "tr" ? v : null;
}

export function writeStoredShareLocale(locale: ShareLocale): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SHARE_LOCALE_KEY, locale);
}

export function inferBrowserShareLocale(): ShareLocale {
  if (typeof navigator === "undefined") return "tr";
  const lang = navigator.language?.toLowerCase() ?? "";
  return lang.startsWith("en") ? "en" : "tr";
}
