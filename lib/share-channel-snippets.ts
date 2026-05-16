import { SHARE_CHANNEL_CHAR_LIMITS } from "@/lib/share-channel-limits";
import { composeShareBody, type SharePayload } from "@/lib/share-links";

export type ChannelSnippet = {
  id: string;
  label: string;
  maxChars: number | null;
  text: string;
  truncated: boolean;
};

function truncateBody(text: string, max: number): { text: string; truncated: boolean } {
  if (text.length <= max) return { text, truncated: false };
  return { text: `${text.slice(0, Math.max(0, max - 1))}…`, truncated: true };
}

export function channelSnippetsForSelection(
  payload: SharePayload,
  selected: Set<string>,
  labels: Record<string, string>
): ChannelSnippet[] {
  const full = composeShareBody(payload);
  const limitById = new Map(SHARE_CHANNEL_CHAR_LIMITS.map((l) => [l.id, l.maxChars]));
  const out: ChannelSnippet[] = [];

  for (const id of selected) {
    const max = limitById.get(id);
    if (!max) continue;
    const { text, truncated } = truncateBody(full, max);
    out.push({
      id,
      label: labels[id] ?? id,
      maxChars: max,
      text,
      truncated
    });
  }
  return out;
}
