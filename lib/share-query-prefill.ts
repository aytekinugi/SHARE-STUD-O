export type ShareQueryPrefill = {
  title?: string;
  text?: string;
  url?: string;
  hashtags?: string;
  cta?: string;
  questId?: string;
  lang?: "tr" | "en";
};

export function parseShareQueryPrefill(search: string): ShareQueryPrefill {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const pick = (key: string) => {
    const v = params.get(key);
    return v?.trim() ? v.trim() : undefined;
  };
  return {
    title: pick("title"),
    text: pick("text") ?? pick("body"),
    url: pick("url") ?? pick("link"),
    hashtags: pick("hashtags") ?? pick("tags"),
    cta: pick("cta"),
    questId: pick("quest") ?? pick("questId") ?? pick("campaign"),
    lang: pick("lang") as "tr" | "en" | undefined
  };
}
