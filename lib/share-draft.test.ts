import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildShareExportPack, parseShareExportPack, readShareDraft, writeShareDraft } from "./share-draft";

function mockStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => map.delete(k),
    setItem: (k, v) => map.set(k, v)
  };
}

describe("share-draft", () => {
  beforeEach(() => {
    const store = mockStorage();
    vi.stubGlobal("localStorage", store);
    vi.stubGlobal("window", { localStorage: store } as Window & typeof globalThis);
  });

  it("round-trips draft v1", () => {
    writeShareDraft({
      title: "A",
      text: "B",
      url: "https://x.dev",
      hashtags: "#t",
      cta: "Go",
      warmClose: true,
      mastodonHost: "mastodon.social",
      pinterestMedia: "",
      selectedIds: ["ig", "wa"],
      channelOrder: ["ig", "wa", "yt"]
    });
    const d = readShareDraft();
    expect(d?.title).toBe("A");
    expect(d?.selectedIds).toEqual(["ig", "wa"]);
  });

  it("parses export pack", () => {
    const pack = buildShareExportPack({
      title: "X",
      text: "Y",
      url: "",
      hashtags: "",
      cta: "",
      warmClose: false,
      mastodonHost: "mastodon.social",
      pinterestMedia: "",
      selectedIds: ["ig"],
      channelOrder: ["ig"]
    });
    const parsed = parseShareExportPack(JSON.stringify(pack));
    expect(parsed?.title).toBe("X");
    expect(parsed?.exportedAt).toBeTruthy();
  });
});
