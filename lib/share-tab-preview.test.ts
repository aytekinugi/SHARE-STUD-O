import { describe, expect, it } from "vitest";
import { firstTabHostnames } from "./share-tab-preview";

describe("firstTabHostnames", () => {
  it("parses hosts in order up to max", () => {
    expect(
      firstTabHostnames(["https://a.com/x", "https://b.com", "https://c.com/d"], 2)
    ).toEqual([
      { rank: 1, host: "a.com" },
      { rank: 2, host: "b.com" }
    ]);
  });

  it("handles invalid url", () => {
    expect(firstTabHostnames(["not-a-url"], 1)).toEqual([{ rank: 1, host: "(geçersiz URL)" }]);
  });
});
