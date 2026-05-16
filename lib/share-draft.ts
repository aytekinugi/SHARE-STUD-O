import { ALL_CHANNEL_IDS, DEFAULT_SELECTED } from "@/components/share/share-channels-config";
import { DEFAULT_CHANNEL_ORDER, SHARE_CHANNEL_ORDER_KEY } from "@/lib/share-channel-order";
import { BATCH_PREVIEW_SKIP_KEY } from "@/hooks/use-share-batch";
import { SHARE_LOCALE_KEY, SHARE_SELECTED_IDS_KEY } from "@/lib/share-i18n";
import { clearChannelOpens } from "@/lib/share-channel-opens";
import { parseShareExportPackZod } from "@/lib/share-export-schema";

export const SHARE_DRAFT_KEY = "vanguard-share-draft";

export type ShareDraftV1 = {
  v: 1;
  title: string;
  text: string;
  textB?: string;
  activeVariant?: "a" | "b";
  url: string;
  hashtags: string;
  cta: string;
  warmClose: boolean;
  mastodonHost: string;
  pinterestMedia: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  selectedIds: string[];
  channelOrder: string[];
};

export type ShareExportPack = ShareDraftV1 & {
  exportedAt: string;
};

export function readShareDraft(): ShareDraftV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SHARE_DRAFT_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as ShareDraftV1;
    if (p?.v !== 1) return null;
    return p;
  } catch {
    return null;
  }
}

export function writeShareDraft(draft: Omit<ShareDraftV1, "v">): void {
  if (typeof window === "undefined") return;
  const payload: ShareDraftV1 = { v: 1, ...draft };
  window.localStorage.setItem(SHARE_DRAFT_KEY, JSON.stringify(payload));
}

export function clearAllShareStorage(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SHARE_DRAFT_KEY);
  window.localStorage.removeItem(SHARE_SELECTED_IDS_KEY);
  window.localStorage.removeItem(SHARE_CHANNEL_ORDER_KEY);
  clearChannelOpens();
  if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(BATCH_PREVIEW_SKIP_KEY);
}

export function parseShareExportPack(json: string): ShareExportPack | null {
  try {
    const raw = JSON.parse(json) as unknown;
    const zod = parseShareExportPackZod(raw);
    if (zod) {
      return { ...zod, exportedAt: zod.exportedAt ?? new Date().toISOString() };
    }
    const p = raw as ShareExportPack;
    if (p?.v !== 1) return null;
    const valid = new Set(ALL_CHANNEL_IDS);
    const selectedIds = (p.selectedIds ?? []).filter((id) => valid.has(id));
    const channelOrder = (p.channelOrder ?? [...DEFAULT_CHANNEL_ORDER]).filter((id) => valid.has(id));
    for (const id of DEFAULT_CHANNEL_ORDER) {
      if (!channelOrder.includes(id)) channelOrder.push(id);
    }
    return {
      v: 1,
      title: String(p.title ?? ""),
      text: String(p.text ?? ""),
      textB: p.textB ? String(p.textB) : undefined,
      activeVariant: p.activeVariant === "b" ? "b" : "a",
      url: String(p.url ?? ""),
      hashtags: String(p.hashtags ?? ""),
      cta: String(p.cta ?? ""),
      warmClose: p.warmClose !== false,
      mastodonHost: String(p.mastodonHost ?? "mastodon.social"),
      pinterestMedia: String(p.pinterestMedia ?? ""),
      utmSource: p.utmSource,
      utmMedium: p.utmMedium,
      utmCampaign: p.utmCampaign,
      selectedIds: selectedIds.length > 0 ? selectedIds : [...DEFAULT_SELECTED],
      channelOrder,
      exportedAt: p.exportedAt ?? new Date().toISOString()
    };
  } catch {
    return null;
  }
}

export function buildShareExportPack(draft: Omit<ShareDraftV1, "v">): ShareExportPack {
  return { v: 1, ...draft, exportedAt: new Date().toISOString() };
}
