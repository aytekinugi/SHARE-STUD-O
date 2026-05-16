import { describe, expect, it } from "vitest";
import { suggestHashtagsForQuest } from "@/lib/share-quest-hashtags";

describe("suggestHashtagsForQuest", () => {
  it("includes category tags", () => {
    const tags = suggestHashtagsForQuest("str", 50);
    expect(tags).toContain("#StrengthQuest");
  });

  it("adds epic tag for high difficulty", () => {
    const tags = suggestHashtagsForQuest("int", 150);
    expect(tags).toContain("#EpicQuest");
  });
});
