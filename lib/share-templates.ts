import type { ShareDraftV1 } from "@/lib/share-draft";
import { DEFAULT_CHANNEL_ORDER } from "@/lib/share-channel-order";

export type ShareTemplateId = "productLaunch" | "liveStream";

export type ShareTemplateDef = {
  id: ShareTemplateId;
  /** Applies to draft fields */
  apply: (locale: "tr" | "en") => Omit<ShareDraftV1, "v">;
};

const PRIMARY_IDS = ["ig", "wa", "yt", "li", "x"] as const;

function baseDraft(_locale: "tr" | "en", partial: Partial<Omit<ShareDraftV1, "v">>): Omit<ShareDraftV1, "v"> {
  return {
    title: partial.title ?? "",
    text: partial.text ?? "",
    url: partial.url ?? "",
    hashtags: partial.hashtags ?? "",
    cta: partial.cta ?? "",
    warmClose: partial.warmClose ?? true,
    mastodonHost: partial.mastodonHost ?? "mastodon.social",
    pinterestMedia: partial.pinterestMedia ?? "",
    selectedIds: [...PRIMARY_IDS],
    channelOrder: [...DEFAULT_CHANNEL_ORDER],
    ...partial
  };
}

export const SHARE_TEMPLATES: ShareTemplateDef[] = [
  {
    id: "productLaunch",
    apply: (locale) =>
      locale === "en"
        ? baseDraft("en", {
            title: "New drop",
            text: "Something new just landed — link in bio 👇",
            hashtags: "#launch #new",
            cta: "Tap the link — limited run",
            selectedIds: ["ig", "wa", "yt", "li", "x", "fb", "tg"]
          })
        : baseDraft("tr", {
            title: "Yeni ürün",
            text: "Yeni ürün yayında — detaylar linkte 👇",
            hashtags: "#yeniürün #kampanya",
            cta: "Linke tıkla — stoklar sınırlı",
            selectedIds: ["ig", "wa", "yt", "li", "x", "fb", "tg"]
          })
  },
  {
    id: "liveStream",
    apply: (locale) =>
      locale === "en"
        ? baseDraft("en", {
            title: "Live now",
            text: "We're live — join us!",
            hashtags: "#live #streaming",
            cta: "Watch here 👇",
            selectedIds: ["ig", "wa", "yt", "x", "tg", "bs"]
          })
        : baseDraft("tr", {
            title: "Canlı yayın",
            text: "Canlıdayız — katıl!",
            hashtags: "#canlı #yayın",
            cta: "Buradan izle 👇",
            selectedIds: ["ig", "wa", "yt", "x", "tg", "bs"]
          })
  }
];
