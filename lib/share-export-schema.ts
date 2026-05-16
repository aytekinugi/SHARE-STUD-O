import { z } from "zod";
import { ALL_CHANNEL_IDS, DEFAULT_SELECTED } from "@/components/share/share-channels-config";
import { DEFAULT_CHANNEL_ORDER } from "@/lib/share-channel-order";

const channelId = z.string().refine((id) => ALL_CHANNEL_IDS.includes(id));

export const shareDraftSchema = z.object({
  v: z.literal(1),
  title: z.string().max(500),
  text: z.string().max(20_000),
  textB: z.string().max(20_000).optional(),
  activeVariant: z.enum(["a", "b"]).optional(),
  url: z.string().max(2000),
  hashtags: z.string().max(2000),
  cta: z.string().max(2000),
  warmClose: z.boolean(),
  mastodonHost: z.string().max(200),
  pinterestMedia: z.string().max(2000),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(200).optional(),
  selectedIds: z.array(channelId).min(1).max(ALL_CHANNEL_IDS.length),
  channelOrder: z.array(channelId).min(1)
});

export const shareExportPackSchema = shareDraftSchema.extend({
  exportedAt: z.string().min(1)
});

export type ShareDraftParsed = z.infer<typeof shareDraftSchema>;

export function parseShareExportPackZod(raw: unknown) {
  const parsed = shareExportPackSchema.safeParse(raw);
  if (!parsed.success) return null;
  const p = parsed.data;
  const valid = new Set(ALL_CHANNEL_IDS);
  const selectedIds = p.selectedIds.filter((id) => valid.has(id));
  const channelOrder = p.channelOrder.filter((id) => valid.has(id));
  for (const id of DEFAULT_CHANNEL_ORDER) {
    if (!channelOrder.includes(id)) channelOrder.push(id);
  }
  return {
    ...p,
    selectedIds: selectedIds.length > 0 ? selectedIds : [...DEFAULT_SELECTED],
    channelOrder
  };
}
