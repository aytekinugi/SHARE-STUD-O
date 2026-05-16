/**
 * Tek kaynak: kanal id sırası (`ShareStudio` PRIMARY/EXTRA kartlarıyla aynı olmalı).
 */
export const SHARE_PRIMARY_ORDER = ["ig", "wa", "yt", "fb-mp", "li"] as const;
export const SHARE_EXTRA_ORDER = [
  "x",
  "fb",
  "tg",
  "rd",
  "pi",
  "tb",
  "vk",
  "line",
  "hn",
  "wb",
  "sk",
  "bs",
  "em",
  "sm",
  "md"
] as const;

export const DEFAULT_CHANNEL_ORDER: readonly string[] = [...SHARE_PRIMARY_ORDER, ...SHARE_EXTRA_ORDER];

export const SHARE_CHANNEL_ORDER_KEY = "vanguard-share-channel-order";

export type ShareKnownChannelId = (typeof SHARE_PRIMARY_ORDER)[number] | (typeof SHARE_EXTRA_ORDER)[number];

export function readStoredChannelOrder(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SHARE_CHANNEL_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const valid = new Set(DEFAULT_CHANNEL_ORDER);
    const out: string[] = [];
    for (const id of parsed) {
      if (typeof id === "string" && valid.has(id) && !out.includes(id)) out.push(id);
    }
    for (const id of DEFAULT_CHANNEL_ORDER) {
      if (!out.includes(id)) out.push(id);
    }
    return out.length === DEFAULT_CHANNEL_ORDER.length ? out : null;
  } catch {
    return null;
  }
}

export function writeStoredChannelOrder(order: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SHARE_CHANNEL_ORDER_KEY, JSON.stringify(order));
}

export function orderedChannelIds(selected: Set<string>, order: readonly string[] = DEFAULT_CHANNEL_ORDER): string[] {
  const out: string[] = [];
  for (const id of order) {
    if (selected.has(id)) out.push(id);
  }
  return out;
}

export function reorderChannelIds(order: string[], draggedId: string, targetId: string): string[] {
  if (draggedId === targetId) return order;
  const next = order.filter((id) => id !== draggedId);
  const idx = next.indexOf(targetId);
  if (idx === -1) return order;
  next.splice(idx, 0, draggedId);
  return next;
}

export function dedupeUrlsOrdered(hrefs: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of hrefs) {
    const h = raw.trim();
    if (!h || seen.has(h)) continue;
    seen.add(h);
    out.push(h);
  }
  return out;
}

export function normalizeMastodonHost(raw: string): string {
  const t = raw.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
  return t || "mastodon.social";
}

export function normalizeClipboardCompare(s: string): string {
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function clipboardSnippetsLikelyMatch(fullExpected: string, clipboardText: string, maxLen = 280): boolean {
  const exp = normalizeClipboardCompare(fullExpected).slice(0, maxLen).trimEnd();
  const got = normalizeClipboardCompare(clipboardText).slice(0, maxLen).trimEnd();
  return exp === got;
}

export function formatRemainingUrlsForClipboard(rest: string[]): string {
  if (rest.length === 0) return "";
  const lines = rest.map((u) => u.trim()).filter(Boolean);
  return [`Kalan sekmeler (${lines.length}) — tek tek adres çubuğuna yapıştırabilirsin:`, "", ...lines].join("\n");
}

export function clampOpenTabCount(openFirstRaw: number, totalTabs: number): number {
  if (totalTabs <= 0) return 0;
  const n = Math.floor(Number(openFirstRaw) || totalTabs);
  return Math.min(totalTabs, Math.max(1, n));
}
