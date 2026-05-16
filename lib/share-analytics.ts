import { SHARE_DATALAYER_EVENT_SCHEMA } from "@/lib/share-analytics-events";

/** Google Tag Manager / gtag uyumlu dataLayer — PII ve tam metin yok. */
export function pushShareDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  type Win = Window & { dataLayer?: unknown[] };
  const w = window as Win;
  w.dataLayer = w.dataLayer ?? [];
  const row = { event: SHARE_DATALAYER_EVENT_SCHEMA.event, ...payload };
  w.dataLayer.push(row);
  if (isShareDebugMode()) {
    console.info("[vanguard-share-debug] dataLayer", row);
  }
}

export function isShareDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV === "development") return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "share") return true;
    return window.localStorage.getItem("vanguard-share-debug") === "1";
  } catch {
    return false;
  }
}
