import { describe, expect, it } from "vitest";
import { interpolateShare } from "./share-template";

describe("interpolateShare", () => {
  it("replaces placeholders", () => {
    expect(interpolateShare("{{a}}-{{b}}", { a: 1, b: "x" })).toBe("1-x");
  });
});
