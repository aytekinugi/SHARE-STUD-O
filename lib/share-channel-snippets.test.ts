import { describe, expect, it } from "vitest";
import { channelSnippetsForSelection } from "@/lib/share-channel-snippets";

describe("channelSnippetsForSelection", () => {
  it("truncates when over channel limit", () => {
    const long = "x".repeat(400);
    const snippets = channelSnippetsForSelection(
      { text: long, url: "https://example.com" },
      new Set(["x"]),
      { x: "X" }
    );
    expect(snippets.length).toBe(1);
    expect(snippets[0]?.truncated).toBe(true);
    expect(snippets[0]!.text.length).toBeLessThanOrEqual(280);
  });
});
