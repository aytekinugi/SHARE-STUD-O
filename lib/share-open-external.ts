import { shareUxLog } from "@/lib/share-observability";

export function openShareExternal(href: string) {
  try {
    const u = new URL(href);
    const w = window.open(href, "_blank", "noopener,noreferrer");
    if (!w || w.closed) {
      shareUxLog("window_open_suspect_blocked", { host: u.host, scheme: u.protocol });
    }
  } catch (err) {
    shareUxLog("window_open_error", { message: err instanceof Error ? err.message : String(err) });
  }
}
