export type ChannelCharLimit = {
  id: string;
  labelKey: string;
  maxChars: number;
};

/** Yaklaşık platform kutusu limitleri — intent URL kısaltmaları ayrıca uygulanır. */
export const SHARE_CHANNEL_CHAR_LIMITS: ChannelCharLimit[] = [
  { id: "x", labelKey: "x", maxChars: 280 },
  { id: "sm", labelKey: "sm", maxChars: 160 },
  { id: "bs", labelKey: "bs", maxChars: 290 },
  { id: "md", labelKey: "md", maxChars: 500 },
  { id: "tg", labelKey: "tg", maxChars: 1024 },
  { id: "hn", labelKey: "hn", maxChars: 80 }
];

export type ChannelLimitWarning = {
  id: string;
  label: string;
  maxChars: number;
  current: number;
  over: boolean;
};

export function channelLimitWarnings(
  assembledLength: number,
  selected: Set<string>,
  labels: Record<string, string>
): ChannelLimitWarning[] {
  const out: ChannelLimitWarning[] = [];
  for (const lim of SHARE_CHANNEL_CHAR_LIMITS) {
    if (!selected.has(lim.id)) continue;
    const label = labels[lim.id] ?? lim.id;
    out.push({
      id: lim.id,
      label,
      maxChars: lim.maxChars,
      current: assembledLength,
      over: assembledLength > lim.maxChars
    });
  }
  return out;
}
