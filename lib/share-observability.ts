/**
 * Paylaşım merkezi için hafif istemci gözlemlenebilirliği.
 * Konsolda [vanguard-share] önekiyle filtreleyebilirsin; metin gövdesi asla loglanmaz.
 */
const TAG = "[vanguard-share]";

function trimPayload(data?: Record<string, unknown>): Record<string, unknown> {
  if (!data) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    if (typeof v === "string" && v.length > 120) out[k] = `${v.slice(0, 80)}…(${v.length} chars)`;
    else out[k] = v;
  }
  return out;
}

export function shareUxLog(event: string, data?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const row = { event, ...trimPayload(data), t: new Date().toISOString() };
  const verbose =
    process.env.NODE_ENV === "development" ||
    (() => {
      try {
        return new URLSearchParams(window.location.search).get("debug") === "share";
      } catch {
        return false;
      }
    })();
  if (verbose) console.debug(TAG, row);
  else console.info(TAG, JSON.stringify(row));
}
