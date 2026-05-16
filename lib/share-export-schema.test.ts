import { describe, expect, it } from "vitest";
import { parseShareExportPackZod } from "@/lib/share-export-schema";

describe("parseShareExportPackZod", () => {
  it("accepts valid v1 pack", () => {
    const p = parseShareExportPackZod({
      v: 1,
      title: "T",
      text: "Body",
      url: "https://x.dev",
      hashtags: "",
      cta: "",
      warmClose: true,
      mastodonHost: "mastodon.social",
      pinterestMedia: "",
      selectedIds: ["ig"],
      channelOrder: ["ig", "wa"],
      exportedAt: new Date().toISOString()
    });
    expect(p?.title).toBe("T");
  });

  it("rejects invalid channel id", () => {
    const p = parseShareExportPackZod({
      v: 1,
      title: "",
      text: "",
      url: "",
      hashtags: "",
      cta: "",
      warmClose: true,
      mastodonHost: "x",
      pinterestMedia: "",
      selectedIds: ["not-a-channel"],
      channelOrder: ["ig"],
      exportedAt: "x"
    });
    expect(p).toBeNull();
  });
});
