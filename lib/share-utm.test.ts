import { describe, expect, it } from "vitest";
import { appendUtmParams, defaultUtmForQuest } from "@/lib/share-utm";

describe("share-utm", () => {
  it("appends utm params", () => {
    const out = appendUtmParams("https://example.com/path", { source: "v", medium: "m", campaign: "c" });
    const u = new URL(out);
    expect(u.searchParams.get("utm_source")).toBe("v");
    expect(u.searchParams.get("utm_campaign")).toBe("c");
  });

  it("builds quest campaign id", () => {
    const utm = defaultUtmForQuest("abc-123-def");
    expect(utm.campaign).toContain("quest_");
  });
});
