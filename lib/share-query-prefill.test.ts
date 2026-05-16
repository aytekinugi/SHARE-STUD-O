import { describe, expect, it } from "vitest";
import { parseShareQueryPrefill } from "./share-query-prefill";

describe("parseShareQueryPrefill", () => {
  it("reads title, text, url, quest, lang", () => {
    const q = parseShareQueryPrefill("?title=T&text=Body&url=https://x.dev&quest=abc&lang=en");
    expect(q.title).toBe("T");
    expect(q.text).toBe("Body");
    expect(q.url).toBe("https://x.dev");
    expect(q.questId).toBe("abc");
    expect(q.lang).toBe("en");
  });

  it("accepts body and link aliases", () => {
    const q = parseShareQueryPrefill("?body=Hi&link=https://a.com");
    expect(q.text).toBe("Hi");
    expect(q.url).toBe("https://a.com");
  });
});
