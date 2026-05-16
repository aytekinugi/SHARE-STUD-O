import shareTrDefault from "@/messages/tr/share.json";

export const shareMessages = shareTrDefault;
export type ShareMessages = typeof shareTrDefault;

export function shareNotSentChecklistFrom(sc: ShareMessages): { title: string; items: string[] } {
  return {
    title: sc.notSentChecklist.title,
    items: [...sc.notSentChecklist.items]
  };
}

/** Turkish defaults for server / legacy callers. */
export function shareNotSentChecklist(): { title: string; items: string[] } {
  return shareNotSentChecklistFrom(shareMessages);
}
