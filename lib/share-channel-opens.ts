export const SHARE_CHANNEL_OPENS_KEY = "vanguard-share-channel-opens";

export type ChannelOpenMap = Record<string, string>;

export function readChannelOpens(): ChannelOpenMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SHARE_CHANNEL_OPENS_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as ChannelOpenMap;
    return p && typeof p === "object" ? p : {};
  } catch {
    return {};
  }
}

export function recordChannelOpen(channelId: string): void {
  if (typeof window === "undefined") return;
  const map = readChannelOpens();
  map[channelId] = new Date().toISOString();
  window.localStorage.setItem(SHARE_CHANNEL_OPENS_KEY, JSON.stringify(map));
}

export function unopenedSelectedChannels(selected: Set<string>, withinHours = 168): string[] {
  const map = readChannelOpens();
  const cutoff = Date.now() - withinHours * 60 * 60 * 1000;
  const out: string[] = [];
  for (const id of selected) {
    const ts = map[id];
    if (!ts) {
      out.push(id);
      continue;
    }
    const t = Date.parse(ts);
    if (Number.isNaN(t) || t < cutoff) out.push(id);
  }
  return out;
}

export function clearChannelOpens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SHARE_CHANNEL_OPENS_KEY);
}
