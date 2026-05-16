import { shareUxLog } from "@/lib/share-observability";

/** `window.open` başarılıysa true; popup engellendiyse false. */
export function openShareExternal(href: string): boolean {
  try {
    const u = new URL(href);
    const w = window.open(href, "_blank", "noopener,noreferrer");
    const blocked = !w || w.closed;
    if (blocked) {
      shareUxLog("window_open_blocked", { host: u.host, scheme: u.protocol });
    }
    return !blocked;
  } catch (err) {
    shareUxLog("window_open_error", { message: err instanceof Error ? err.message : String(err) });
    return false;
  }
}
