import { describe, expect, it } from "vitest";
import {
  clipboardSnippetsLikelyMatch,
  dedupeUrlsOrdered,
  clampOpenTabCount,
  formatRemainingUrlsForClipboard,
  normalizeMastodonHost,
  orderedChannelIds,
  reorderChannelIds,
  SHARE_EXTRA_ORDER,
  SHARE_PRIMARY_ORDER
} from "./share-channel-order";

describe("share-channel-order", () => {
  it("orderedChannelIds returns primary-before-extra deterministic order", () => {
    const sel = new Set<string>(["li", "ig", "x", "tg"]);
    expect(orderedChannelIds(sel)).toEqual(["ig", "li", "x", "tg"]);
  });

  it("orderedChannelIds respects custom order", () => {
    const sel = new Set<string>(["x", "ig", "li"]);
    const custom = ["x", "wa", "ig", "li", "yt"];
    expect(orderedChannelIds(sel, custom)).toEqual(["x", "ig", "li"]);
    expect([...SHARE_PRIMARY_ORDER]).toContain("fb-mp");
    expect([...SHARE_EXTRA_ORDER]).toContain("md");
  });

  it("dedupeUrlsOrdered preserves first occurrence order", () => {
    expect(dedupeUrlsOrdered([" https://a.com ", "https://a.com", "https://b.com"])).toEqual(["https://a.com", "https://b.com"]);
  });

  it("normalizeMastodonHost trims scheme/trailing slash", () => {
    expect(normalizeMastodonHost("  https://example.social/")).toBe("example.social");
    expect(normalizeMastodonHost("   \n")).toBe("mastodon.social");
  });

  it("clipboardSnippetsLikelyMatch handles CRLF", () => {
    const expected = `line1\r\n\r\nhttps://example.com/page`;
    const clip = `line1\n\nhttps://example.com/page`;
    expect(clipboardSnippetsLikelyMatch(expected, clip, 80)).toBe(true);
  });

  it("formatRemainingUrlsForClipboard lists urls", () => {
    expect(formatRemainingUrlsForClipboard(["https://a", "https://b"])).toContain("https://a");
    expect(formatRemainingUrlsForClipboard([])).toBe("");
  });

  it("reorderChannelIds moves dragged before target", () => {
    const order = ["ig", "wa", "yt", "li", "x"];
    expect(reorderChannelIds(order, "x", "ig")).toEqual(["x", "ig", "wa", "yt", "li"]);
  });

  it("clampOpenTabCount", () => {
    expect(clampOpenTabCount(0, 3)).toBe(3);
    expect(clampOpenTabCount(-5, 3)).toBe(1);
    expect(clampOpenTabCount(99, 3)).toBe(3);
    expect(clampOpenTabCount(2, 5)).toBe(2);
  });
});
