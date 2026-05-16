import { describe, expect, it } from "vitest";
import {
  levelFromXp,
  progressPct,
  rewardForQuest,
  streakFlame,
  unlockedSkillCount,
  xpIntoLevel,
  XP_PER_LEVEL
} from "./gamification";
import type { Quest } from "./types";

describe("gamification", () => {
  it("levelFromXp ramps from level 1 with visible progress", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(XP_PER_LEVEL - 1)).toBe(1);
    expect(levelFromXp(XP_PER_LEVEL)).toBe(2);
    expect(levelFromXp(XP_PER_LEVEL * 3)).toBe(4);
  });

  it("xpIntoLevel and progressPct stay bounded", () => {
    expect(xpIntoLevel(XP_PER_LEVEL + 111)).toBe(111);
    expect(progressPct(111)).toBeGreaterThan(0);
    expect(progressPct(999999)).toBeLessThanOrEqual(100);
  });

  it("rewardForQuest applies boost when window active", () => {
    const q = { difficulty: 100 } as Pick<Quest, "difficulty">;
    const past = rewardForQuest(q, new Date(Date.now() - 1000).toISOString());
    expect(past.boosted).toBe(false);
    const future = rewardForQuest(q, new Date(Date.now() + 60 * 60 * 1000).toISOString());
    expect(future.boosted).toBe(true);
    expect(future.xp).toBe(120);
  });

  it("unlockedSkillCount is deterministic across ranges", () => {
    expect(unlockedSkillCount(0)).toBe(1);
    expect(unlockedSkillCount(3)).toBe(2);
    expect(unlockedSkillCount(100)).toBe(12);
  });

  it("streakFlame buckets feel epic early", () => {
    expect(streakFlame(3)).toBe("ember");
    expect(streakFlame(7)).toBe("rare");
    expect(streakFlame(30)).toBe("legendary");
  });
});
