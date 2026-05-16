export type UtmParams = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
};

export function appendUtmParams(url: string, utm: UtmParams): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  try {
    const u = new URL(trimmed);
    if (utm.source) u.searchParams.set("utm_source", utm.source);
    if (utm.medium) u.searchParams.set("utm_medium", utm.medium);
    if (utm.campaign) u.searchParams.set("utm_campaign", utm.campaign);
    if (utm.content) u.searchParams.set("utm_content", utm.content);
    return u.toString();
  } catch {
    return trimmed;
  }
}

export function defaultUtmForQuest(questId: string | undefined): UtmParams {
  return {
    source: "vanguard",
    medium: "share",
    campaign: questId ? `quest_${questId.slice(0, 8)}` : "share_studio",
    content: "share_hub"
  };
}
