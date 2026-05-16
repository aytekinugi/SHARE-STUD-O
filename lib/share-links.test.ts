import { describe, expect, it } from "vitest";
import {
  blueskyCompose,
  composeShareBody,
  facebookSharer,
  linkedInShare,
  mastodonShare,
  twitterIntent,
  whatsappSend
} from "./share-links";

describe("share-links", () => {
  it("composeShareBody merges title, text, url", () => {
    expect(
      composeShareBody({
        title: "A",
        text: "B",
        url: "https://example.com/x"
      })
    ).toBe("A\n\nB\n\nhttps://example.com/x");
  });

  it("drops empty optional title", () => {
    expect(
      composeShareBody({
        text: "solo",
        url: "https://x.dev"
      })
    ).toBe("solo\n\nhttps://x.dev");
  });

  it("builds intents with encoded params", () => {
    const p = { title: "Hi & co", text: "Line1", url: "https://a.com?q=1" };
    expect(twitterIntent(p)).toContain("twitter.com/intent/tweet");
    expect(facebookSharer(p.url)).toContain("facebook.com/sharer/");
    expect(linkedInShare(p.url)).toContain("linkedin.com/sharing/");
    expect(blueskyCompose(p)).toContain("bsky.app");
    expect(mastodonShare("mastodon.social", p)).toContain("mastodon.social");
  });

  it("builds stable intent URLs for a fixed payload", () => {
    const p = { title: "T", text: "Hello world", url: "https://example.com/path" };
    const body = composeShareBody(p);
    expect(twitterIntent(p)).toBe(`https://twitter.com/intent/tweet?text=${encodeURIComponent(body)}`);
    expect(whatsappSend(p)).toBe(`https://api.whatsapp.com/send?text=${encodeURIComponent(body)}`);
    expect(linkedInShare(p.url)).toBe(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(p.url)}`
    );
    expect(mastodonShare("mastodon.social", p)).toBe(
      `https://mastodon.social/share?text=${encodeURIComponent(body.slice(0, 470))}`
    );
  });
});
